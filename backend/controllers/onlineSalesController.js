const onlineSalesService = require('../services/onlineSalesService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

// Cart operations
exports.addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;
  const cart = await onlineSalesService.addToCart(req.user.id, product_id, quantity);
  res.json(successResponse(cart, 'Item added to cart'));
});

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await onlineSalesService.getCart(req.user.id);
  res.json(successResponse(cart, 'Cart fetched successfully'));
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;
  const cart = await onlineSalesService.updateCartItem(req.user.id, product_id, quantity);
  res.json(successResponse(cart, 'Cart updated successfully'));
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await onlineSalesService.removeFromCart(req.user.id, req.params.productId);
  res.json(successResponse(cart, 'Item removed from cart'));
});

// Checkout
exports.checkout = asyncHandler(async (req, res) => {
  const order = await onlineSalesService.checkout(req.user.id, req.body);
  res.status(201).json(successResponse(order, 'Order placed successfully'));
});

// Orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { customer_id, status, page, limit } = req.query;
  const filters = { customer_id, status };
  
  const result = await onlineSalesService.getAllOrders(filters, page, limit);
  res.json(successResponse(result, 'Orders fetched successfully'));
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await onlineSalesService.getOrderById(req.params.id);
  res.json(successResponse(order, 'Order fetched successfully'));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filters = { customer_id: req.user.id };
  
  const result = await onlineSalesService.getAllOrders(filters, page, limit);
  res.json(successResponse(result, 'Your orders fetched successfully'));
});

exports.getMyOrderById = asyncHandler(async (req, res) => {
  const order = await onlineSalesService.getOrderById(req.params.id);
  
  // Verify the order belongs to the logged-in user
  if (order.customer_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own orders.'
    });
  }
  
  res.json(successResponse(order, 'Order fetched successfully'));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }
  
  const order = await onlineSalesService.updateOrderStatus(req.params.id, status, req.user.id);
  res.json(successResponse(order, 'Order status updated successfully'));
});
