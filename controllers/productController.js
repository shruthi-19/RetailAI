const Product = require('../models/productModel');
const Transaction = require('../models/transactionModel');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// 1. The Ledger: Add a new product
const addProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. The Sentinel: Get items with low freshness or low stock
const getAlerts = async (req, res) => {
    try {
        const lowStockThreshold = 10; // Example low stock threshold
        const freshnessThreshold = 0.1; // 10% freshness

        const products = await Product.find();

        const alerts = products.filter(p => {
            const freshness = p.freshnessIndex;
            return p.quantity < p.minThreshold || (freshness < freshnessThreshold && freshness > 0);
        }).map(p => ({
            name: p.name,
            quantity: p.quantity,
            freshnessIndex: p.freshnessIndex,
            reason: p.quantity < p.minThreshold ? `Low stock (${p.quantity} left)` : `Nearing expiry (freshness: ${(p.freshnessIndex * 100).toFixed(0)}%)`
        }));

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. The Flow: Sell a product and reduce quantity
const sellProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        if (product.quantity < 1) {
            return res.status(400).json({ message: 'Not enough stock to sell.' });
        }

        // Decrement quantity by 1
        product.quantity -= 1;
        await product.save();

        // Create a transaction record
        const transaction = new Transaction({
            productId: product._id,
            productName: product.name,
            quantitySold: 1,
            price: product.price
        });
        await transaction.save();

        res.json({ message: `Sold 1 of ${product.name}. Remaining stock: ${product.quantity}`, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Bulk Upload Products from CSV
const uploadProducts = (req, res) => {
    const results = [];
    const filePath = path.join(process.cwd(), req.file.path);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Clean up the uploaded file
            fs.unlinkSync(filePath); 
            try {
                if (results.length > 0) {
                    await Product.insertMany(results);
                    res.status(201).json({ message: 'Products uploaded successfully.', count: results.length });
                } else {
                    res.status(400).json({ message: 'CSV file is empty or invalid.' });
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
};

module.exports = {
    addProduct,
    getAllProducts,
    getAlerts,
    sellProduct,
    uploadProducts
};