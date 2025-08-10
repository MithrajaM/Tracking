const express = require('express');
const { body, query } = require('express-validator');
const {
  createDelivery,
  getDeliveries,
  getDelivery,
  getBoxDeliveryHistory,
  updateDelivery
} = require('../controllers/deliveryController');
const { authMiddleware, adminOrManufacturer } = require('../middleware/auth');
const { uploadDeliveryPhoto, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createDeliveryValidation = [
  body('boxId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Box ID is required and must be 3-20 characters'),
  body('deliveryLocation.address')
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Delivery address is required and must be 5-300 characters'),
  body('deliveryLocation.coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('deliveryLocation.coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('deliveryLocation.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('deliveryLocation.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('deliveryLocation.zipCode')
    .optional()
    .trim()
    .matches(/^[0-9]{5}(-[0-9]{4})?$/)
    .withMessage('Invalid ZIP code format'),
  body('recipient.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Recipient name is required and must be 2-100 characters'),
  body('recipient.phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('recipient.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('deliveryStatus')
    .optional()
    .isIn(['delivered', 'attempted', 'failed', 'returned'])
    .withMessage('Invalid delivery status'),
  body('packageCondition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'damaged'])
    .withMessage('Invalid package condition'),
  body('deliveryInstructions')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Delivery instructions cannot exceed 300 characters'),
  body('weatherConditions')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Weather conditions cannot exceed 100 characters')
];

const getDeliveriesValidation = [
  query('status')
    .optional()
    .isIn(['delivered', 'attempted', 'failed', 'returned'])
    .withMessage('Invalid delivery status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['deliveryDate', 'createdAt', 'deliveryStatus'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const updateDeliveryValidation = [
  body('deliveryStatus')
    .optional()
    .isIn(['delivered', 'attempted', 'failed', 'returned'])
    .withMessage('Invalid delivery status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Routes
router.post('/', 
  authMiddleware, 
  uploadDeliveryPhoto, 
  handleUploadError, 
  createDeliveryValidation, 
  createDelivery
);

router.get('/', 
  authMiddleware, 
  getDeliveriesValidation, 
  getDeliveries
);

router.get('/box/:boxId', 
  authMiddleware, 
  getBoxDeliveryHistory
);

router.get('/:id', 
  authMiddleware, 
  getDelivery
);

router.patch('/:id', 
  authMiddleware, 
  adminOrManufacturer, 
  updateDeliveryValidation, 
  updateDelivery
);

module.exports = router;
