const Produk = new require("../models/produkModel");
const path = require("path");
const fs = require("fs");
const produkController = {
    getDaftarProduk: async (req, res) => {
        try {
            const produkList = await Produk.find();
            res.render("daftarProduk", { 
                produkList,
                user: req.session.user 
            });
        } catch (error) {
            console.error("Error fetching produk list: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getTambahProduk: (req, res) => {
        try {
            res.render('formTambahProduk', {
                user: req.session.user
            });
        } catch (error) {
            console.error("Error fetching products", error);
            res.status(500).send("internal Server Error");
        }
    },

    tambahProduk: async (req, res) => {
        try {
            const { namaProduk, kategori, harga, stok, deskripsi } = req.body;
            const fotoPath = req.file ? req.file.filename : null;
            const produk = new Produk({
                foto: fotoPath,
                namaProduk,
                kategori,
                harga,
                stok,
                deskripsi
            });
            await produk.save();
            res.redirect('/produk');
        } catch (error) {
            console.error("Error adding product: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getEditProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const produk = await Produk.findById(produkId);
            res.render('formEditProduk', { 
                produk,
                user: req.session.user 
            });
        } catch (error) {
            console.error("error fetching product: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    editProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const { kategori, harga, stok, deskripsi } = req.body;
            const fotoPath = req.file ? req.file.filename : null;

            //Cari product bedasarkan Id
            const produk = await Produk.findById(produkId);
            if (!produk) {
                return res.status(404).send("Produk tidak ada Di dalam toko");
            }

            if (fotoPath && produk.foto) {
                const oldImagePath = path.join(__dirname, '../public/image', produk.foto);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
            }

            //Update hanya jika ada input baru,jika kosong tetap pakai nilai lama
            // produk.namaProduk = namaProduk || produk.namaProduk;
            produk.kategori = kategori || produk.kategori;
            produk.harga = harga || produk.harga;
            produk.stok = stok || produk.stok;
            produk.deskripsi = deskripsi || produk.deskripsi;
            produk.foto = fotoPath || produk.foto;

            //simpan perubahan ke database
            await produk.save();
            res.redirect('/produk');

        } catch (error) {
            console.error("Error editing product: ", error);
            res.status(500).send("Internal Server error");
        }
    },

    deleteProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const produk = await Produk.findById(produkId);

            if (!produk) {
                return res.status(404).send("Produk tidak ditemukan");
            }

            //Hapus gambar jika ada
            if (produk.foto) {
                const imagePath = path.join(__dirname, '../public/image', produk.foto);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            //Hapus produk dari database
            await Produk.findByIdAndDelete(produkId);

            res.redirect("/produk");
        } catch (error) {
            console.error("Error deleting product: ", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getDaftarProdukPelanggan: async (req, res) => {
        try {
            const produkList = await Produk.find({ stok: { $gt: 0} });
            res.render('daftarProdukPelanggan', { 
                produkList, 
                user: req.session.user 
            });
        } catch (error) {
            console.error("Error fetching produk list: ", error);
            res.status(500).send("Internal Server Error");
        }
    },
};

module.exports = produkController;