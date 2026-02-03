const productService = require('../services/productService');
const stockService = require('../services/stockService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.getAllProducts = asyncHandler(async (req, res) => {
  const { category, brand, search, stock_status, page, limit } = req.query;
  const filters = { category, brand, search, stock_status };
  
  const result = await productService.getAllProducts(filters, page, limit);
  res.json(successResponse(result, 'Products fetched successfully'));
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json(successResponse(product, 'Product fetched successfully'));
});

exports.createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  // Add image URL if file was uploaded
  if (req.file) {
    productData.image_url = `/uploads/products/${req.file.filename}`;
  }
  
  const product = await productService.createProduct(productData);
  res.status(201).json(successResponse(product, 'Product created successfully'));
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  // Add image URL if new file was uploaded
  if (req.file) {
    productData.image_url = `/uploads/products/${req.file.filename}`;
  }
  
  const product = await productService.updateProduct(req.params.id, productData);
  res.json(successResponse(product, 'Product updated successfully'));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json(successResponse(result, 'Product deleted successfully'));
});

exports.getProductByCode = asyncHandler(async (req, res) => {
  const product = await productService.getProductByCode(req.params.code);
  res.json(successResponse(product, 'Product found'));
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  res.json(successResponse(categories, 'Categories fetched successfully'));
});

exports.getBrands = asyncHandler(async (req, res) => {
  const brands = await productService.getBrands();
  res.json(successResponse(brands, 'Brands fetched successfully'));
});

exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await stockService.getLowStockProducts();
  res.json(successResponse(products, 'Low stock products fetched'));
});

exports.getStockHistory = asyncHandler(async (req, res) => {
  const history = await stockService.getStockHistory(req.params.id, req.query.limit);
  res.json(successResponse(history, 'Stock history fetched'));
});

exports.getAllStockStatus = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const products = await stockService.getAllStockStatus({ status, category });
  res.json(successResponse(products, 'Stock status fetched'));
});
