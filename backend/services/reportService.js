const { pool } = require('../config/db');
const { getDateRange } = require('../utils/helpers');

class ReportService {
  /**
   * Get sales report for a period
   */
  async getSalesReport(period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    // Online sales
    const [onlineSales] = await pool.query(
      `SELECT 
        COUNT(*) as order_count,
        SUM(total_amount) as total_sales,
        SUM(discount) as total_discounts,
        AVG(total_amount) as average_order_value
       FROM sales
       WHERE channel = 'online'
       AND status != 'cancelled'
       AND sale_date BETWEEN ? AND ?`,
      [dateRange.startDate, dateRange.endDate]
    );

    // POS sales
    const [posSales] = await pool.query(
      `SELECT 
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        SUM(discount) as total_discounts,
        AVG(total_amount) as average_transaction_value
       FROM sales
       WHERE channel = 'pos'
       AND sale_date BETWEEN ? AND ?`,
      [dateRange.startDate, dateRange.endDate]
    );

    // Combined totals
    const totalOrders = onlineSales[0].order_count + posSales[0].transaction_count;
    const totalSales = parseFloat(onlineSales[0].total_sales || 0) + parseFloat(posSales[0].total_sales || 0);
    const totalDiscounts = parseFloat(onlineSales[0].total_discounts || 0) + parseFloat(posSales[0].total_discounts || 0);

    return {
      period,
      date_range: dateRange,
      online_sales: {
        order_count: onlineSales[0].order_count,
        total_sales: parseFloat(onlineSales[0].total_sales || 0).toFixed(2),
        total_discounts: parseFloat(onlineSales[0].total_discounts || 0).toFixed(2),
        average_order_value: parseFloat(onlineSales[0].average_order_value || 0).toFixed(2)
      },
      pos_sales: {
        transaction_count: posSales[0].transaction_count,
        total_sales: parseFloat(posSales[0].total_sales || 0).toFixed(2),
        total_discounts: parseFloat(posSales[0].total_discounts || 0).toFixed(2),
        average_transaction_value: parseFloat(posSales[0].average_transaction_value || 0).toFixed(2)
      },
      combined: {
        total_orders: totalOrders,
        total_sales: totalSales.toFixed(2),
        total_discounts: totalDiscounts.toFixed(2),
        net_sales: (totalSales - totalDiscounts).toFixed(2)
      }
    };
  }

  /**
   * Get profit report (Admin only)
   */
  async getProfitReport(period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    // Get all sales with cost information
    const [salesData] = await pool.query(
      `SELECT 
        si.quantity,
        si.subtotal as revenue,
        p.purchase_price,
        (si.quantity * p.purchase_price) as cost
       FROM sales_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN products p ON si.product_id = p.id
       WHERE s.status != 'cancelled'
       AND s.sale_date BETWEEN ? AND ?`,
      [dateRange.startDate, dateRange.endDate]
    );

    const totalRevenue = salesData.reduce((sum, row) => sum + parseFloat(row.revenue), 0);
    const totalCost = salesData.reduce((sum, row) => sum + parseFloat(row.cost), 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      period,
      date_range: dateRange,
      total_revenue: totalRevenue.toFixed(2),
      total_cost: totalCost.toFixed(2),
      gross_profit: grossProfit.toFixed(2),
      profit_margin: profitMargin.toFixed(2) + '%'
    };
  }

  /**
   * Get inventory value report
   */
  async getInventoryValueReport() {
    const [data] = await pool.query(
      `SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock_quantity,
        SUM(stock_quantity * purchase_price) as total_purchase_value,
        SUM(stock_quantity * selling_price) as total_selling_value,
        SUM(CASE WHEN stock_quantity <= minimum_stock_level THEN 1 ELSE 0 END) as critical_stock_count,
        SUM(CASE WHEN stock_quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count
       FROM products
       WHERE is_active = TRUE`
    );

    return {
      total_products: data[0].total_products,
      total_stock_quantity: data[0].total_stock_quantity,
      total_purchase_value: parseFloat(data[0].total_purchase_value || 0).toFixed(2),
      total_selling_value: parseFloat(data[0].total_selling_value || 0).toFixed(2),
      potential_profit: (parseFloat(data[0].total_selling_value || 0) - parseFloat(data[0].total_purchase_value || 0)).toFixed(2),
      critical_stock_count: data[0].critical_stock_count,
      low_stock_count: data[0].low_stock_count
    };
  }

  /**
   * Get sales by category
   */
  async getSalesByCategory(period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    const [data] = await pool.query(
      `SELECT 
        p.category,
        COUNT(DISTINCT si.id) as items_sold,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
       FROM sales_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN products p ON si.product_id = p.id
       WHERE s.status != 'cancelled'
       AND s.sale_date BETWEEN ? AND ?
       GROUP BY p.category
       ORDER BY total_revenue DESC`,
      [dateRange.startDate, dateRange.endDate]
    );

    return {
      period,
      date_range: dateRange,
      categories: data.map(row => ({
        category: row.category,
        items_sold: row.items_sold,
        total_quantity: row.total_quantity,
        total_revenue: parseFloat(row.total_revenue).toFixed(2)
      }))
    };
  }

  /**
   * Get daily sales trend
   */
  async getDailySalesTrend(period = 'weekly', startDate = null, endDate = null) {
    const dateRange = startDate && endDate ? 
      { startDate, endDate } : 
      getDateRange(period);

    const [data] = await pool.query(
      `SELECT 
        DATE(sale_date) as date,
        channel as sale_type,
        COUNT(*) as transaction_count,
        SUM(total_amount) as daily_total
       FROM sales
       WHERE status != 'cancelled'
       AND sale_date BETWEEN ? AND ?
       GROUP BY DATE(sale_date), channel
       ORDER BY date, channel`,
      [dateRange.startDate, dateRange.endDate]
    );

    return {
      period,
      date_range: dateRange,
      daily_sales: data.map(row => ({
        date: row.date,
        sale_type: row.sale_type,
        transaction_count: row.transaction_count,
        daily_total: parseFloat(row.daily_total).toFixed(2)
      }))
    };
  }
}

module.exports = new ReportService();
