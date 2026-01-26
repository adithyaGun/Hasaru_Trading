const inventoryService = require('../services/inventoryService');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ============================================
// GET ROUTES
// ============================================

/**
 * Get all batches for a product
 */
exports.getBatchesForProduct = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      throw new AppError('Product ID is required', 400);
    }

    const batches = await inventoryService.getBatchesForProduct(product_id);

    res.json({
      success: true,
      data: batches,
      count: batches.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get batch details
 */
exports.getBatchDetails = async (req, res, next) => {
  try {
    const { batch_id } = req.params;

    if (!batch_id) {
      throw new AppError('Batch ID is required', 400);
    }

    const batch = await inventoryService.getBatchDetails(batch_id);

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get batch movement history
 */
exports.getBatchMovementHistory = async (req, res, next) => {
  try {
    const { batch_id } = req.params;

    if (!batch_id) {
      throw new AppError('Batch ID is required', 400);
    }

    const movements = await inventoryService.getBatchMovementHistory(batch_id);

    res.json({
      success: true,
      data: movements,
      count: movements.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expiring batches
 */
exports.getExpiringBatches = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const batches = await inventoryService.getExpiringBatches(parseInt(days));

    res.json({
      success: true,
      data: batches,
      count: batches.length,
      filter: { days_until_expiry: `<= ${days}` }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get stock movement history (audit trail)
 */
exports.getStockMovementHistory = async (req, res, next) => {
  try {
    const { product_id, batch_id, movement_type, start_date, end_date } = req.query;

    const movements = await inventoryService.getStockMovementHistory({
      product_id,
      batch_id,
      movement_type,
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: movements,
      count: movements.length
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// POST ROUTES
// ============================================

/**
 * Return stock to batch (from returns/refunds)
 */
exports.returnStockToBatch = async (req, res, next) => {
  try {
    const { batch_id } = req.params;
    const { quantity, notes } = req.body;

    if (!batch_id || !quantity) {
      throw new AppError('Batch ID and quantity are required', 400);
    }

    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400);
    }

    const result = await inventoryService.returnStockToBatch(batch_id, quantity, notes);

    res.json({
      success: true,
      message: `${quantity} units returned to batch ${batch_id}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// PUT ROUTES
// ============================================

/**
 * Deactivate batch (e.g., when expired or depleted)
 */
exports.deactivateBatch = async (req, res, next) => {
  try {
    const { batch_id } = req.params;
    const { reason = 'depleted' } = req.body;

    if (!batch_id) {
      throw new AppError('Batch ID is required', 400);
    }

    await inventoryService.deactivateBatch(batch_id, reason);

    res.json({
      success: true,
      message: `Batch ${batch_id} deactivated (reason: ${reason})`
    });
  } catch (error) {
    next(error);
  }
};
