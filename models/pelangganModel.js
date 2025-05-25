const mongoose = require("mongoose");

const pelangganSchema = new mongoose.Schema({
    namaPelanggan: {
        type: String,
        required: true,
    },
    alamat: {
        type: String,
        default: 'Alamat belum diisi'
    },
    nomerTelepon: {
        type: String,
        default: 'Nomor belum diisi'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model("Pelanggan", pelangganSchema);