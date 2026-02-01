const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  
  // Send welcome email (don't wait for it)
  emailService.sendWelcomeEmail(user);
  
  res.status(201).json(successResponse(user, 'User registered successfully'));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  res.json(successResponse(result, 'Login successful'));
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json(successResponse(user, 'Profile fetched successfully'));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json(successResponse(user, 'Profile updated successfully'));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  res.json(successResponse(result, 'Password changed successfully'));
});

// Admin-only user management endpoints
exports.getAllUsers = asyncHandler(async (req, res) => {
  const filters = {
    role: req.query.role,
    is_active: req.query.is_active,
    search: req.query.search,
    page: req.query.page || 1,
    limit: req.query.limit || 10
  };
  const result = await authService.getAllUsers(filters);
  res.json(successResponse(result, 'Users retrieved successfully'));
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.params.id);
  res.json(successResponse(user, 'User retrieved successfully'));
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await authService.createUser(req.body);
  
  // Send welcome email (don't wait for it)
  emailService.sendWelcomeEmail(user);
  
  res.status(201).json(successResponse(user, 'User created successfully'));
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await authService.updateUser(req.params.id, req.body);
  res.json(successResponse(user, 'User updated successfully'));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const result = await authService.deleteUser(req.params.id);
  res.json(successResponse(result, 'User deleted successfully'));
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const result = await authService.toggleUserStatus(req.params.id);
  res.json(successResponse(result, result.message));
});
