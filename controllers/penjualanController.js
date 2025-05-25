const Penjualan = require('../models/penjualanModel');
const Produk = require('../models/produkModel');
const Pelanggan = require('../models/pelangganModel');

const penjualanController = {
    // Menampilkan daftar semua penjualan (untuk admin)
    getDaftarPenjualan: async (req, res) => {
        try {
            console.log('Fetching all penjualan...');
            const penjualan = await Penjualan.find()
                .populate({
                    path: 'items.produk_id',
                    model: 'Produk',
                    select: 'namaProduk harga'
                })
                .populate({
                    path: 'pelanggan_id',
                    model: 'Pelanggan',
                    select: 'namaPelanggan user_id'
                })
                .sort({ tanggalPenjualan: -1 }); // Urutkan dari yang terbaru

            console.log('Penjualan data fetched:', JSON.stringify(penjualan, null, 2));

            res.render('daftarPenjualan', {
                penjualan,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching penjualan:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Menambah penjualan baru dari keranjang
    tambahPenjualan: async (req, res) => {
        try {
            const { items } = req.body; // Array of {produk_id, jumlah}
            const pelanggan_id = req.session.user.id;
            
            // Buat array untuk menyimpan semua item penjualan
            const penjualanItems = [];
            
            // Proses setiap item
            for (const item of items) {
                const produk = await Produk.findById(item.produk_id);
                
                // Cek stok
                if (produk.stok < item.jumlah) {
                    return res.status(400).send(`Stok ${produk.namaProduk} tidak mencukupi`);
                }

                // Kurangi stok
                produk.stok -= item.jumlah;
                await produk.save();

                // Tambahkan ke array penjualan
                penjualanItems.push({
                    produk_id: item.produk_id,
                    pelanggan_id,
                    jumlah: item.jumlah,
                    harga: produk.harga,
                    total: produk.harga * item.jumlah,
                    tanggalPenjualan: new Date()
                });
            }

            // Simpan semua penjualan
            await Penjualan.insertMany(penjualanItems);

            res.status(200).send('Penjualan berhasil');
        } catch (error) {
            console.error('Error adding penjualan:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Mendapatkan detail penjualan
    getDetailPenjualan: async (req, res) => {
        try {
            const penjualan = await Penjualan.findById(req.params.id)
                .populate({
                    path: 'items.produk_id',
                    model: 'Produk',
                    select: 'namaProduk harga'
                })
                .populate({
                    path: 'pelanggan_id',
                    model: 'Pelanggan',
                    select: 'namaPelanggan user_id'
                });

            if (!penjualan) {
                return res.status(404).send('Penjualan tidak ditemukan');
            }

            console.log('Detail penjualan:', JSON.stringify(penjualan, null, 2));

            res.render('detailPenjualan', {
                penjualan,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching penjualan detail:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Membatalkan penjualan
    batalkanPenjualan: async (req, res) => {
        try {
            const penjualan = await Penjualan.findById(req.params.id)
                .populate({
                    path: 'items.produk_id',
                    model: 'Produk'
                });
            
            if (!penjualan) {
                return res.status(404).send('Penjualan tidak ditemukan');
            }

            // Kembalikan stok untuk setiap item
            for (const item of penjualan.items) {
                const produk = await Produk.findById(item.produk_id._id);
                produk.stok += item.jumlah;
                await produk.save();
            }

            // Hapus penjualan
            await Penjualan.findByIdAndDelete(req.params.id);
            console.log('Penjualan deleted:', req.params.id);

            res.status(200).send('Penjualan dibatalkan');
        } catch (error) {
            console.error('Error canceling penjualan:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = penjualanController; 