const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    addProduct,
    getAllProducts,
    getAlerts,
    sellProduct,
    uploadProducts
} = require('../controllers/productController.js');
const { protect } = require('../middleware/authMiddleware.js');

const upload = multer({ dest: 'uploads/' });

router.route('/').post(protect, addProduct).get(protect, getAllProducts);
router.get('/alerts', protect, getAlerts);
router.patch('/:id/sell', protect, sellProduct);
router.post('/upload', protect, upload.single('inventoryFile'), uploadProducts);

module.exports = router;