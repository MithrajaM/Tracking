const express = require('express');
const { body, query } = require('express-validator');
const {
  createBox,
  getBox,
  getBoxes,
  updateBoxStatus,
  updateBox,
  deleteBox
} = require('../controllers/boxController');
const { authMiddleware, adminOrManufacturer, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createBoxValidation = [
  body('boxId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Box ID must be 3-20 alphanumeric characters (uppercase)'),
  body('manufacturer')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Manufacturer is required and must be max 100 characters'),
  body('maxUsage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max usage must be a positive integer'),
  body('currentLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Material cannot exceed 50 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  body('weight.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number')
];

const updateBoxStatusValidation = [
  body('status')
    .optional()
    .isIn(['new', 'in-use', 'damaged', 'retired'])
    .withMessage('Status must be new, in-use, damaged, or retired'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters'),
  body('incrementUsage')
    .optional()
    .isBoolean()
    .withMessage('Increment usage must be a boolean')
];

const updateBoxValidation = [
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Manufacturer must be 1-100 characters'),
  body('maxUsage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max usage must be a positive integer'),
  body('currentLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Material cannot exceed 50 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const getBoxesValidation = [
  query('status')
    .optional()
    .isIn(['new', 'in-use', 'damaged', 'retired'])
    .withMessage('Status must be new, in-use, damaged, or retired'),
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
    .isIn(['createdAt', 'updatedAt', 'boxId', 'manufacturer', 'usageCount'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes
router.post('/', authMiddleware, adminOrManufacturer, createBoxValidation, createBox);
router.get('/', authMiddleware, getBoxesValidation, getBoxes);
router.get('/:id', authMiddleware, getBox);
router.patch('/:id/status', authMiddleware, adminOrManufacturer, updateBoxStatusValidation, updateBoxStatus);
router.put('/:id', authMiddleware, adminOrManufacturer, updateBoxValidation, updateBox);
router.delete('/:id', authMiddleware, adminOnly, deleteBox);

module.exports = router;
