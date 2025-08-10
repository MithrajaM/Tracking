const express = require('express');
const { query } = require('express-validator');
const {
  getSystemStats,
  getDeliveryAnalytics,
  getBoxAnalytics,
  getActivityAnalytics
} = require('../controllers/statsController');
const { authMiddleware, adminOrManufacturer } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const analyticsValidation = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
  query('groupBy')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('Group by must be hour, day, week, or month')
];

// All stats routes require admin or manufacturer access
router.use(authMiddleware, adminOrManufacturer);

// Routes
router.get('/', getSystemStats);
router.get('/deliveries', analyticsValidation, getDeliveryAnalytics);
router.get('/boxes', getBoxAnalytics);
router.get('/activity', analyticsValidation, getActivityAnalytics);

module.exports = router;
