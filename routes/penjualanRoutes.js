const express = require('express');
const router = express.Router();
const penjualanController = require('../controllers/penjualanController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

// Menampilkan daftar penjualan (admin)
router.get('/', checkSession, checkRole(['admin', 'petugas']), penjualanController.getDaftarPenjualan);

// Menambah penjualan baru (dari keranjang)
router.post('/tambah', checkSession, checkRole(['admin', 'petugas']), penjualanController.tambahPenjualan);

// Mendapatkan detail penjualan
router.get('/detail/:id', checkSession, checkRole(['admin', 'petugas']), penjualanController.getDetailPenjualan);

// Membatalkan penjualan
router.delete('/batal/:id', checkSession, checkRole(['admin', 'petugas', 'pelanggan']), penjualanController.batalkanPenjualan);

module.exports = router; 