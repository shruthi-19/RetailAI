const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../models/transactionModel');

const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ ownerID: req.user._id })
        .populate('product', 'name')
        .sort({ timestamp: -1 }); // Newest first

    res.json(transactions);
});

module.exports = { getTransactions };