const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');
const { adminOnly, staffOnly } = require('../middleware/roleCheck');

// Staff can view analytics
router.get('/top-selling', auth, staffOnly, analyticsController.getTopSellingProducts);
router.get('/fast-moving', auth, staffOnly, analyticsController.getFastMovingItems);
router.get('/slow-moving', auth, staffOnly, analyticsController.getSlowMovingItems);
router.get('/inventory-turnover', auth, staffOnly, analyticsController.getInventoryTurnover);

// Admin only - Customer analytics
router.get('/customers', auth, adminOnly, analyticsController.getCustomerAnalytics);

module.exports = router;
