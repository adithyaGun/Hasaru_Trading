const alertService = require('../services/alertService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getLowStockAlerts = asyncHandler(async (req, res) => {
  const { is_acknowledged, alert_level, page, limit } = req.query;
  const filters = { 
    is_acknowledged: is_acknowledged === 'true' ? true : is_acknowledged === 'false' ? false : undefined,
    alert_level 
  };
  
  const result = await alertService.getLowStockAlerts(filters, page, limit);
  res.json(successResponse(result, 'Alerts fetched successfully'));
});

exports.acknowledgeAlert = asyncHandler(async (req, res) => {
  const result = await alertService.acknowledgeAlert(req.params.id, req.user.id);
  res.json(successResponse(result, 'Alert acknowledged'));
});

exports.getAlertStatistics = asyncHandler(async (req, res) => {
  const stats = await alertService.getAlertStatistics();
  res.json(successResponse(stats, 'Alert statistics fetched'));
});

exports.getDashboardNotifications = asyncHandler(async (req, res) => {
  const notifications = await alertService.getDashboardNotifications(req.user.id);
  res.json(successResponse(notifications, 'Notifications fetched'));
});
