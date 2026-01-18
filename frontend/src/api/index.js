import api from './axios';

const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCode: (code) => api.get(`/products/code/${code}`),
  getCategories: () => api.get('/products/categories'),
  getBrands: () => api.get('/products/brands'),
  getLowStock: () => api.get('/products/low-stock'),
  getStockStatus: (params) => api.get('/products/stock-status', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

const cartAPI = {
  get: () => api.get('/sales/online/cart'),
  add: (data) => api.post('/sales/online/cart', data),
  update: (data) => api.put('/sales/online/cart', data),
  remove: (productId) => api.delete(`/sales/online/cart/${productId}`),
};

const ordersAPI = {
  checkout: (data) => api.post('/sales/online/checkout', data),
  getMyOrders: (params) => api.get('/sales/online/my-orders', { params }),
  getAll: (params) => api.get('/sales/online/orders', { params }),
  getById: (id) => api.get(`/sales/online/orders/${id}`),
  updateStatus: (id, data) => api.put(`/sales/online/orders/${id}/status`, data),
};

const otcSalesAPI = {
  searchProducts: (query) => api.get('/sales/otc/search', { params: { q: query } }),
  create: (data) => api.post('/sales/otc', data),
  getAll: (params) => api.get('/sales/otc', { params }),
  getById: (id) => api.get(`/sales/otc/${id}`),
  generateInvoice: (id) => api.get(`/sales/otc/${id}/invoice`),
};

const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

const purchasesAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  approve: (id) => api.put(`/purchases/${id}/approve`),
  receive: (id) => api.put(`/purchases/${id}/receive`),
};

const reportsAPI = {
  getSales: (params) => api.get('/reports/sales', { params }),
  getProfit: (params) => api.get('/reports/profit', { params }),
  getInventoryValue: () => api.get('/reports/inventory-value'),
  getSalesByCategory: (params) => api.get('/reports/sales/category', { params }),
  getDailySalesTrend: (params) => api.get('/reports/sales/trend', { params }),
};

const analyticsAPI = {
  getTopSelling: (params) => api.get('/analytics/top-selling', { params }),
  getFastMoving: (params) => api.get('/analytics/fast-moving', { params }),
  getSlowMoving: (params) => api.get('/analytics/slow-moving', { params }),
  getCustomers: (params) => api.get('/analytics/customers', { params }),
  getInventoryTurnover: (params) => api.get('/analytics/inventory-turnover', { params }),
};

const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getStatistics: () => api.get('/alerts/statistics'),
  getDashboard: () => api.get('/alerts/dashboard'),
  acknowledge: (id) => api.put(`/alerts/${id}/acknowledge`),
};

const promotionsAPI = {
  getAll: (params) => api.get('/promotions', { params }),
  getById: (id) => api.get(`/promotions/${id}`),
  getForProduct: (productId) => api.get(`/promotions/product/${productId}`),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.put(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
};

export {
  authAPI,
  productsAPI,
  cartAPI,
  ordersAPI,
  otcSalesAPI,
  suppliersAPI,
  purchasesAPI,
  reportsAPI,
  analyticsAPI,
  alertsAPI,
  promotionsAPI,
};
