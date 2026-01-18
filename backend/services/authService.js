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
}

module.exports = new AuthService();
