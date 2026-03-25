const Transaction = require('../models/transactionModel');

// @desc    Get sales trends and restocking suggestions
// @route   GET /api/insights
// @access  Private
const getInsights = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Filter by user and transaction type, and use createdAt instead of saleDate
        const transactions = await Transaction.find({ 
            ownerID: req.user._id,
            type: 'Sale',
            createdAt: { $gte: thirtyDaysAgo } 
        }).populate('product', 'name');

        // Group transactions by product
        const salesByProduct = transactions.reduce((acc, t) => {
            if (!t.product) return acc; // Skip if product doesn't exist
            const productId = t.product._id.toString();
            if (!acc[productId]) {
                acc[productId] = { name: t.product.name, data: [] };
            }
            acc[productId].data.push({ date: t.createdAt, quantity: t.quantity });
            return acc;
        }, {});

        const insights = Object.values(salesByProduct).map(product => {
            // Simple linear trend analysis
            const n = product.data.length;
            if (n < 2) return { name: product.name, suggestion: 'Not enough data for trend analysis.' };

            const salesData = product.data.sort((a, b) => a.date - b.date);
            const totalSales = salesData.reduce((sum, item) => sum + item.quantity, 0);
            const avgDailySales = totalSales / n;

            // Check trend in the last week vs. the period before
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const lastWeekSales = salesData.filter(d => d.date >= sevenDaysAgo).reduce((sum, item) => sum + item.quantity, 0);
            const previousSales = totalSales - lastWeekSales;
            
            const avgLastWeek = lastWeekSales / 7;
            const avgPrevious = previousSales / 23;

            let suggestion = 'Sales are stable.';
            if (avgLastWeek > avgPrevious * 1.5) {
                suggestion = 'Trending up. Consider increasing stock.';
            } else if (avgLastWeek < avgPrevious * 0.5) {
                suggestion = 'Trending down. Monitor closely.';
            }

            return { name: product.name, avgDailySales: avgDailySales.toFixed(2), suggestion };
        });

        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInsights };