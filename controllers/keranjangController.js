const Keranjang = require('../models/keranjangModel');
const Produk = require('../models/produkModel');
const Penjualan = require('../models/penjualanModel');
const Pelanggan = require('../models/pelangganModel');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');

const keranjangController = {
    // Menampilkan keranjang
    getKeranjang: async (req, res) => {
        try {
            const items = await Keranjang.find({ pelanggan_id: req.session.user.id })
                .populate('produk_id');

            let totalHarga = 0;
            items.forEach(item => {
                totalHarga += item.produk_id.harga * item.jumlah;
            });

            res.render('keranjang', {
                items,
                totalHarga,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching keranjang:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Menambah item ke keranjang
    tambahKeKeranjang: async (req, res) => {
        try {
            const produk_id = req.params.produkId;
            const pelanggan_id = req.session.user.id;

            // Cek apakah produk ada di keranjang
            let keranjangItem = await Keranjang.findOne({ pelanggan_id, produk_id });

            if (keranjangItem) {
                // Jika sudah ada, tambah jumlahnya
                keranjangItem.jumlah += 1;
                await keranjangItem.save();
            } else {
                // Jika belum ada, buat item baru
                keranjangItem = new Keranjang({
                    pelanggan_id,
                    produk_id,
                    jumlah: 1
                });
                await keranjangItem.save();
            }

            res.redirect('/keranjang');
        } catch (error) {
            console.error('Error adding to keranjang:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Mengubah jumlah item
    updateJumlah: async (req, res) => {
        try {
            const { jumlah } = req.body;
            const itemId = req.params.itemId;

            if (jumlah < 1) {
                return res.status(400).send('Jumlah minimal 1');
            }

            const item = await Keranjang.findById(itemId);
            if (!item) {
                return res.status(404).send('Item tidak ditemukan');
            }

            // Cek stok
            const produk = await Produk.findById(item.produk_id);
            if (jumlah > produk.stok) {
                return res.status(400).send('Stok tidak mencukupi');
            }

            item.jumlah = jumlah;
            await item.save();

            res.status(200).send('Jumlah berhasil diupdate');
        } catch (error) {
            console.error('Error updating jumlah:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Menghapus item dari keranjang
    hapusItem: async (req, res) => {
        try {
            await Keranjang.findByIdAndDelete(req.params.itemId);
            res.status(200).send('Item berhasil dihapus');
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Checkout keranjang
    checkout: async (req, res) => {
        try {
            const user_id = req.session.user.id;
            console.log('Checkout started for user:', user_id);
            
            const items = await Keranjang.find({ pelanggan_id: user_id }).populate('produk_id');
            console.log('Items in cart:', items);

            if (items.length === 0) {
                return res.status(400).send('Keranjang kosong');
            }

            // Dapatkan data user
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).send('User tidak ditemukan');
            }
            console.log('User found:', user);

            // Dapatkan atau buat data pelanggan
            let pelanggan = await Pelanggan.findOne({ user_id: user_id });
            if (!pelanggan) {
                pelanggan = new Pelanggan({
                    namaPelanggan: user.akun.username,
                    user_id: user_id
                });
                await pelanggan.save();
            }
            console.log('Pelanggan:', pelanggan);

            // Buat satu penjualan untuk semua item
            const penjualanData = {
                pelanggan_id: pelanggan._id,
                items: items.map(item => ({
                    produk_id: item.produk_id._id,
                    jumlah: item.jumlah,
                    harga: item.produk_id.harga,
                    total: item.produk_id.harga * item.jumlah
                })),
                tanggalPenjualan: new Date(),
                totalHarga: items.reduce((total, item) => total + (item.produk_id.harga * item.jumlah), 0)
            };
            console.log('Penjualan data to be saved:', penjualanData);

            const penjualan = new Penjualan(penjualanData);

            // Update stok produk
            for (const item of items) {
                const produk = item.produk_id;
                if (produk.stok < item.jumlah) {
                    return res.status(400).send(`Stok ${produk.namaProduk} tidak mencukupi`);
                }
                produk.stok -= item.jumlah;
                await produk.save();
            }

            // Simpan penjualan
            const savedPenjualan = await penjualan.save();
            console.log('Penjualan saved successfully:', savedPenjualan);

            // Kosongkan keranjang
            await Keranjang.deleteMany({ pelanggan_id: user_id });
            console.log('Cart cleared');

            // Kirim ID penjualan
            res.json({ 
                success: true, 
                orderId: savedPenjualan._id 
            });
        } catch (error) {
            console.error('Error checkout:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = keranjangController; 