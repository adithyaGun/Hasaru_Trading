const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, optionalAuth } = require('../middleware/auth');
const { adminOnly, staffOnly } = require('../middleware/roleCheck');
const { productValidation, idValidation, paginationValidation } = require('../middleware/validator');

// Public routes (can view products)
router.get('/', optionalAuth, paginationValidation, productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/code/:code', productController.getProductByCode);
router.get('/stock-status', auth, staffOnly, productController.getAllStockStatus);
router.get('/low-stock', auth, staffOnly, productController.getLowStockProducts);
router.get('/:id', optionalAuth, idValidation, productController.getProductById);
router.get('/:id/stock-history', auth, staffOnly, idValidation, productController.getStockHistory);

// Admin only routes
router.post('/', auth, adminOnly, productValidation, productController.createProduct);
router.put('/:id', auth, adminOnly, idValidation, productController.updateProduct);
router.delete('/:id', auth, adminOnly, idValidation, productController.deleteProduct);

module.exports = router;
