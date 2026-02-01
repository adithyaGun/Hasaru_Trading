const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    const { name, email, password, role = 'customer', phone, address } = userData;

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, phone, address]
    );

    // Get created user (without password)
    const [users] = await pool.query(
      `SELECT id, name, email, role, phone, address, created_at 
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    return users[0];
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user by email
    const [users] = await pool.query(
      `SELECT id, name, email, password, role, is_active 
       FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated. Please contact administrator.', 403);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user data (without password) and token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const [users] = await pool.query(
      `SELECT id, name, email, role, phone, address, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    return users[0];
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const { name, phone, address } = updateData;
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address) {
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getProfile(userId);
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    // Get current password
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, users[0].password);

    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    return { message: 'Password changed successfully' };
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(filters = {}) {
    const { role, is_active, search, page = 1, limit = 10 } = filters;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    let query = `
      SELECT id, name, email, role, phone, address, is_active, created_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT id, name, email, role, phone, address, is_active, created_at',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [users] = await pool.query(query, params);

    return {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(userId) {
    const [users] = await pool.query(
      `SELECT id, name, email, role, phone, address, is_active, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    return users[0];
  }

  /**
   * Create user (Admin only)
   */
  async createUser(userData) {
    const { name, email, password, role, phone, address } = userData;

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Validate role
    const validRoles = ['admin', 'sales_staff', 'customer'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, address, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, email, hashedPassword, role, phone, address]
    );

    // Get created user
    return await this.getUserById(result.insertId);
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(userId, updateData) {
    const { name, email, role, phone, address, is_active } = updateData;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      // Check if email is already taken by another user
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existing.length > 0) {
        throw new AppError('Email already in use', 409);
      }
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      const validRoles = ['admin', 'sales_staff', 'customer'];
      if (!validRoles.includes(role)) {
        throw new AppError('Invalid role specified', 400);
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getUserById(userId);
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId) {
    // Check if user exists
    const user = await this.getUserById(userId);

    // Prevent deleting admin users (safety check)
    if (user.role === 'admin') {
      throw new AppError('Cannot delete admin users', 403);
    }

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    return { message: 'User deleted successfully' };
  }

  /**
   * Toggle user active status (Admin only)
   */
  async toggleUserStatus(userId) {
    const user = await this.getUserById(userId);

    const newStatus = !user.is_active;
    
    await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [newStatus ? 1 : 0, userId]
    );

    return {
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    };
  }
}

module.exports = new AuthService();
