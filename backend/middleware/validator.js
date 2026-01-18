const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      errorResponse('Validation failed', errors.array().map(err => ({
        field: err.path,
        message: err.msg
      })))
    );
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'sales_staff', 'customer']).withMessage('Invalid role'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Validation rules for product creation
 */
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required'),
  body('selling_price')
    .isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('purchase_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('reorder_level')
    .optional()
    .isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
  body('minimum_stock_level')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum stock level must be a non-negative integer'),
  validate
];

/**
 * Validation rules for supplier
 */
const supplierValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Supplier name is required'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  validate
];

/**
 * Validation rules for purchase order
 */
const purchaseValidation = [
  body('supplier_id')
    .isInt({ min: 1 }).withMessage('Valid supplier ID is required'),
  body('order_date')
    .isDate().withMessage('Valid order date is required'),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unit_price')
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  validate
];

/**
 * Validation rules for online checkout
 */
const checkoutValidation = [
  body('shipping_address')
    .trim()
    .notEmpty().withMessage('Shipping address is required'),
  body('payment_method')
    .optional()
    .isString().withMessage('Payment method must be a string'),
  validate
];

/**
 * Validation rules for OTC sale
 */
const otcSaleValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('payment_method')
    .isIn(['cash', 'card', 'bank_transfer']).withMessage('Invalid payment method'),
  body('amount_paid')
    .isFloat({ min: 0 }).withMessage('Amount paid must be a positive number'),
  body('customer_name')
    .optional()
    .trim(),
  body('customer_phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  validate
];

/**
 * Validation rules for promotion
 */
const promotionValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Promotion name is required'),
  body('discount_type')
    .isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discount_value')
    .isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('start_date')
    .isISO8601().withMessage('Valid start date is required'),
  body('end_date')
    .isISO8601().withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  validate
];

/**
 * Validation for ID parameter
 */
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID'),
  validate
];

/**
 * Validation for pagination
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  productValidation,
  supplierValidation,
  purchaseValidation,
  checkoutValidation,
  otcSaleValidation,
  promotionValidation,
  idValidation,
  paginationValidation
};
