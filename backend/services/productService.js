const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams } = require('../utils/helpers');
const { deleteImage } = require('../middleware/upload');

class ProductService {
  /**
   * Get all products with pagination and filters
   */
  async getAllProducts(filters = {}, page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);
    
    let query = `
      SELECT 
        p.*,
        CASE 
          WHEN p.stock_quantity <= p.minimum_stock_level THEN 'critical'
          WHEN p.stock_quantity <= p.reorder_level THEN 'low'
          ELSE 'normal'
        END as stock_status
      FROM products p
      WHERE p.is_active = TRUE
    `;
    
    const params = [];

    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }

    if (filters.brand) {
      query += ' AND p.brand = ?';
      params.push(filters.brand);
    }

    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.stock_status) {
      if (filters.stock_status === 'low') {
        query += ' AND p.stock_quantity <= p.reorder_level';
      } else if (filters.stock_status === 'critical') {
        query += ' AND p.stock_quantity <= p.minimum_stock_level';
      }
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY p.name ASC LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const [products] = await pool.query(query, params);

    // Get active promotions for products
    const productIds = products.map(p => p.id);
    if (productIds.length > 0) {
      const [promotions] = await pool.query(
        `SELECT 
          pp.product_id,
          pr.id as promotion_id,
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

      // Attach promotions to products
      products.forEach(product => {
        product.promotions = promotions.filter(p => p.product_id === product.id);
      });
    }

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const [products] = await pool.query(
      `SELECT 
        p.*,
        CASE 
          WHEN p.stock_quantity <= p.minimum_stock_level THEN 'critical'
          WHEN p.stock_quantity <= p.reorder_level THEN 'low'
          ELSE 'normal'
        END as stock_status
       FROM products p
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      throw new AppError('Product not found', 404);
    }

    const product = products[0];

    // Get active promotions
    const [promotions] = await pool.query(
      `SELECT 
        pr.id,
        pr.name,
        pr.discount_type,
        pr.discount_value,
        pr.start_date,
        pr.end_date
       FROM product_promotions pp
       JOIN promotions pr ON pp.promotion_id = pr.id
       WHERE pp.product_id = ?
       AND pr.is_active = TRUE
       AND pr.start_date <= NOW()
       AND pr.end_date >= NOW()`,
      [id]
    );

    product.promotions = promotions;

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    const {
      name, description, image_url, sku, barcode, category, brand, unit,
      purchase_price, selling_price, stock_quantity,
      reorder_level, minimum_stock_level
    } = productData;

    const [result] = await pool.query(
      `INSERT INTO products 
       (name, description, image_url, sku, barcode, category, brand, unit, purchase_price, 
        selling_price, stock_quantity, reorder_level, minimum_stock_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, image_url || null, sku, barcode, category, brand, unit || 'piece',
       purchase_price || 0, selling_price, stock_quantity || 0,
       reorder_level || 10, minimum_stock_level || 5]
    );

    return await this.getProductById(result.insertId);
  }

  /**
   * Update product
   */
  async updateProduct(id, productData) {
    // Check if product exists and get old image
    const oldProduct = await this.getProductById(id);

    const updates = [];
    const values = [];

    const allowedFields = [
      'name', 'description', 'image_url', 'sku', 'barcode', 'category', 'brand', 'unit',
      'purchase_price', 'selling_price', 'reorder_level', 'minimum_stock_level'
    ];

    allowedFields.forEach(field => {
      if (productData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(productData[field]);
      }
    });

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(id);

    await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Delete old image if new image was uploaded
    if (productData.image_url && oldProduct.image_url) {
      deleteImage(oldProduct.image_url);
    }

    return await this.getProductById(id);
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id) {
    // Check if product exists and get image URL
    const product = await this.getProductById(id);

    await pool.query(
      'UPDATE products SET is_active = FALSE WHERE id = ?',
      [id]
    );

    // Delete product image if exists
    if (product.image_url) {
      deleteImage(product.image_url);
    }

    return { message: 'Product deleted successfully' };
  }

  /**
   * Get product by SKU or barcode
   */
  async getProductByCode(code) {
    const [products] = await pool.query(
      `SELECT 
        p.*,
        CASE 
          WHEN p.stock_quantity <= p.minimum_stock_level THEN 'critical'
          WHEN p.stock_quantity <= p.reorder_level THEN 'low'
          ELSE 'normal'
        END as stock_status
       FROM products p
       WHERE (p.sku = ? OR p.barcode = ?) AND p.is_active = TRUE`,
      [code, code]
    );

    if (products.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return products[0];
  }

  /**
   * Get all categories
   */
  async getCategories() {
    const [categories] = await pool.query(
      `SELECT DISTINCT category 
       FROM products 
       WHERE is_active = TRUE AND category IS NOT NULL
       ORDER BY category`
    );

    return categories.map(c => c.category);
  }

  /**
   * Get all brands
   */
  async getBrands() {
    const [brands] = await pool.query(
      `SELECT DISTINCT brand 
       FROM products 
       WHERE is_active = TRUE AND brand IS NOT NULL
       ORDER BY brand`
    );

    return brands.map(b => b.brand);
  }
}

module.exports = new ProductService();
