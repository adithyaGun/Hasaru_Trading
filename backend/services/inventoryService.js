const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class InventoryService {
  /**
   * Create batch from purchase order item
   * Auto-generates batch number: PO-{po_id}-PROD-{product_id}-B{seq}
   */
  async createBatchFromPurchase(po_id, product_id, supplier_id, quantity, unit_cost, received_date) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get next batch sequence for this product
      const [batches] = await connection.query(
        'SELECT COUNT(*) as count FROM product_batches WHERE product_id = ?',
        [product_id]
      );
      const seq = (batches[0].count + 1).toString().padStart(3, '0');
      const batch_number = `PO-${po_id}-PROD-${product_id}-B${seq}`;

      // Create batch
      const [result] = await connection.query(
        `INSERT INTO product_batches 
         (product_id, supplier_id, po_id, batch_number, quantity_received, quantity_remaining, unit_cost, received_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [product_id, supplier_id, po_id, batch_number, quantity, quantity, unit_cost, received_date]
      );

      // Log stock movement
      await connection.query(
        `INSERT INTO stock_movements 
         (batch_id, product_id, movement_type, quantity, reference_id, reference_type, created_at)
         VALUES (?, ?, 'purchase', ?, ?, 'po', NOW())`,
        [result.insertId, product_id, quantity, po_id]
      );

      // Update product total quantity
      await this.updateProductTotalQuantity(connection, product_id);

      await connection.commit();

      logger.info(`Batch created: ${batch_number} with quantity ${quantity}`);

      return {
        batch_id: result.insertId,
        batch_number,
        quantity: quantity
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Deduct stock using FIFO method
   * Returns: { success, batches_used: [{batch_id, quantity}], total_deducted }
   * If insufficient stock, throws error (transactional rollback)
   */
  async deductStockFIFO(product_id, quantity) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get available batches sorted by received_date (oldest first)
      const [batches] = await connection.query(
        `SELECT id, quantity_remaining, received_date, supplier_id, unit_cost
         FROM product_batches
         WHERE product_id = ? AND quantity_remaining > 0 AND is_active = 1
         ORDER BY received_date ASC
         FOR UPDATE`,
        [product_id]
      );

      if (batches.length === 0) {
        throw new AppError('No available batches for this product', 404);
      }

      // Check total available quantity
      const totalAvailable = batches.reduce((sum, b) => sum + b.quantity_remaining, 0);
      if (totalAvailable < quantity) {
        throw new AppError(
          `Insufficient stock. Available: ${totalAvailable}, Requested: ${quantity}`,
          400
        );
      }

      const batches_used = [];
      let remaining_to_deduct = quantity;

      // Deduct from batches in FIFO order
      for (const batch of batches) {
        if (remaining_to_deduct <= 0) break;

        const deduct_quantity = Math.min(batch.quantity_remaining, remaining_to_deduct);

        // Update batch
        await connection.query(
          `UPDATE product_batches 
           SET quantity_remaining = quantity_remaining - ?
           WHERE id = ?`,
          [deduct_quantity, batch.id]
        );

        // Log stock movement
        await connection.query(
          `INSERT INTO stock_movements 
           (batch_id, product_id, movement_type, quantity, reference_type, created_at)
           VALUES (?, ?, 'sale', ?, 'sale', NOW())`,
          [batch.id, product_id, -deduct_quantity]
        );

        batches_used.push({
          batch_id: batch.id,
          quantity: deduct_quantity,
          supplier_id: batch.supplier_id,
          unit_cost: batch.unit_cost
        });

        remaining_to_deduct -= deduct_quantity;
      }

      // Update product total quantity
      await this.updateProductTotalQuantity(connection, product_id);

      await connection.commit();

      logger.info(`Stock deducted (FIFO) - Product: ${product_id}, Quantity: ${quantity}, Batches: ${batches_used.length}`);

      return {
        success: true,
        batches_used,
        total_deducted: quantity
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Return stock to batch (from return/refund)
   */
  async returnStockToBatch(batch_id, quantity, notes = null) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get batch info
      const [batches] = await connection.query(
        'SELECT product_id FROM product_batches WHERE id = ?',
        [batch_id]
      );

      if (batches.length === 0) {
        throw new AppError('Batch not found', 404);
      }

      const product_id = batches[0].product_id;

      // Update batch quantity
      await connection.query(
        `UPDATE product_batches 
         SET quantity_remaining = quantity_remaining + ?
         WHERE id = ?`,
        [quantity, batch_id]
      );

      // Log stock movement
      await connection.query(
        `INSERT INTO stock_movements 
         (batch_id, product_id, movement_type, quantity, reference_type, notes, created_at)
         VALUES (?, ?, 'return', ?, 'return', ?, NOW())`,
        [batch_id, product_id, quantity, notes]
      );

      // Update product total quantity
      await this.updateProductTotalQuantity(connection, product_id);

      await connection.commit();

      logger.info(`Stock returned to batch ${batch_id}: ${quantity} units`);

      return { success: true, quantity_returned: quantity };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update product total quantity (sum of all active batches)
   */
  async updateProductTotalQuantity(connection, product_id) {
    const [result] = await connection.query(
      `SELECT COALESCE(SUM(quantity_remaining), 0) as total
       FROM product_batches
       WHERE product_id = ? AND is_active = 1`,
      [product_id]
    );

    const total_quantity = result[0].total;

    await connection.query(
      'UPDATE products SET stock_quantity = ? WHERE id = ?',
      [total_quantity, product_id]
    );
  }

  /**
   * Get all batches for a product with current status
   */
  async getBatchesForProduct(product_id) {
    const [batches] = await pool.query(
      `SELECT 
        pb.id,
        pb.batch_number,
        pb.quantity_received,
        pb.quantity_remaining,
        pb.unit_cost,
        pb.received_date,
        pb.expiry_date,
        s.name as supplier_name,
        s.id as supplier_id,
        CASE 
          WHEN pb.quantity_remaining = 0 THEN 'depleted'
          WHEN CURDATE() > pb.expiry_date AND pb.expiry_date IS NOT NULL THEN 'expired'
          ELSE 'active'
        END as status
       FROM product_batches pb
       LEFT JOIN suppliers s ON pb.supplier_id = s.id
       WHERE pb.product_id = ? AND pb.is_active = 1
       ORDER BY pb.received_date ASC`,
      [product_id]
    );

    return batches;
  }

  /**
   * Get batch details
   */
  async getBatchDetails(batch_id) {
    const [batches] = await pool.query(
      `SELECT 
        pb.*,
        p.name as product_name,
        p.sku as product_sku,
        s.name as supplier_name
       FROM product_batches pb
       LEFT JOIN products p ON pb.product_id = p.id
       LEFT JOIN suppliers s ON pb.supplier_id = s.id
       WHERE pb.id = ?`,
      [batch_id]
    );

    if (batches.length === 0) {
      throw new AppError('Batch not found', 404);
    }

    return batches[0];
  }

  /**
   * Get stock movement history for a batch
   */
  async getBatchMovementHistory(batch_id) {
    const [movements] = await pool.query(
      `SELECT 
        sm.*,
        u.name as performed_by_name
       FROM stock_movements sm
       LEFT JOIN users u ON sm.performed_by = u.id
       WHERE sm.batch_id = ?
       ORDER BY sm.created_at DESC`,
      [batch_id]
    );

    return movements;
  }

  /**
   * Get expiring batches (for alerts)
   */
  async getExpiringBatches(days = 30) {
    const [batches] = await pool.query(
      `SELECT 
        pb.id,
        pb.batch_number,
        pb.expiry_date,
        pb.quantity_remaining,
        p.name as product_name,
        s.name as supplier_name,
        DATEDIFF(pb.expiry_date, CURDATE()) as days_until_expiry
       FROM product_batches pb
       LEFT JOIN products p ON pb.product_id = p.id
       LEFT JOIN suppliers s ON pb.supplier_id = s.id
       WHERE pb.is_active = 1 
       AND pb.expiry_date IS NOT NULL
       AND pb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND pb.expiry_date > CURDATE()
       ORDER BY pb.expiry_date ASC`,
      [days]
    );

    return batches;
  }

  /**
   * Deactivate batch (when depleted or expired)
   */
  async deactivateBatch(batch_id, reason = 'depleted') {
    const [result] = await pool.query(
      `UPDATE product_batches 
       SET is_active = 0, updated_at = NOW()
       WHERE id = ?`,
      [batch_id]
    );

    logger.info(`Batch ${batch_id} deactivated (reason: ${reason})`);

    return { success: true };
  }

  /**
   * Get stock movement history (audit trail)
   */
  async getStockMovementHistory(filters = {}) {
    let query = `
      SELECT 
        sm.*,
        p.name as product_name,
        s.name as supplier_name,
        pb.batch_number,
        u.name as performed_by_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN suppliers s ON pb.supplier_id = s.id
      LEFT JOIN product_batches pb ON sm.batch_id = pb.id
      LEFT JOIN users u ON sm.performed_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.product_id) {
      query += ' AND sm.product_id = ?';
      params.push(filters.product_id);
    }

    if (filters.batch_id) {
      query += ' AND sm.batch_id = ?';
      params.push(filters.batch_id);
    }

    if (filters.movement_type) {
      query += ' AND sm.movement_type = ?';
      params.push(filters.movement_type);
    }

    if (filters.start_date) {
      query += ' AND DATE(sm.created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(sm.created_at) <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY sm.created_at DESC LIMIT 100';

    const [movements] = await pool.query(query, params);

    return movements;
  }
}

module.exports = new InventoryService();
