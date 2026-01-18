const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { auth, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { promotionValidation, idValidation, paginationValidation } = require('../middleware/validator');

// Public - View active promotions
router.get('/', optionalAuth, paginationValidation, promotionController.getAllPromotions);
router.get('/:id', optionalAuth, idValidation, promotionController.getPromotionById);
router.get('/product/:productId', optionalAuth, promotionController.getProductPromotions);

// Admin only - Manage promotions
router.post('/', auth, adminOnly, promotionValidation, promotionController.createPromotion);
router.put('/:id', auth, adminOnly, idValidation, promotionController.updatePromotion);
router.delete('/:id', auth, adminOnly, idValidation, promotionController.deletePromotion);

module.exports = router;
