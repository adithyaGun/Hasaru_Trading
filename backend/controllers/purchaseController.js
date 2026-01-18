const purchaseService = require('../services/purchaseService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getAllPurchases = asyncHandler(async (req, res) => {
  const { status, supplier_id, page, limit } = req.query;
  const filters = { status, supplier_id };
  
  const result = await purchaseService.getAllPurchases(filters, page, limit);
  res.json(successResponse(result, 'Purchase orders fetched successfully'));
});

exports.getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(req.params.id);
  res.json(successResponse(purchase, 'Purchase order fetched successfully'));
});

exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchaseOrder(req.body, req.user.id);
  res.status(201).json(successResponse(purchase, 'Purchase order created successfully'));
});

exports.approvePurchaseOrder = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.approvePurchaseOrder(req.params.id, req.user.id);
  res.json(successResponse(purchase, 'Purchase order approved successfully'));
});

exports.receiveGoods = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.receiveGoods(req.params.id, req.user.id);
  res.json(successResponse(purchase, 'Goods received successfully. Stock updated.'));
});
