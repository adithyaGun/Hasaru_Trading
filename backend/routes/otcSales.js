const express = require('express');
const router = express.Router();
const otcSalesController = require('../controllers/otcSalesController');
const { auth } = require('../middleware/auth');
const { staffOnly } = require('../middleware/roleCheck');
const { otcSaleValidation, idValidation, paginationValidation } = require('../middleware/validator');

// All routes require staff authentication
router.use(auth, staffOnly);

// Product search for OTC interface
router.get('/search', otcSalesController.searchProducts);

// Sales operations
router.post('/', otcSaleValidation, otcSalesController.createSale);
router.get('/', paginationValidation, otcSalesController.getAllSales);
router.get('/:id', idValidation, otcSalesController.getSaleById);
router.get('/:id/invoice', idValidation, otcSalesController.generateInvoice);

module.exports = router;
