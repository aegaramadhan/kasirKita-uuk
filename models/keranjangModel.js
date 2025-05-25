const mongoose = require('mongoose');

const keranjangSchema = new mongoose.Schema({
    pelanggan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produk',
        required: true
    },
    jumlah: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
});

module.exports = mongoose.model('Keranjang', keranjangSchema); 