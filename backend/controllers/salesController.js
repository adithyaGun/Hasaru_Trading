const { pool } = require('../config/db');
const inventoryService = require('../services/inventoryService');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ============================================
// GET ROUTES
// ============================================

/**
 * Get all sales (with filters)
 */
exports.getAllSales = async (req, res, next) => {
  try {
    const { channel, status, payment_status, start_date, end_date, customer_id, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT 
        s.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        COUNT(si.id) as item_count
      FROM sales s
      LEFT JOIN users u ON s.customer_id = u.id
      LEFT JOIN sales_items si ON s.id = si.sale_id
      WHERE 1=1
    `;

    const params = [];

    if (channel) {
      query += ' AND s.channel = ?';
      params.push(channel);
    }

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (payment_status) {
      query += ' AND s.payment_status = ?';
      params.push(payment_status);
    }

    if (start_date) {
      query += ' AND DATE(s.sale_date) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(s.sale_date) <= ?';
      params.push(end_date);
    }

    if (customer_id) {
      query += ' AND s.customer_id = ?';
      params.push(customer_id);
    }

    query += ' GROUP BY s.id ORDER BY s.sale_date DESC';

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [sales] = await pool.query(query, params);

    res.json({
      success: true,
      data: sales,
      count: sales.length,
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sale details with items and batch info
 */
exports.getSaleDetails = async (req, res, next) => {
  try {
    const { sale_id } = req.params;

    if (!sale_id) {
      throw new AppError('Sale ID is required', 400);
    }

    // Get sale header
    const [sales] = await pool.query(
      `SELECT 
        s.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        cb.name as created_by_name
       FROM sales s
       LEFT JOIN users u ON s.customer_id = u.id
       LEFT JOIN users cb ON s.created_by = cb.id
       WHERE s.id = ?`,
      [sale_id]
    );

    if (sales.length === 0) {
      throw new AppError('Sale not found', 404);
    }

    // Get sale items with batch info
    const [items] = await pool.query(
      `SELECT 
        si.*,
        p.name as product_name,
        p.sku as product_sku,
        pb.batch_number,
        s.name as supplier_name
       FROM sales_items si
       LEFT JOIN products p ON si.product_id = p.id
       LEFT JOIN product_batches pb ON si.batch_id = pb.id
       LEFT JOIN suppliers s ON pb.supplier_id = s.id
       WHERE si.sale_id = ?`,
      [sale_id]
    );

    const saleData = sales[0];
    saleData.items = items;

    res.json({
      success: true,
      data: saleData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales summary (dashboard/reporting)
 */
exports.getSalesSummary = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = ' WHERE DATE(sale_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [summary] = await pool.query(
      `SELECT 
        channel,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        SUM(discount) as total_discounts,
        AVG(total_amount) as avg_sale_value,
        MAX(total_amount) as max_sale,
        MIN(total_amount) as min_sale
       FROM sales
       ${dateFilter}
       GROUP BY channel`,
      params
    );

    res.json({
      success: true,
      data: summary,
      dateRange: { start_date, end_date }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// POST ROUTES
// ============================================

/**
 * Create a new sale (online or POS)
 * Handles FIFO stock deduction and batch tracking
 */
exports.createSale = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { customer_id, channel, items, discount = 0, payment_method, notes } = req.body;
    const created_by = req.user?.id;

    // Validation
    if (!channel || !['online', 'pos'].includes(channel)) {
      throw new AppError('Valid channel (online/pos) is required', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('At least one item is required', 400);
    }

    if (channel === 'online' && !customer_id) {
      throw new AppError('Customer ID is required for online sales', 400);
    }

    await connection.beginTransaction();

    // Calculate subtotal and validate stock
    let subtotal = 0;
    const itemsWithPrices = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT selling_price FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new AppError(`Product ${item.product_id} not found`, 404);
      }

      const unit_price = products[0].selling_price;
      const item_subtotal = unit_price * item.quantity;

      itemsWithPrices.push({
        ...item,
        unit_price,
        subtotal: item_subtotal
      });

      subtotal += item_subtotal;
    }

    const total_amount = subtotal - discount;

    if (total_amount < 0) {
      throw new AppError('Discount cannot exceed subtotal', 400);
    }

    // Create sale record
    const [saleResult] = await connection.query(
      `INSERT INTO sales 
       (customer_id, channel, sale_date, subtotal, discount, total_amount, payment_method, status, payment_status, notes, created_by)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, 'reserved', 'pending', ?, ?)`,
      [customer_id || null, channel, subtotal, discount, total_amount, payment_method, notes, created_by]
    );

    const sale_id = saleResult.insertId;

    // Process each item and deduct stock using FIFO
    for (const item of itemsWithPrices) {
      // Get available batches (FIFO order)
      const [batches] = await connection.query(
        `SELECT id, quantity_remaining, received_date
         FROM product_batches
         WHERE product_id = ? AND quantity_remaining > 0 AND is_active = 1
         ORDER BY received_date ASC
         FOR UPDATE`,
        [item.product_id]
      );

      if (batches.length === 0) {
        await connection.rollback();
        throw new AppError(`No available batches for product ${item.product_id}`, 404);
      }

      // Check total available
      const totalAvailable = batches.reduce((sum, b) => sum + b.quantity_remaining, 0);
      if (totalAvailable < item.quantity) {
        await connection.rollback();
        throw new AppError(
          `Insufficient stock for product ${item.product_id}. Available: ${totalAvailable}, Requested: ${item.quantity}`,
          400
        );
      }

      let remaining_to_deduct = item.quantity;
      let first_batch = true;

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
           (batch_id, product_id, movement_type, quantity, reference_id, reference_type, created_at)
           VALUES (?, ?, 'sale', ?, ?, 'sale', NOW())`,
          [batch.id, item.product_id, -deduct_quantity, sale_id]
        );

        // Create sale_item record (link first batch used to sale item)
        if (first_batch) {
          await connection.query(
            `INSERT INTO sales_items 
             (sale_id, batch_id, product_id, quantity, unit_price, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [sale_id, batch.id, item.product_id, item.quantity, item.unit_price, item.subtotal]
          );
          first_batch = false;
        }

        remaining_to_deduct -= deduct_quantity;
      }

      // Update product total quantity
      const [quantResult] = await connection.query(
        `SELECT COALESCE(SUM(quantity_remaining), 0) as total
         FROM product_batches
         WHERE product_id = ? AND is_active = 1`,
        [item.product_id]
      );

      await connection.query(
        'UPDATE products SET stock_quantity = ? WHERE id = ?',
        [quantResult[0].total, item.product_id]
      );
    }

    await connection.commit();

    logger.info(`Sale created - ID: ${sale_id}, Channel: ${channel}, Items: ${itemsWithPrices.length}, Total: ${total_amount}`);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: {
        sale_id,
        channel,
        subtotal,
        discount,
        total_amount,
        item_count: itemsWithPrices.length,
        status: 'reserved',
        payment_status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Confirm payment for a sale
 */
exports.confirmPayment = async (req, res, next) => {
  try {
    const { sale_id } = req.params;
    const { payment_status = 'completed' } = req.body;

    if (!sale_id) {
      throw new AppError('Sale ID is required', 400);
    }

    // Verify sale exists
    const [sales] = await pool.query('SELECT id, status FROM sales WHERE id = ?', [sale_id]);

    if (sales.length === 0) {
      throw new AppError('Sale not found', 404);
    }

    // Update sale
    await pool.query(
      `UPDATE sales 
       SET payment_status = ?, status = 'completed', updated_at = NOW()
       WHERE id = ?`,
      [payment_status, sale_id]
    );

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: { sale_id, payment_status }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process sale return
 */
exports.processSaleReturn = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { sale_id } = req.params;
    const { notes } = req.body;

    if (!sale_id) {
      throw new AppError('Sale ID is required', 400);
    }

    await connection.beginTransaction();

    // Get sale details
    const [sales] = await connection.query('SELECT * FROM sales WHERE id = ?', [sale_id]);

    if (sales.length === 0) {
      await connection.rollback();
      throw new AppError('Sale not found', 404);
    }

    if (sales[0].status === 'returned') {
      await connection.rollback();
      throw new AppError('Sale already returned', 400);
    }

    // Get sale items
    const [items] = await connection.query(
      'SELECT * FROM sales_items WHERE sale_id = ?',
      [sale_id]
    );

    // Return each item to its batch
    for (const item of items) {
      if (!item.batch_id) continue;

      // Return stock to batch
      await connection.query(
        `UPDATE product_batches 
         SET quantity_remaining = quantity_remaining + ?
         WHERE id = ?`,
        [item.quantity, item.batch_id]
      );

      // Log return movement
      await connection.query(
        `INSERT INTO stock_movements 
         (batch_id, product_id, movement_type, quantity, reference_id, reference_type, notes, created_at)
         VALUES (?, ?, 'return', ?, ?, 'sale_return', ?, NOW())`,
        [item.batch_id, item.product_id, item.quantity, sale_id, notes]
      );

      // Update product quantity
      const [quantResult] = await connection.query(
        `SELECT COALESCE(SUM(quantity_remaining), 0) as total
         FROM product_batches
         WHERE product_id = ? AND is_active = 1`,
        [item.product_id]
      );

      await connection.query(
        'UPDATE products SET stock_quantity = ? WHERE id = ?',
        [quantResult[0].total, item.product_id]
      );
    }

    // Update sale status
    await connection.query(
      `UPDATE sales 
       SET status = 'returned', payment_status = 'refunded', updated_at = NOW()
       WHERE id = ?`,
      [sale_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Sale returned - stock refunded to batches',
      data: { sale_id, status: 'returned' }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Cancel a sale
 */
exports.cancelSale = async (req, res, next) => {
  try {
    const { sale_id } = req.params;

    if (!sale_id) {
      throw new AppError('Sale ID is required', 400);
    }

    const [result] = await pool.query(
      `UPDATE sales SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [sale_id]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Sale not found', 404);
    }

    res.json({
      success: true,
      message: 'Sale cancelled',
      data: { sale_id, status: 'cancelled' }
    });
  } catch (error) {
    next(error);
  }
};
