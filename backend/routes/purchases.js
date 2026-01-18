const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { auth } = require('../middleware/auth');
const { adminOnly, staffOnly } = require('../middleware/roleCheck');
const { purchaseValidation, idValidation, paginationValidation } = require('../middleware/validator');

// Staff can view
router.get('/', auth, staffOnly, paginationValidation, purchaseController.getAllPurchases);
router.get('/:id', auth, staffOnly, idValidation, purchaseController.getPurchaseById);

// Admin only for create and approve
router.post('/', auth, adminOnly, purchaseValidation, purchaseController.createPurchaseOrder);
router.put('/:id/approve', auth, adminOnly, idValidation, purchaseController.approvePurchaseOrder);

// Admin or Staff can receive goods
router.put('/:id/receive', auth, staffOnly, idValidation, purchaseController.receiveGoods);

module.exports = router;
