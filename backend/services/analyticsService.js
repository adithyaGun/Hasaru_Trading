const { pool } = require('../config/db');
const { getDateRange } = require('../utils/helpers');

class AnalyticsService {
  /**
   * Get top selling products
   */
  async getTopSellingProducts(limit = 10, period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    // Convert limit to integer to avoid SQL syntax error
    const limitInt = parseInt(limit, 10) || 10;

    const [data] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        p.brand,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.subtotal) as total_revenue,
        COUNT(DISTINCT si.id) as number_of_transactions
       FROM sales_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.status != 'cancelled' 
       AND DATE(s.sale_date) BETWEEN ? AND ?
       GROUP BY p.id, p.name, p.sku, p.category, p.brand
       ORDER BY total_quantity_sold DESC
       LIMIT ?`,
      [dateRange.startDate, dateRange.endDate, limitInt]
    );

    return {
      period,
      date_range: dateRange,
      limit,
      top_selling_products: data.map((row, index) => ({
        rank: index + 1,
        product_id: row.id,
        product_name: row.name,
        sku: row.sku,
        category: row.category,
        brand: row.brand,
        total_quantity_sold: row.total_quantity_sold,
        total_revenue: parseFloat(row.total_revenue).toFixed(2),
        number_of_transactions: row.number_of_transactions
      }))
    };
  }

  /**
   * Get fast moving items
   */
  async getFastMovingItems(limit = 20, period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    // Convert limit to integer to avoid SQL syntax error
    const limitInt = parseInt(limit, 10) || 20;

    const [data] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        p.stock_quantity,
        p.reorder_level,
        SUM(si.quantity) as quantity_sold,
        COUNT(DISTINCT si.id) as sales_frequency,
        (SUM(si.quantity) / DATEDIFF(?, ?)) as daily_average_sales
       FROM sales_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.status != 'cancelled' 
       AND DATE(s.sale_date) BETWEEN ? AND ?
       GROUP BY p.id, p.name, p.sku, p.category, p.stock_quantity, p.reorder_level
       HAVING quantity_sold > 0
       ORDER BY quantity_sold DESC, sales_frequency DESC
       LIMIT ?`,
      [
        dateRange.endDate, 
        dateRange.startDate,
        dateRange.startDate, 
        dateRange.endDate, 
        limitInt
      ]
    );

    return {
      period,
      date_range: dateRange,
      fast_moving_items: data.map((row, index) => ({
        rank: index + 1,
        product_id: row.id,
        product_name: row.name,
        sku: row.sku,
        category: row.category,
        current_stock: row.stock_quantity,
        reorder_level: row.reorder_level,
        quantity_sold: row.quantity_sold,
        sales_frequency: row.sales_frequency,
        daily_average_sales: parseFloat(row.daily_average_sales).toFixed(2),
        movement_status: row.quantity_sold > 20 ? 'Very Fast' : 'Fast'
      }))
    };
  }

  /**
   * Get slow moving items
   */
  async getSlowMovingItems(limit = 20, period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    // Convert limit to integer to avoid SQL syntax error
    const limitInt = parseInt(limit, 10) || 20;

    const [data] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        p.stock_quantity,
        p.reorder_level,
        p.purchase_price,
        COALESCE(SUM(si.quantity), 0) as quantity_sold,
        COALESCE(COUNT(DISTINCT si.id), 0) as sales_frequency,
        (p.stock_quantity * p.purchase_price) as stock_value
       FROM products p
       LEFT JOIN sales_items si ON p.id = si.product_id
       LEFT JOIN sales s ON si.sale_id = s.id AND s.status != 'cancelled' AND DATE(s.sale_date) BETWEEN ? AND ?
       WHERE p.is_active = TRUE
       GROUP BY p.id, p.name, p.sku, p.category, p.stock_quantity, p.reorder_level, p.purchase_price
       HAVING quantity_sold <= 3
       ORDER BY quantity_sold ASC, p.stock_quantity DESC
       LIMIT ?`,
      [dateRange.startDate, dateRange.endDate, limitInt]
    );

    return {
      period,
      date_range: dateRange,
      slow_moving_items: data.map((row, index) => ({
        rank: index + 1,
        product_id: row.id,
        product_name: row.name,
        sku: row.sku,
        category: row.category,
        current_stock: row.stock_quantity,
        reorder_level: row.reorder_level,
        quantity_sold: row.quantity_sold,
        sales_frequency: row.sales_frequency,
        stock_value: parseFloat(row.stock_value).toFixed(2),
        movement_status: row.quantity_sold === 0 ? 'No Sales' : 'Very Slow',
        recommendation: row.quantity_sold === 0 && row.stock_quantity > row.reorder_level ? 
          'Consider promotion or clearance' : 'Monitor closely'
      }))
    };
  }

  /**
   * Get customer purchase analytics
   */
  async getCustomerAnalytics(period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    const [data] = await pool.query(
      `SELECT 
        u.id as customer_id,
        u.name as customer_name,
        u.email,
        COUNT(s.id) as total_orders,
        SUM(s.total_amount) as total_spent,
        AVG(s.total_amount) as average_order_value,
        MAX(s.sale_date) as last_order_date
       FROM users u
       JOIN sales s ON u.id = s.customer_id
       WHERE u.role = 'customer'
       AND s.status != 'cancelled'
       AND DATE(s.sale_date) BETWEEN ? AND ?
       GROUP BY u.id, u.name, u.email
       ORDER BY total_spent DESC
       LIMIT 20`,
      [dateRange.startDate, dateRange.endDate]
    );

    return {
      period,
      date_range: dateRange,
      top_customers: data.map((row, index) => ({
        rank: index + 1,
        customer_id: row.customer_id,
        customer_name: row.customer_name,
        email: row.email,
        total_orders: row.total_orders,
        total_spent: parseFloat(row.total_spent).toFixed(2),
        average_order_value: parseFloat(row.average_order_value).toFixed(2),
        last_order_date: row.last_order_date
      }))
    };
  }

  /**
   * Get inventory turnover rate
   */
  async getInventoryTurnover(period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    const [salesData] = await pool.query(
      `SELECT SUM(si.quantity * p.purchase_price) as cost_of_goods_sold
       FROM sales_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.status != 'cancelled' 
       AND DATE(s.sale_date) BETWEEN ? AND ?`,
      [dateRange.startDate, dateRange.endDate]
    );

    const [inventoryData] = await pool.query(
      `SELECT SUM(stock_quantity * purchase_price) as average_inventory
       FROM products
       WHERE is_active = TRUE`
    );

    const costOfGoodsSold = parseFloat(salesData[0].cost_of_goods_sold || 0);
    const averageInventory = parseFloat(inventoryData[0].average_inventory || 1);
    const turnoverRate = averageInventory > 0 ? (costOfGoodsSold / averageInventory) : 0;

    return {
      period,
      date_range: dateRange,
      cost_of_goods_sold: costOfGoodsSold.toFixed(2),
      average_inventory: averageInventory.toFixed(2),
      inventory_turnover_rate: turnoverRate.toFixed(2),
      interpretation: turnoverRate > 4 ? 'High turnover - Good' : 
                     turnoverRate > 2 ? 'Moderate turnover' : 'Low turnover - Consider action'
    };
  }
}

module.exports = new AnalyticsService();
