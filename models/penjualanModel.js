const mongoose = require('mongoose');

const penjualanItemSchema = new mongoose.Schema({
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produk',
        required: true
    },
    jumlah: {
        type: Number,
        required: true,
        min: 1
    },
    harga: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
});

const penjualanSchema = new mongoose.Schema({
    pelanggan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pelanggan',
        required: true
    },
    items: [penjualanItemSchema],
    tanggalPenjualan: {
        type: Date,
        default: Date.now
    },
    totalHarga: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model('Penjualan', penjualanSchema);