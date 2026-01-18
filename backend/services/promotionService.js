const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams } = require('../utils/helpers');

class PromotionService {
  /**
   * Get all promotions
   */
  async getAllPromotions(filters = {}, page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);

    let query = `
      SELECT * FROM promotions
      WHERE 1=1
    `;

    const params = [];

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.active_now) {
      query += ' AND is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()';
    }

    // Get total
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const [promotions] = await pool.query(query, params);

    return {
      promotions,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id) {
    const [promotions] = await pool.query(
      'SELECT * FROM promotions WHERE id = ?',
      [id]
    );

    if (promotions.length === 0) {
      throw new AppError('Promotion not found', 404);
    }

    const promotion = promotions[0];

    // Get associated products
    const [products] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        p.selling_price
       FROM product_promotions pp
       JOIN products p ON pp.product_id = p.id
       WHERE pp.promotion_id = ?`,
      [id]
    );

    promotion.products = products;

    return promotion;
  }

  /**
   * Create promotion
   */
  async createPromotion(data) {
    const {
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      applicable_to,
      product_ids = []
    } = data;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert promotion
      const [result] = await connection.query(
        `INSERT INTO promotions 
         (name, description, discount_type, discount_value, start_date, end_date, applicable_to)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, discount_type, discount_value, start_date, end_date, applicable_to]
      );

      const promotionId = result.insertId;

      // If specific products, link them
      if (applicable_to === 'specific' && product_ids.length > 0) {
        for (const productId of product_ids) {
          await connection.query(
            'INSERT INTO product_promotions (product_id, promotion_id) VALUES (?, ?)',
            [productId, promotionId]
          );
        }
      }

      await connection.commit();

      return await this.getPromotionById(promotionId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update promotion
   */
  async updatePromotion(id, data) {
    await this.getPromotionById(id);

    const updates = [];
    const values = [];
    const allowedFields = [
      'name',
      'description',
      'discount_type',
      'discount_value',
      'start_date',
      'end_date',
      'is_active'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(id);

    await pool.query(
      `UPDATE promotions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Update products if provided
    if (data.product_ids) {
      await pool.query('DELETE FROM product_promotions WHERE promotion_id = ?', [id]);
      
      if (data.product_ids.length > 0) {
        for (const productId of data.product_ids) {
          await pool.query(
            'INSERT INTO product_promotions (product_id, promotion_id) VALUES (?, ?)',
            [productId, id]
          );
        }
      }
    }

    return await this.getPromotionById(id);
  }

  /**
   * Delete promotion
   */
  async deletePromotion(id) {
    await this.getPromotionById(id);

    await pool.query('DELETE FROM product_promotions WHERE promotion_id = ?', [id]);
    await pool.query('DELETE FROM promotions WHERE id = ?', [id]);

    return { message: 'Promotion deleted successfully' };
  }

  /**
   * Get active promotions for a product
   */
  async getProductPromotions(productId) {
    const [promotions] = await pool.query(
      `SELECT 
        pr.*
       FROM product_promotions pp
       JOIN promotions pr ON pp.promotion_id = pr.id
       WHERE pp.product_id = ?
       AND pr.is_active = TRUE
       AND pr.start_date <= NOW()
       AND pr.end_date >= NOW()`,
      [productId]
    );

    return promotions;
  }
}

module.exports = new PromotionService();
