const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams } = require('../utils/helpers');

class AlertService {
  /**
   * Get all low stock alerts
   */
  async getLowStockAlerts(filters = {}, page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);

    let query = `
      SELECT 
        a.*,
        p.name as product_name,
        p.sku,
        p.category,
        p.stock_quantity as latest_stock,
        u.name as acknowledged_by_name
      FROM low_stock_alerts a
      JOIN products p ON a.product_id = p.id
      LEFT JOIN users u ON a.acknowledged_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.is_acknowledged !== undefined) {
      query += ' AND a.is_acknowledged = ?';
      params.push(filters.is_acknowledged);
    }

    if (filters.alert_level) {
      query += ' AND a.alert_level = ?';
      params.push(filters.alert_level);
    }

    // Get total
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY a.is_acknowledged ASC, a.alert_level DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const [alerts] = await pool.query(query, params);

    return {
      alerts: alerts.map(alert => ({
        ...alert,
        needs_urgent_action: alert.alert_level === 'critical' && !alert.is_acknowledged
      })),
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      },
      summary: {
        total_unacknowledged: alerts.filter(a => !a.is_acknowledged).length,
        critical_count: alerts.filter(a => a.alert_level === 'critical').length,
        warning_count: alerts.filter(a => a.alert_level === 'warning').length
      }
    };
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, userId) {
    const [alerts] = await pool.query(
      'SELECT id, is_acknowledged FROM low_stock_alerts WHERE id = ?',
      [alertId]
    );

    if (alerts.length === 0) {
      throw new AppError('Alert not found', 404);
    }

    if (alerts[0].is_acknowledged) {
      throw new AppError('Alert already acknowledged', 400);
    }

    await pool.query(
      `UPDATE low_stock_alerts 
       SET is_acknowledged = TRUE, acknowledged_by = ?, acknowledged_at = NOW() 
       WHERE id = ?`,
      [userId, alertId]
    );

    return { message: 'Alert acknowledged successfully' };
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics() {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN is_acknowledged = FALSE THEN 1 ELSE 0 END) as pending_alerts,
        SUM(CASE WHEN alert_level = 'critical' AND is_acknowledged = FALSE THEN 1 ELSE 0 END) as critical_pending,
        SUM(CASE WHEN alert_level = 'warning' AND is_acknowledged = FALSE THEN 1 ELSE 0 END) as warning_pending,
        SUM(CASE WHEN email_sent = TRUE THEN 1 ELSE 0 END) as emails_sent
       FROM low_stock_alerts
       WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );

    return stats[0];
  }

  /**
   * Get dashboard notifications (for admin dashboard)
   */
  async getDashboardNotifications(userId) {
    // Get recent unacknowledged alerts
    const [alerts] = await pool.query(
      `SELECT 
        a.id,
        a.alert_level,
        a.created_at,
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.stock_quantity,
        p.reorder_level
       FROM low_stock_alerts a
       JOIN products p ON a.product_id = p.id
       WHERE a.is_acknowledged = FALSE
       ORDER BY a.alert_level DESC, a.created_at DESC
       LIMIT 10`
    );

    // Get pending purchase orders
    const [pendingPOs] = await pool.query(
      `SELECT 
        id,
        po_number,
        created_at,
        status
       FROM purchases
       WHERE status = 'draft'
       ORDER BY created_at DESC
       LIMIT 5`
    );

    // Get pending online orders
    const [pendingOrders] = await pool.query(
      `SELECT 
        id,
        customer_id,
        created_at,
        status,
        total_amount
       FROM sales
       WHERE channel = 'online'
       AND status IN ('reserved', 'pending')
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return {
      low_stock_alerts: alerts.map(alert => ({
        id: alert.id,
        type: 'low_stock',
        severity: alert.alert_level,
        message: `${alert.product_name} (${alert.sku}) is ${alert.alert_level === 'critical' ? 'critically' : ''} low on stock`,
        product_id: alert.product_id,
        current_stock: alert.stock_quantity,
        reorder_level: alert.reorder_level,
        created_at: alert.created_at
      })),
      pending_purchase_orders: pendingPOs.map(po => ({
        id: po.id,
        type: 'pending_po',
        message: `Purchase Order ${po.po_number} is awaiting approval`,
        created_at: po.created_at
      })),
      pending_orders: pendingOrders.map(order => ({
        id: order.id,
        type: 'pending_order',
        message: `Order ${order.order_number} needs processing`,
        status: order.status,
        amount: order.total_amount,
        created_at: order.created_at
      }))
    };
  }
}

module.exports = new AlertService();
