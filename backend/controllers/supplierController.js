const supplierService = require('../services/supplierService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getAllSuppliers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await supplierService.getAllSuppliers(page, limit);
  res.json(successResponse(result, 'Suppliers fetched successfully'));
});

exports.getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.id);
  res.json(successResponse(supplier, 'Supplier fetched successfully'));
});

exports.createSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json(successResponse(supplier, 'Supplier created successfully'));
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  res.json(successResponse(supplier, 'Supplier updated successfully'));
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  const result = await supplierService.deleteSupplier(req.params.id);
  res.json(successResponse(result, 'Supplier deleted successfully'));
});
