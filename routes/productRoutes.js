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

router.post('/', protect, addProduct);
router.get('/', protect, getAllProducts);
router.get('/alerts', protect, getAlerts);
router.patch('/sell/:id', protect, sellProduct);
router.post('/upload', protect, upload.single('file'), uploadProducts);
module.exports = router;