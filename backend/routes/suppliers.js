const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { auth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { supplierValidation, idValidation, paginationValidation } = require('../middleware/validator');

// All routes require admin authentication
router.use(auth, adminOnly);

router.get('/', paginationValidation, supplierController.getAllSuppliers);
router.get('/:id', idValidation, supplierController.getSupplierById);
router.post('/', supplierValidation, supplierController.createSupplier);
router.put('/:id', idValidation, supplierController.updateSupplier);
router.delete('/:id', idValidation, supplierController.deleteSupplier);

module.exports = router;
