const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { auth } = require('../middleware/auth');
const { adminOnly, staffOnly } = require('../middleware/roleCheck');
const { idValidation, paginationValidation } = require('../middleware/validator');

// Staff can view alerts
router.get('/', auth, staffOnly, paginationValidation, alertController.getLowStockAlerts);
router.get('/statistics', auth, staffOnly, alertController.getAlertStatistics);
router.get('/dashboard', auth, staffOnly, alertController.getDashboardNotifications);

// Admin only - Acknowledge alerts
router.put('/:id/acknowledge', auth, adminOnly, idValidation, alertController.acknowledgeAlert);

module.exports = router;
