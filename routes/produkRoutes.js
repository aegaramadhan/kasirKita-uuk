const produkController = require("../controllers/produkController");
const express = require("express");
const router = express.Router();
const checkSession = require("../middleware/checkSession");
const uploadImage = require("../middleware/uploadImage");
const checkRole = require("../middleware/checkRole");

// Routes untuk admin
router.get("/", checkSession, checkRole(['admin', 'petugas']), produkController.getDaftarProduk);

router.get("/tambah", checkSession, checkRole('admin'), produkController.getTambahProduk);

// Route untuk pelanggan
router.get("/pelanggan", checkSession, checkRole(['pelanggan', 'admin', 'petugas']), produkController.getDaftarProdukPelanggan);

// Routes untuk admin
router.get("/edit/:id", checkSession, checkRole('admin'), produkController.getEditProduk);

router.post("/tambah", checkSession, checkRole('admin'), uploadImage.single("foto"), produkController.tambahProduk);

router.post("/edit/:id", checkSession, checkRole('admin'), uploadImage.single("foto"), produkController.editProduk);

router.get("/delete/:id", checkSession, checkRole('admin'), produkController.deleteProduk);

module.exports = router;