const express = require('express');
const router = express.Router();
const checkSession = require('../middleware/checkSession');
const Penjualan = require('../models/penjualanModel');
const checkRole = require('../middleware/checkRole');

// Menampilkan bukti pembayaran (dapat diakses oleh semua role untuk keperluan masing-masing)
// - Pelanggan: melihat bukti pembayaran mereka sendiri
// - Admin: memverifikasi dan mengelola pembayaran
// - Petugas: membantu pelanggan dan memverifikasi pembayaran
router.get('/:orderId', checkSession, checkRole(['pelanggan', 'admin', 'petugas']), async (req, res) => {
    try {
        const penjualan = await Penjualan.findById(req.params.orderId)
            .populate({
                path: 'items.produk_id',
                select: 'namaProduk harga'
            })
            .populate('pelanggan_id');

        if (!penjualan) {
            return res.status(404).send('Penjualan tidak ditemukan');
        }

        res.render('payment-receipt', {
            orderId: penjualan._id,
            items: penjualan.items,
            pelanggan: penjualan.pelanggan_id,
            totalHarga: penjualan.totalHarga,
            tanggalPenjualan: penjualan.tanggalPenjualan
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat memuat bukti pembayaran');
    }
});

module.exports = router; 