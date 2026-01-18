/**
 * Format currency in LKR
 */
const formatCurrency = (amount) => {
  return `Rs. ${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

/**
 * Generate unique order/invoice/PO number
 */
const generateOrderNumber = (prefix, lastNumber = 0) => {
  const year = new Date().getFullYear();
  const number = String(lastNumber + 1).padStart(6, '0');
  return `${prefix}-${year}-${number}`;
};

/**
 * Calculate discount amount
 */
const calculateDiscount = (amount, discountType, discountValue) => {
  if (discountType === 'percentage') {
    return (amount * discountValue) / 100;
  } else if (discountType === 'fixed') {
    return Math.min(discountValue, amount); // Can't discount more than amount
  }
  return 0;
};

/**
 * Pagination helper
 */
const getPaginationParams = (page, limit) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = Math.min(parseInt(limit) || 20, 100); // Max 100 items
  const offset = (parsedPage - 1) * parsedLimit;
  
  return {
    page: parsedPage,
    limit: parsedLimit,
    offset
  };
};

/**
 * Format date for MySQL
 */
const formatDateForSQL = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Calculate date range for reports
 */
const getDateRange = (period = 'weekly') => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }

  return {
    startDate: formatDateForSQL(startDate),
    endDate: formatDateForSQL(endDate)
  };
};

/**
 * Success response format
 */
const successResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...meta
  };
};

/**
 * Error response format
 */
const errorResponse = (message = 'Error occurred', errors = null) => {
  return {
    success: false,
    message,
    ...(errors && { errors })
  };
};

/**
 * Check if stock is sufficient
 */
const checkStockAvailability = (currentStock, requestedQuantity, allowNegative = false) => {
  if (allowNegative) return true;
  return currentStock >= requestedQuantity;
};

/**
 * Calculate stock status
 */
const getStockStatus = (currentStock, reorderLevel, minimumLevel) => {
  if (currentStock <= minimumLevel) return 'critical';
  if (currentStock <= reorderLevel) return 'low';
  return 'normal';
};

module.exports = {
  formatCurrency,
  generateOrderNumber,
  calculateDiscount,
  getPaginationParams,
  formatDateForSQL,
  getDateRange,
  successResponse,
  errorResponse,
  checkStockAvailability,
  getStockStatus
};
