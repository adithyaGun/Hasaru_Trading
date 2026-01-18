const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { generateOrderNumber, getPaginationParams } = require('../utils/helpers');
const { PO_STATUS, TRANSACTION_TYPES } = require('../config/constants');
const stockService = require('./stockService');

class PurchaseService {
  /**
   * Create purchase order
   */
  async createPurchaseOrder(data, userId) {
    const { supplier_id, order_date, expected_delivery_date, items, notes } = data;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Generate PO number
      const [lastPO] = await connection.query(
        'SELECT id FROM purchases ORDER BY id DESC LIMIT 1'
      );
      const po_number = generateOrderNumber('PO', lastPO[0]?.id || 0);

      // Calculate total amount
      const total_amount = items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );

      // Insert purchase order
      const [result] = await connection.query(
        `INSERT INTO purchases 
         (po_number, supplier_id, order_date, expected_delivery_date, status, total_amount, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [po_number, supplier_id, order_date, expected_delivery_date, PO_STATUS.DRAFT, total_amount, notes]
      );

      const purchaseId = result.insertId;

      // Insert purchase items
      for (const item of items) {
        await connection.query(
          `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
          [purchaseId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
        );
      }

      await connection.commit();
      return await this.getPurchaseById(purchaseId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Approve purchase order (Admin only)
   */
  async approvePurchaseOrder(id, userId) {
    const purchase = await this.getPurchaseById(id);

    if (purchase.status !== PO_STATUS.DRAFT) {
      throw new AppError('Only draft purchase orders can be approved', 400);
    }

    await pool.query(
      `UPDATE purchases 
       SET status = ?, approved_by = ?, approved_date = NOW() 
       WHERE id = ?`,
      [PO_STATUS.APPROVED, userId, id]
    );

    return await this.getPurchaseById(id);
  }

  /**
   * Receive goods (update stock)
   */
  async receiveGoods(id, userId) {
    const purchase = await this.getPurchaseById(id);

    if (purchase.status !== PO_STATUS.APPROVED) {
      throw new AppError('Only approved purchase orders can be received', 400);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get purchase items
      const [items] = await connection.query(
        'SELECT * FROM purchase_items WHERE purchase_id = ?',
        [id]
      );

      // Update stock for each item
      const stockUpdates = items.map(item => ({
        product_id: item.product_id,
        quantity_change: item.quantity
      }));

      // Update stock using stock service
      await stockService.updateStockBatch(
        stockUpdates,
        TRANSACTION_TYPES.PURCHASE,
        id,
        userId
      );

      // Update purchase status
      await connection.query(
        `UPDATE purchases 
         SET status = ?, received_by = ?, received_date = NOW() 
         WHERE id = ?`,
        [PO_STATUS.RECEIVED, userId, id]
      );

      // Update product purchase prices
      for (const item of items) {
        await connection.query(
          'UPDATE products SET purchase_price = ? WHERE id = ?',
          [item.unit_price, item.product_id]
        );
      }

      await connection.commit();
      return await this.getPurchaseById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all purchase orders
   */
  async getAllPurchases(filters = {}, page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);

    let query = `
      SELECT 
        p.*,
        s.name as supplier_name,
        u1.name as approved_by_name,
        u2.name as received_by_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN users u1 ON p.approved_by = u1.id
      LEFT JOIN users u2 ON p.received_by = u2.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.supplier_id) {
      query += ' AND p.supplier_id = ?';
      params.push(filters.supplier_id);
    }

    // Get total
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const [purchases] = await pool.query(query, params);

    return {
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseById(id) {
    const [purchases] = await pool.query(
      `SELECT 
        p.*,
        s.name as supplier_name,
        s.phone as supplier_phone,
        s.email as supplier_email,
        u1.name as approved_by_name,
        u2.name as received_by_name
       FROM purchases p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       LEFT JOIN users u1 ON p.approved_by = u1.id
       LEFT JOIN users u2 ON p.received_by = u2.id
       WHERE p.id = ?`,
      [id]
    );

    if (purchases.length === 0) {
      throw new AppError('Purchase order not found', 404);
    }

    const purchase = purchases[0];

    // Get items
    const [items] = await pool.query(
      `SELECT 
        pi.*,
        pr.name as product_name,
        pr.sku
       FROM purchase_items pi
       JOIN products pr ON pi.product_id = pr.id
       WHERE pi.purchase_id = ?`,
      [id]
    );

    purchase.items = items;

    return purchase;
  }
}

module.exports = new PurchaseService();
