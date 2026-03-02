const mongoose = require('mongoose');
const User = require('./userModel');
const Product = require('./productModel');

const transactionSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["Sale", "Restock"] },
  quantity: Number,
  timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;