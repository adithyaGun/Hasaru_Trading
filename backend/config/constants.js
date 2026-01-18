module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    SALES_STAFF: 'sales_staff',
    CUSTOMER: 'customer'
  },

  // Order statuses for online sales
  ONLINE_ORDER_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    PROCESSING: 'processing',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Payment statuses
  PAYMENT_STATUS: {
    UNPAID: 'unpaid',
    PAID: 'paid',
    REFUNDED: 'refunded'
  },

  // Payment methods for OTC
  PAYMENT_METHODS: {
    CASH: 'cash',
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer'
  },

  // Purchase order statuses
  PO_STATUS: {
    DRAFT: 'draft',
    APPROVED: 'approved',
    RECEIVED: 'received',
    CANCELLED: 'cancelled'
  },

  // Stock transaction types
  TRANSACTION_TYPES: {
    PURCHASE: 'purchase',
    ONLINE_SALE: 'online_sale',
    OTC_SALE: 'otc_sale',
    ADJUSTMENT: 'adjustment',
    RETURN: 'return'
  },

  // Sale types
  SALE_TYPES: {
    ONLINE: 'online',
    OTC: 'otc'
  },

  // Alert levels
  ALERT_LEVELS: {
    WARNING: 'warning',
    CRITICAL: 'critical'
  },

  // Discount types
  DISCOUNT_TYPES: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Date formats
  DATE_FORMATS: {
    SQL_DATE: 'YYYY-MM-DD',
    SQL_DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'DD/MM/YYYY'
  }
};
