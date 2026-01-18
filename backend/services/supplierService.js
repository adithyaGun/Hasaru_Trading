const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams } = require('../utils/helpers');

class SupplierService {
  async getAllSuppliers(page = 1, limit = 20) {
    const { offset, limit: parsedLimit } = getPaginationParams(page, limit);

    const [total] = await pool.query(
      'SELECT COUNT(*) as total FROM suppliers WHERE is_active = TRUE'
    );

    const [suppliers] = await pool.query(
      `SELECT * FROM suppliers 
       WHERE is_active = TRUE 
       ORDER BY name ASC 
       LIMIT ? OFFSET ?`,
      [parsedLimit, offset]
    );

    return {
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total: total[0].total,
        totalPages: Math.ceil(total[0].total / parsedLimit)
      }
    };
  }

  async getSupplierById(id) {
    const [suppliers] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (suppliers.length === 0) {
      throw new AppError('Supplier not found', 404);
    }

    return suppliers[0];
  }

  async createSupplier(data) {
    const { name, email, phone, address, contact_person } = data;

    const [result] = await pool.query(
      `INSERT INTO suppliers (name, email, phone, address, contact_person)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, address, contact_person]
    );

    return await this.getSupplierById(result.insertId);
  }

  async updateSupplier(id, data) {
    await this.getSupplierById(id);

    const updates = [];
    const values = [];
    const allowedFields = ['name', 'email', 'phone', 'address', 'contact_person'];

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
      `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getSupplierById(id);
  }

  async deleteSupplier(id) {
    await this.getSupplierById(id);
    await pool.query('UPDATE suppliers SET is_active = FALSE WHERE id = ?', [id]);
    return { message: 'Supplier deleted successfully' };
  }
}

module.exports = new SupplierService();
