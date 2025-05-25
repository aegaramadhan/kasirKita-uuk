const express = require('express');
const router = express.Router();
const keranjangController = require('../controllers/keranjangController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

// Menampilkan keranjang (pelanggan & admin untuk membantu pelanggan)
router.get('/', checkSession, checkRole(['pelanggan', 'admin']), keranjangController.getKeranjang);

// Menambah item ke keranjang (pelanggan & admin untuk membantu pelanggan)
router.post('/add/:produkId', checkSession, checkRole(['pelanggan', 'admin']), keranjangController.tambahKeKeranjang);

// Mengubah jumlah item di keranjang (pelanggan & admin untuk membantu pelanggan)
router.put('/update/:itemId', checkSession, checkRole(['pelanggan', 'admin']), keranjangController.updateJumlah);

// Menghapus item dari keranjang (pelanggan & admin untuk membantu pelanggan)
router.delete('/delete/:itemId', checkSession, checkRole(['pelanggan', 'admin']), keranjangController.hapusItem);

// Checkout keranjang (pelanggan & admin untuk membantu pelanggan)
router.post('/checkout', checkSession, checkRole(['pelanggan', 'admin']), keranjangController.checkout);

module.exports = router; 