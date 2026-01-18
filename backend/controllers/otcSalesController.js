const otcSalesService = require('../services/otcSalesService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.createSale = asyncHandler(async (req, res) => {
  const sale = await otcSalesService.createSale(req.body, req.user.id);
  res.status(201).json(successResponse(sale, 'Sale completed successfully'));
});

exports.getAllSales = asyncHandler(async (req, res) => {
  const { sales_staff_id, payment_method, date_from, date_to, page, limit } = req.query;
  const filters = { sales_staff_id, payment_method, date_from, date_to };
  
  const result = await otcSalesService.getAllSales(filters, page, limit);
  res.json(successResponse(result, 'Sales fetched successfully'));
});

exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await otcSalesService.getSaleById(req.params.id);
  res.json(successResponse(sale, 'Sale fetched successfully'));
});

exports.generateInvoice = asyncHandler(async (req, res) => {
  const invoice = await otcSalesService.generateInvoice(req.params.id);
  res.json(successResponse(invoice, 'Invoice generated successfully'));
});

exports.searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const products = await otcSalesService.searchProducts(q);
  res.json(successResponse(products, 'Products found'));
});
