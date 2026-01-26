const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { auth } = require('../middleware/auth');

// ============================================
// GET ROUTES
// ============================================

/**
 * GET /api/batches/:product_id
 * Get all batches for a product
 */
router.get('/:product_id', auth, batchController.getBatchesForProduct);

/**
 * GET /api/batches/details/:batch_id
 * Get specific batch details
 */
router.get('/details/:batch_id', auth, batchController.getBatchDetails);

/**
 * GET /api/batches/:batch_id/history
 * Get batch movement history (audit trail)
 */
router.get('/:batch_id/history', auth, batchController.getBatchMovementHistory);

/**
 * GET /api/batches/expiring?days=30
 * Get batches expiring within specified days
 */
router.get('/expiring/list', auth, batchController.getExpiringBatches);

/**
 * GET /api/batches/movements/history?product_id=X&movement_type=sale
 * Get stock movement history with filters
 */
router.get('/movements/history', auth, batchController.getStockMovementHistory);

// ============================================
// POST ROUTES
// ============================================

/**
 * POST /api/batches/:batch_id/return
 * Return stock to batch (from refunds/returns)
 */
router.post('/:batch_id/return', auth, batchController.returnStockToBatch);

// ============================================
// PUT ROUTES
// ============================================

/**
 * PUT /api/batches/:batch_id/deactivate
 * Deactivate batch (expired, depleted)
 */
router.put('/:batch_id/deactivate', auth, batchController.deactivateBatch);

module.exports = router;
