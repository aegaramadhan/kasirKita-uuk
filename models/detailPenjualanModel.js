const mongoose = require("mongoose");

const detailPenjualanSchema = new mongoose.Schema ({
    penjualan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "penjualan",
        required: true,
    },
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "produk",
        required: true,
    },
    jumlahProduk: {
        type: Number,
        required: true,
    },
    subTotal: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model("DetailPenjualan", detailPenjualanSchema);