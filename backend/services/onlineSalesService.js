const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { generateOrderNumber, calculateDiscount, getPaginationParams } = require('../utils/helpers');
const { ONLINE_ORDER_STATUS, PAYMENT_STATUS, TRANSACTION_TYPES } = require('../config/constants');
const stockService = require('./stockService');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class OnlineSalesService {
  /**
   * Add item to cart
   */
  async addToCart(customerId, productId, quantity) {
    // Check if product exists and has stock
    const [products] = await pool.query(
      'SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found', 404);
    }

    if (products[0].stock_quantity < quantity) {
      throw new AppError('Insufficient stock available', 400);
    }

    // Check if item already in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE customer_id = ? AND product_id = ?',
      [customerId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      
      if (products[0].stock_quantity < newQuantity) {
        throw new AppError('Insufficient stock available', 400);
      }

      await pool.query(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
        [customerId, productId, quantity]
      );
    }

    return await this.getCart(customerId);
  }

  /**
   * Get customer cart
   */
  async getCart(customerId) {
    const [items] = await pool.query(
      `SELECT 
        c.*,
        p.name as product_name,
        p.sku,
        p.selling_price,
        p.stock_quantity,
        (c.quantity * p.selling_price) as item_total
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.customer_id = ? AND p.is_active = TRUE`,
      [customerId]
    );

    // Get active promotions
    const productIds = items.map(item => item.product_id);
    let promotions = [];

    if (productIds.length > 0) {
      [promotions] = await pool.query(
        `SELECT 
          pp.product_id,
          pr.discount_type,
          pr.discount_value
         FROM product_promotions pp
         JOIN promotions pr ON pp.promotion_id = pr.id
         WHERE pp.product_id IN (?)
         AND pr.is_active = TRUE
         AND pr.start_date <= NOW()
         AND pr.end_date >= NOW()`,
        [productIds]
      );
    }

    // Calculate totals with discounts
    let subtotal = 0;
    let discount_amount = 0;

    items.forEach(item => {
      const itemTotal = parseFloat(item.item_total) ||0;
      const promotion = promotions.find(p => p.product_id === item.product_id);
      if (promotion) {
        const itemDiscount = calculateDiscount(
          itemTotal,
          promotion.discount_type,
          promotion.discount_value
        );
        discount_amount += parseFloat(itemDiscount) || 0;
        item.discount = parseFloat(itemDiscount) || 0;
        item.final_price = itemTotal - (parseFloat(itemDiscount) || 0);
      } else {
        item.discount = 0;
        item.final_price = itemTotal;
      }
      subtotal += itemTotal;
    });

    return {
      items,
      summary: {
        subtotal: parseFloat(subtotal) || 0,
        discount_amount: parseFloat(discount_amount) || 0,
        total: parseFloat(subtotal - discount_amount) || 0
      }
    };
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(customerId, productId, quantity) {
    if (quantity <= 0) {
      return await this.removeFromCart(customerId, productId);
    }

    // Check stock
    const [products] = await pool.query(
      'SELECT stock_quantity FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found', 404);
    }

    if (products[0].stock_quantity < quantity) {
      throw new AppError('Insufficient stock available', 400);
    }

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE customer_id = ? AND product_id = ?',
      [quantity, customerId, productId]
    );

    return await this.getCart(customerId);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(customerId, productId) {
    await pool.query(
      'DELETE FROM cart WHERE customer_id = ? AND product_id = ?',
      [customerId, productId]
    );

    return await this.getCart(customerId);
  }

  /**
   * Checkout - Create order from cart
   */
  async checkout(customerId, checkoutData) {
    const { shipping_address, payment_method, notes } = checkoutData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get cart items
      const cart = await this.getCart(customerId);

      if (cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      // Combine shipping address and notes
      const orderNotes = shipping_address 
        ? `Shipping Address: ${shipping_address}${notes ? '\n\nNotes: ' + notes : ''}` 
        : notes || null;

      // Create sale record using unified sales table
      const [saleResult] = await connection.query(
        `INSERT INTO sales 
         (customer_id, channel, sale_date, subtotal, discount, total_amount, 
          payment_method, payment_status, status, notes, created_by)
         VALUES (?, 'online', NOW(), ?, ?, ?, ?, 'pending', 'reserved', ?, ?)`,
        [
          customerId,
          parseFloat(cart.summary.subtotal) || 0,
          parseFloat(cart.summary.discount_amount) || 0,
          parseFloat(cart.summary.total) || 0,
          payment_method,
          orderNotes,
          customerId
        ]
      );

      const saleId = saleResult.insertId;

      // Create sale items using unified sales_items table
      for (const item of cart.items) {
        // Get first available batch for the product (FIFO)
        const [batches] = await connection.query(
          `SELECT id, quantity_remaining 
           FROM product_batches 
           WHERE product_id = ? AND quantity_remaining > 0 AND is_active = 1
           ORDER BY received_date ASC
           LIMIT 1`,
          [item.product_id]
        );

        const batchId = batches.length > 0 ? batches[0].id : null;

        await connection.query(
          `INSERT INTO sales_items 
           (sale_id, batch_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            saleId,
            batchId,
            item.product_id,
            parseInt(item.quantity) || 0,
            parseFloat(item.selling_price) || 0,
            parseFloat(item.final_price) || 0
          ]
        );
      }

      // Clear cart
      await connection.query(
        'DELETE FROM cart WHERE customer_id = ?',
        [customerId]
      );

      await connection.commit();

      const order = await this.getOrderById(saleId);

      // Prepare email data with properly formatted fields
      const emailOrder = {
        ...order,
        order_number: `ONL-${String(saleId).padStart(6, '0')}`,
        order_date: order.sale_date,
        shipping_address: shipping_address || 'Not provided'
      };

      const customer = {
        name: order.customer_name,
        email: order.customer_email
      };

      // Send confirmation email (async, don't block response)
      emailService.sendOrderConfirmation(emailOrder, customer)
        .catch(error => {
          console.error('Failed to send order confirmation email:', error);
          // Don't fail the request if email fails
        });

      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update order status and handle stock deduction
   */
  async updateOrderStatus(orderId, status, userId) {
    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const validStatuses = ['reserved', 'processing', 'shipped', 'completed', 'returned', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const order = await this.getOrderById(orderId);
    const oldStatus = order.status;

    if (order.status === 'cancelled') {
      throw new AppError('Cannot update cancelled order', 400);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update the status
      await connection.query(
        'UPDATE sales SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, orderId]
      );

      // If marking as completed, also mark payment as completed if it was pending
      if (status === 'completed' && order.payment_status === 'pending') {
        await connection.query(
          'UPDATE sales SET payment_status = ? WHERE id = ?',
          ['completed', orderId]
        );
      }

      await connection.commit();
      
      const updatedOrder = await this.getOrderById(orderId);
      
      // Send email notification to customer if status actually changed
      if (oldStatus !== status) {
        const customer = {
          name: order.customer_name,
          email: order.customer_email
        };
        
        // Send email asynchronously (don't wait for it)
        emailService.sendOrderStatusUpdate(updatedOrder, customer, oldStatus, status)
          .catch(err => logger.error(`Email notification failed for order ${orderId}: ${err.message}`));
      }
      
      return updatedOrder;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all orders
   */
  async getAllOrders(filters = {}, page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);

    let query = `
      SELECT 
        s.*,
        u.name as customer_name,
        u.email as customer_email
      FROM sales s
      JOIN users u ON s.customer_id = u.id
      WHERE s.channel = 'online'
    `;

    const params = [];

    if (filters.customer_id) {
      query += ' AND s.customer_id = ?';
      params.push(filters.customer_id);
    }

    if (filters.status) {
      query += ' AND s.status = ?';
      params.push(filters.status);
    }

    // Get total
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const [orders] = await pool.query(query, params);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    const [orders] = await pool.query(
      `SELECT 
        s.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
       FROM sales s
       JOIN users u ON s.customer_id = u.id
       WHERE s.id = ? AND s.channel = 'online'`,
      [id]
    );

    if (orders.length === 0) {
      throw new AppError('Order not found', 404);
    }

    const order = orders[0];

    // Get items
    const [items] = await pool.query(
      `SELECT 
        si.*,
        p.name as product_name,
        p.sku
       FROM sales_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [id]
    );

    order.items = items;

    return order;
  }
}

module.exports = new OnlineSalesService();
