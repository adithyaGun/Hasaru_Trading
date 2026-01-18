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
