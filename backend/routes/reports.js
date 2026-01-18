const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
const { adminOnly, staffOnly } = require('../middleware/roleCheck');

// Staff can view basic sales reports
router.get('/sales', auth, staffOnly, reportController.getSalesReport);
router.get('/sales/category', auth, staffOnly, reportController.getSalesByCategory);
router.get('/sales/trend', auth, staffOnly, reportController.getDailySalesTrend);
router.get('/inventory-value', auth, staffOnly, reportController.getInventoryValueReport);

// Admin only - Profit reports
router.get('/profit', auth, adminOnly, reportController.getProfitReport);

module.exports = router;
