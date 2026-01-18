const express = require('express');
const router = express.Router();
const onlineSalesController = require('../controllers/onlineSalesController');
const { auth } = require('../middleware/auth');
const { customerOnly, staffOnly, adminOnly } = require('../middleware/roleCheck');
const { checkoutValidation, idValidation, paginationValidation } = require('../middleware/validator');

// Customer routes - Cart management
router.post('/cart', auth, customerOnly, onlineSalesController.addToCart);
router.get('/cart', auth, customerOnly, onlineSalesController.getCart);
router.put('/cart', auth, customerOnly, onlineSalesController.updateCartItem);
router.delete('/cart/:productId', auth, customerOnly, onlineSalesController.removeFromCart);

// Customer routes - Checkout & Orders
router.post('/checkout', auth, customerOnly, checkoutValidation, onlineSalesController.checkout);
router.get('/my-orders', auth, customerOnly, paginationValidation, onlineSalesController.getMyOrders);

// Admin/Staff routes - View all orders
router.get('/orders', auth, staffOnly, paginationValidation, onlineSalesController.getAllOrders);
router.get('/orders/:id', auth, staffOnly, idValidation, onlineSalesController.getOrderById);
router.put('/orders/:id/status', auth, staffOnly, idValidation, onlineSalesController.updateOrderStatus);

module.exports = router;
