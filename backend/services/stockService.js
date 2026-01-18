const { pool } = require('../config/db');
const { TRANSACTION_TYPES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class StockService {
  /**
   * Update stock quantity and create log entry
   */
  async updateStock(productId, quantityChange, transactionType, referenceId, performedBy, notes = null) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get current stock
      const [products] = await connection.query(
        'SELECT stock_quantity, name, sku, reorder_level, minimum_stock_level, category FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );

      if (products.length === 0) {
        throw new AppError('Product not found', 404);
      }

      const product = products[0];
      const quantityBefore = product.stock_quantity;
      const quantityAfter = quantityBefore + quantityChange;

      // Prevent negative stock
      if (quantityAfter < 0) {
        throw new AppError(`Insufficient stock. Available: ${quantityBefore}`, 400);
      }

      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = ? WHERE id = ?',
        [quantityAfter, productId]
      );

      // Create stock log entry
      await connection.query(
        `INSERT INTO stock_logs 
         (product_id, transaction_type, reference_id, quantity_change, quantity_before, quantity_after, performed_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, transactionType, referenceId, quantityChange, quantityBefore, quantityAfter, performedBy, notes]
      );

      // Check if low stock alert should be triggered
      if (quantityAfter <= product.reorder_level) {
        await this.createLowStockAlert(connection, {
          ...product,
          stock_quantity: quantityAfter
        });
      }

      await connection.commit();

      logger.info(`Stock updated for product ${productId}: ${quantityBefore} → ${quantityAfter}`);

      return {
        product_id: productId,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        change: quantityChange
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update stock for multiple products (batch operation)
   */
  async updateStockBatch(stockUpdates, transactionType, referenceId, performedBy) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const results = [];

      for (const update of stockUpdates) {
        const { product_id, quantity_change } = update;

        // Get current stock
        const [products] = await connection.query(
          'SELECT stock_quantity, name, sku, reorder_level, minimum_stock_level, category FROM products WHERE id = ? FOR UPDATE',
          [product_id]
        );

        if (products.length === 0) {
          throw new AppError(`Product ID ${product_id} not found`, 404);
        }

        const product = products[0];
        const quantityBefore = product.stock_quantity;
        const quantityAfter = quantityBefore + quantity_change;

        // Prevent negative stock
        if (quantityAfter < 0) {
          throw new AppError(`Insufficient stock for ${product.name}. Available: ${quantityBefore}`, 400);
        }

        // Update product stock
        await connection.query(
          'UPDATE products SET stock_quantity = ? WHERE id = ?',
          [quantityAfter, product_id]
        );

        // Create stock log entry
        await connection.query(
          `INSERT INTO stock_logs 
           (product_id, transaction_type, reference_id, quantity_change, quantity_before, quantity_after, performed_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [product_id, transactionType, referenceId, quantity_change, quantityBefore, quantityAfter, performedBy]
        );

        // Check for low stock
        if (quantityAfter <= product.reorder_level) {
          await this.createLowStockAlert(connection, {
            ...product,
            stock_quantity: quantityAfter
          });
        }

        results.push({
          product_id,
          product_name: product.name,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter
        });
      }

      await connection.commit();

      logger.info(`Batch stock update completed for ${results.length} products`);

      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Create low stock alert
   */
  async createLowStockAlert(connection, product) {
    const alertLevel = product.stock_quantity <= product.minimum_stock_level ? 'critical' : 'warning';

    // Check if alert already exists for today
    const [existingAlerts] = await connection.query(
      `SELECT id FROM low_stock_alerts 
       WHERE product_id = ? AND is_acknowledged = FALSE AND DATE(created_at) = CURDATE()`,
      [product.id]
    );

    if (existingAlerts.length > 0) {
      // Alert already exists for today
      return;
    }

    // Create new alert
    const [result] = await connection.query(
      `INSERT INTO low_stock_alerts (product_id, current_stock, reorder_level, alert_level)
       VALUES (?, ?, ?, ?)`,
      [product.id, product.stock_quantity, product.reorder_level, alertLevel]
    );

    // Send email notification (don't await, let it run async)
    emailService.sendLowStockAlert(product, alertLevel)
      .then(() => {
        // Update alert to mark email as sent
        connection.query(
          'UPDATE low_stock_alerts SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
          [result.insertId]
        ).catch(err => logger.error(`Failed to update email_sent flag: ${err.message}`));
      })
      .catch(err => logger.error(`Email service error: ${err.message}`));

    logger.info(`Low stock alert created for product ${product.id} - ${alertLevel}`);
  }

  /**
   * Get stock history for a product
   */
  async getStockHistory(productId, limit = 50) {
    const [logs] = await pool.query(
      `SELECT 
        sl.*,
        u.name as performed_by_name
       FROM stock_logs sl
       LEFT JOIN users u ON sl.performed_by = u.id
       WHERE sl.product_id = ?
       ORDER BY sl.created_at DESC
       LIMIT ?`,
      [productId, limit]
    );

    return logs;
  }

  /**
   * Get current stock status for all products
   */
  async getAllStockStatus(filters = {}) {
    let query = `
      SELECT 
        id,
        name,
        sku,
        category,
        stock_quantity,
        reorder_level,
        minimum_stock_level,
        purchase_price,
        selling_price,
        (stock_quantity * purchase_price) as stock_value,
        CASE 
          WHEN stock_quantity <= minimum_stock_level THEN 'critical'
          WHEN stock_quantity <= reorder_level THEN 'low'
          ELSE 'normal'
        END as stock_status
      FROM products
      WHERE is_active = TRUE
    `;

    const params = [];

    if (filters.status) {
      if (filters.status === 'critical') {
        query += ' AND stock_quantity <= minimum_stock_level';
      } else if (filters.status === 'low') {
        query += ' AND stock_quantity > minimum_stock_level AND stock_quantity <= reorder_level';
      } else if (filters.status === 'normal') {
        query += ' AND stock_quantity > reorder_level';
      }
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY stock_quantity ASC';

    const [products] = await pool.query(query, params);

    return products;
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    const [products] = await pool.query(
      `SELECT 
        p.*,
        CASE 
          WHEN p.stock_quantity <= p.minimum_stock_level THEN 'critical'
          ELSE 'low'
        END as alert_level
       FROM products p
       WHERE p.is_active = TRUE 
       AND p.stock_quantity <= p.reorder_level
       ORDER BY p.stock_quantity ASC`
    );

    return products;
  }
}

module.exports = new StockService();
