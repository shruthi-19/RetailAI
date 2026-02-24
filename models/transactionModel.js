const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantitySold: { type: Number, required: true, default: 1 },
    saleDate: { type: Date, default: Date.now },
    price: { type: Number, required: true }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;