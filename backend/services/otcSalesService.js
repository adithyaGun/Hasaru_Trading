const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { generateOrderNumber, calculateDiscount, getPaginationParams } = require('../utils/helpers');
const { PAYMENT_METHODS, TRANSACTION_TYPES } = require('../config/constants');
const stockService = require('./stockService');

class OTCSalesService {
  /**
   * Create OTC sale
   */
  async createSale(saleData, salesStaffId) {
    const { items, payment_method, amount_paid, customer_name, customer_phone, notes } = saleData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch products and calculate totals
      let subtotal = 0;
      let discount_amount = 0;
      const saleItems = [];

      for (const item of items) {
        // Get product details
        const [products] = await connection.query(
          'SELECT id, name, sku, selling_price, stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
          [item.product_id]
        );

        if (products.length === 0) {
          throw new AppError(`Product ID ${item.product_id} not found`, 404);
        }

        const product = products[0];

        // Check stock availability
        if (product.stock_quantity < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`, 400);
        }

        // Check for active promotions
        const [promotions] = await connection.query(
          `SELECT pr.discount_type, pr.discount_value
           FROM product_promotions pp
           JOIN promotions pr ON pp.promotion_id = pr.id
           WHERE pp.product_id = ?
           AND pr.is_active = TRUE
           AND pr.start_date <= NOW()
           AND pr.end_date >= NOW()
           LIMIT 1`,
          [product.id]
        );

        const itemTotal = parseFloat(product.selling_price) * parseInt(item.quantity);
        let itemDiscount = 0;

        if (promotions.length > 0) {
          itemDiscount = calculateDiscount(
            itemTotal,
            promotions[0].discount_type,
            promotions[0].discount_value
          );
          discount_amount += parseFloat(itemDiscount) || 0;
        }

        subtotal += itemTotal;

        saleItems.push({
          product_id: product.id,
          quantity: parseInt(item.quantity) || 0,
          unit_price: parseFloat(product.selling_price) || 0,
          discount_amount: parseFloat(itemDiscount) || 0,
          total_price: parseFloat(itemTotal - itemDiscount) || 0
        });
      }

      const total_amount = subtotal - discount_amount;

      // Validate payment
      if (amount_paid < total_amount) {
        throw new AppError('Amount paid is less than total amount', 400);
      }

      const change_amount = amount_paid - total_amount;

      // Prepare notes with customer info and payment details
      let saleNotes = '';
      if (customer_name || customer_phone) {
        saleNotes += `Customer: ${customer_name || 'Walk-in'}${customer_phone ? ' | Phone: ' + customer_phone : ''}\n`;
      }
      saleNotes += `Paid: Rs. ${parseFloat(amount_paid).toFixed(2)} | Change: Rs. ${parseFloat(change_amount).toFixed(2)}`;
      if (notes) {
        saleNotes += `\n${notes}`;
      }

      // Insert into unified sales table
      const [result] = await connection.query(
        `INSERT INTO sales 
         (customer_id, channel, sale_date, subtotal, discount, total_amount,
          payment_method, payment_status, status, notes, created_by)
         VALUES (NULL, 'pos', NOW(), ?, ?, ?, ?, 'completed', 'completed', ?, ?)`,
        [
          parseFloat(subtotal) || 0,
          parseFloat(discount_amount) || 0,
          parseFloat(total_amount) || 0,
          payment_method,
          saleNotes,
          salesStaffId
        ]
      );

      const saleId = result.insertId;

      // Insert sale items with FIFO batch tracking
      for (const saleItem of saleItems) {
        // Get first available batch for the product (FIFO)
        const [batches] = await connection.query(
          `SELECT id FROM product_batches 
           WHERE product_id = ? AND quantity_remaining > 0 AND is_active = 1
           ORDER BY received_date ASC
           LIMIT 1`,
          [saleItem.product_id]
        );

        const batchId = batches.length > 0 ? batches[0].id : null;

        await connection.query(
          `INSERT INTO sales_items 
           (sale_id, batch_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            saleId,
            batchId,
            saleItem.product_id,
            parseInt(saleItem.quantity) || 0,
            parseFloat(saleItem.unit_price) || 0,
            parseFloat(saleItem.total_price) || 0
          ]
        );
      }

      // Deduct stock immediately
      const stockUpdates = saleItems.map(item => ({
        product_id: item.product_id,
        quantity_change: -item.quantity
      }));

      await stockService.updateStockBatch(
        stockUpdates,
        TRANSACTION_TYPES.OTC_SALE,
        saleId,
        salesStaffId
      );

      await connection.commit();

      return await this.getSaleById(saleId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all OTC sales
   */
  async getAllSales(filters = {}, page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);

    let query = `
      SELECT 
        s.*,
        u.name as sales_staff_name
      FROM sales s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.channel = 'pos'
    `;

    const params = [];

    if (filters.sales_staff_id) {
      query += ' AND s.created_by = ?';
      params.push(filters.sales_staff_id);
    }

    if (filters.payment_method) {
      query += ' AND s.payment_method = ?';
      params.push(filters.payment_method);
    }

    if (filters.date_from) {
      query += ' AND DATE(s.sale_date) >= ?';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND DATE(s.sale_date) <= ?';
      params.push(filters.date_to);
    }

    // Get total
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY s.sale_date DESC LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const [sales] = await pool.query(query, params);

    return {
      sales,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get OTC sale by ID
   */
  async getSaleById(id) {
    const [sales] = await pool.query(
      `SELECT 
        s.*,
        u.name as sales_staff_name
       FROM sales s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = ? AND s.channel = 'pos'`,
      [id]
    );

    if (sales.length === 0) {
      throw new AppError('Sale not found', 404);
    }

    const sale = sales[0];

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

    sale.items = items;

    return sale;
  }

  /**
   * Generate invoice (formatted for printing)
   */
  async generateInvoice(id) {
    const sale = await this.getSaleById(id);

    // Format invoice data
    const invoice = {
      invoice_number: `INV-${String(sale.id).padStart(6, '0')}`,
      date: new Date(sale.sale_date).toLocaleString(),
      customer: {
        name: sale.customer_name || 'Walk-in Customer',
        phone: sale.customer_phone || 'N/A'
      },
      sales_staff: sale.sales_staff_name,
      items: sale.items.map(item => ({
        name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price).toFixed(2),
        discount: '0.00',
        total: parseFloat(item.subtotal).toFixed(2)
      })),
      payment: {
        method: sale.payment_method ? sale.payment_method.toUpperCase() : 'CASH',
        subtotal: parseFloat(sale.subtotal).toFixed(2),
        discount: parseFloat(sale.discount).toFixed(2),
        total: parseFloat(sale.total_amount).toFixed(2),
        paid: parseFloat(sale.total_amount).toFixed(2),
        change: '0.00'
      },
      notes: sale.notes
    };

    return invoice;
  }

  /**
   * Search products for OTC interface (by name, SKU, or barcode)
   */
  async searchProducts(searchTerm) {
    const [products] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.category,
        p.brand,
        p.selling_price,
        p.stock_quantity,
        CASE 
          WHEN p.stock_quantity <= p.minimum_stock_level THEN 'critical'
          WHEN p.stock_quantity <= p.reorder_level THEN 'low'
          ELSE 'normal'
        END as stock_status
       FROM products p
       WHERE p.is_active = TRUE
       AND (
         p.name LIKE ? OR 
         p.sku LIKE ? OR 
         p.barcode LIKE ?
       )
       AND p.stock_quantity > 0
       ORDER BY p.name
       LIMIT 20`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );

    // Get active promotions for products
    const productIds = products.map(p => p.id);
    if (productIds.length > 0) {
      const [promotions] = await pool.query(
        `SELECT 
          pp.product_id,
          pr.name as promotion_name,
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

      products.forEach(product => {
        const promotion = promotions.find(p => p.product_id === product.id);
        product.promotion = promotion || null;
      });
    }

    return products;
  }
}

module.exports = new OTCSalesService();
