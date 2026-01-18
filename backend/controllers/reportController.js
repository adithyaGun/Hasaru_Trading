const reportService = require('../services/reportService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getSalesReport = asyncHandler(async (req, res) => {
  const { period, start_date, end_date } = req.query;
  const report = await reportService.getSalesReport(period, start_date, end_date);
  res.json(successResponse(report, 'Sales report generated'));
});

exports.getProfitReport = asyncHandler(async (req, res) => {
  const { period, start_date, end_date } = req.query;
  const report = await reportService.getProfitReport(period, start_date, end_date);
  res.json(successResponse(report, 'Profit report generated'));
});

exports.getInventoryValueReport = asyncHandler(async (req, res) => {
  const report = await reportService.getInventoryValueReport();
  res.json(successResponse(report, 'Inventory value report generated'));
});

exports.getSalesByCategory = asyncHandler(async (req, res) => {
  const { period, start_date, end_date } = req.query;
  const report = await reportService.getSalesByCategory(period, start_date, end_date);
  res.json(successResponse(report, 'Sales by category report generated'));
});

exports.getDailySalesTrend = asyncHandler(async (req, res) => {
  const { period, start_date, end_date } = req.query;
  const report = await reportService.getDailySalesTrend(period, start_date, end_date);
  res.json(successResponse(report, 'Daily sales trend generated'));
});
