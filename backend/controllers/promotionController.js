const promotionService = require('../services/promotionService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getAllPromotions = asyncHandler(async (req, res) => {
  const { is_active, active_now, page, limit } = req.query;
  const filters = { 
    is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
    active_now: active_now === 'true'
  };
  
  const result = await promotionService.getAllPromotions(filters, page, limit);
  res.json(successResponse(result, 'Promotions fetched successfully'));
});

exports.getPromotionById = asyncHandler(async (req, res) => {
  const promotion = await promotionService.getPromotionById(req.params.id);
  res.json(successResponse(promotion, 'Promotion fetched successfully'));
});

exports.createPromotion = asyncHandler(async (req, res) => {
  const promotion = await promotionService.createPromotion(req.body);
  res.status(201).json(successResponse(promotion, 'Promotion created successfully'));
});

exports.updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await promotionService.updatePromotion(req.params.id, req.body);
  res.json(successResponse(promotion, 'Promotion updated successfully'));
});

exports.deletePromotion = asyncHandler(async (req, res) => {
  const result = await promotionService.deletePromotion(req.params.id);
  res.json(successResponse(result, 'Promotion deleted successfully'));
});

exports.getProductPromotions = asyncHandler(async (req, res) => {
  const promotions = await promotionService.getProductPromotions(req.params.productId);
  res.json(successResponse(promotions, 'Product promotions fetched'));
});
