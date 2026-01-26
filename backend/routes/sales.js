const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { auth } = require('../middleware/auth');

// ============================================
// GET ROUTES
// ============================================

/**
 * GET /api/sales
 * Get all sales with filters
 */
router.get('/', auth, salesController.getAllSales);

/**
 * GET /api/sales/summary
 * Get sales summary for dashboard/reporting
 */
router.get('/summary', auth, salesController.getSalesSummary);

/**
 * GET /api/sales/:sale_id
 * Get sale details with items and batch info
 */
router.get('/:sale_id', auth, salesController.getSaleDetails);

// ============================================
// POST ROUTES
// ============================================

/**
 * POST /api/sales
 * Create a new sale (online or POS) with FIFO stock deduction
 */
router.post('/', auth, salesController.createSale);

/**
 * POST /api/sales/:sale_id/payment
 * Confirm payment for a sale
 */
router.post('/:sale_id/payment', auth, salesController.confirmPayment);

/**
 * POST /api/sales/:sale_id/return
 * Process sale return (refund stock)
 */
router.post('/:sale_id/return', auth, salesController.processSaleReturn);

/**
 * POST /api/sales/:sale_id/cancel
 * Cancel a sale
 */
router.post('/:sale_id/cancel', auth, salesController.cancelSale);

module.exports = router;
