const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { generateOrderNumber, calculateDiscount, getPaginationParams } = require('../utils/helpers');
const { ONLINE_ORDER_STATUS, PAYMENT_STATUS, TRANSACTION_TYPES, SALE_TYPES } = require('../config/constants');
const stockService = require('./stockService');
const emailService = require('./emailService');

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
      const promotion = promotions.find(p => p.product_id === item.product_id);
      if (promotion) {
        const itemDiscount = calculateDiscount(
          item.item_total,
          promotion.discount_type,
          promotion.discount_value
        );
        discount_amount += itemDiscount;
        item.discount = itemDiscount;
        item.final_price = item.item_total - itemDiscount;
      } else {
        item.discount = 0;
        item.final_price = item.item_total;
      }
      subtotal += item.item_total;
    });

    return {
      items,
      summary: {
        subtotal,
        discount_amount,
        total: subtotal - discount_amount
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

      // Generate order number
      const [lastOrder] = await connection.query(
        'SELECT id FROM online_sales ORDER BY id DESC LIMIT 1'
      );
      const order_number = generateOrderNumber('ONL', lastOrder[0]?.id || 0);

      // Create order
      const [orderResult] = await connection.query(
        `INSERT INTO online_sales 
         (order_number, customer_id, status, payment_status, payment_method, 
          subtotal, discount_amount, total_amount, shipping_address, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order_number,
          customerId,
          ONLINE_ORDER_STATUS.PENDING,
          PAYMENT_STATUS.UNPAID,
          payment_method,
          cart.summary.subtotal,
          cart.summary.discount_amount,
          cart.summary.total,
          shipping_address,
          notes
        ]
      );

      const orderId = orderResult.insertId;

      // Create sale items
      for (const item of cart.items) {
        await connection.query(
          `INSERT INTO sale_items 
           (sale_type, sale_id, product_id, quantity, unit_price, discount_amount, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            SALE_TYPES.ONLINE,
            orderId,
            item.product_id,
            item.quantity,
            item.selling_price,
            item.discount || 0,
            item.final_price
          ]
        );
      }

      // Clear cart
      await connection.query(
        'DELETE FROM cart WHERE customer_id = ?',
        [customerId]
      );

      await connection.commit();

      const order = await this.getOrderById(orderId);

      // Send confirmation email
      const [customers] = await pool.query(
        'SELECT name, email FROM users WHERE id = ?',
        [customerId]
      );
      if (customers.length > 0) {
        emailService.sendOrderConfirmation(order, customers[0]);
      }

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
    const order = await this.getOrderById(orderId);

    if (order.status === ONLINE_ORDER_STATUS.CANCELLED) {
      throw new AppError('Cannot update cancelled order', 400);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // If status is paid and was previously unpaid, deduct stock
      if (status === ONLINE_ORDER_STATUS.PAID && order.payment_status === PAYMENT_STATUS.UNPAID) {
        const stockUpdates = order.items.map(item => ({
          product_id: item.product_id,
          quantity_change: -item.quantity
        }));

        await stockService.updateStockBatch(
          stockUpdates,
          TRANSACTION_TYPES.ONLINE_SALE,
          orderId,
          userId
        );

        await connection.query(
          'UPDATE online_sales SET status = ?, payment_status = ? WHERE id = ?',
          [status, PAYMENT_STATUS.PAID, orderId]
        );
      } else {
        await connection.query(
          'UPDATE online_sales SET status = ?, processed_by = ?, processed_date = NOW() WHERE id = ?',
          [status, userId, orderId]
        );
      }

      await connection.commit();
      return await this.getOrderById(orderId);
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
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM online_sales o
      JOIN users u ON o.customer_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.customer_id) {
      query += ' AND o.customer_id = ?';
      params.push(filters.customer_id);
    }

    if (filters.status) {
      query += ' AND o.status = ?';
      params.push(filters.status);
    }

    // Get total
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
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
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
       FROM online_sales o
       JOIN users u ON o.customer_id = u.id
       WHERE o.id = ?`,
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
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_type = ? AND si.sale_id = ?`,
      [SALE_TYPES.ONLINE, id]
    );

    order.items = items;

    return order;
  }
}

module.exports = new OnlineSalesService();
