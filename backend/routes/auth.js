const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { registerValidation, loginValidation } = require('../middleware/validator');

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

// Admin-only user management routes
router.get('/users', auth, adminOnly, authController.getAllUsers);
router.get('/users/:id', auth, adminOnly, authController.getUserById);
router.post('/users', auth, adminOnly, authController.createUser);
router.put('/users/:id', auth, adminOnly, authController.updateUser);
router.delete('/users/:id', auth, adminOnly, authController.deleteUser);
router.put('/users/:id/toggle-status', auth, adminOnly, authController.toggleUserStatus);

module.exports = router;
