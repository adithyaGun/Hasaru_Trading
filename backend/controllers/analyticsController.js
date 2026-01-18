const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit, period, start_date, end_date } = req.query;
  const analytics = await analyticsService.getTopSellingProducts(
    limit || 10,
    period,
    start_date,
    end_date
  );
  res.json(successResponse(analytics, 'Top selling products fetched'));
});

exports.getFastMovingItems = asyncHandler(async (req, res) => {
  const { limit, period, start_date, end_date } = req.query;
  const analytics = await analyticsService.getFastMovingItems(
    limit || 20,
    period,
    start_date,
    end_date
  );
  res.json(successResponse(analytics, 'Fast moving items fetched'));
});

exports.getSlowMovingItems = asyncHandler(async (req, res) => {
  const { limit, period, start_date, end_date } = req.query;
  const analytics = await analyticsService.getSlowMovingItems(
    limit || 20,
    period,
    start_date,
    end_date
  );
  res.json(successResponse(analytics, 'Slow moving items fetched'));
});

exports.getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { period, start_date, end_date } = req.query;
  const analytics = await analyticsService.getCustomerAnalytics(
    period,
    start_date,
    end_date
  );
  res.json(successResponse(analytics, 'Customer analytics fetched'));
});

exports.getInventoryTurnover = asyncHandler(async (req, res) => {
  const { period, start_date, end_date } = req.query;
  const analytics = await analyticsService.getInventoryTurnover(
    period,
    start_date,
    end_date
  );
  res.json(successResponse(analytics, 'Inventory turnover calculated'));
});
