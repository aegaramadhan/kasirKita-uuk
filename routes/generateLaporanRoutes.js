const express = require('express');
const router = express.Router();
const generateLaporanController = require('../controllers/generateLaporanController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

// Route untuk generate PDF laporan penjualan
router.get('/pdf', checkSession,checkRole("admin", "petugas"), generateLaporanController.getDaftarPenjualanPDF);

module.exports = router; 