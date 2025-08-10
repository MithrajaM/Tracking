const express = require('express');
const { body, query } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} = require('../controllers/userController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['admin', 'manufacturer', 'end-user'])
    .withMessage('Role must be admin, manufacturer, or end-user')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'manufacturer', 'end-user'])
    .withMessage('Role must be admin, manufacturer, or end-user'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const resetPasswordValidation = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const getUsersValidation = [
  query('role')
    .optional()
    .isIn(['admin', 'manufacturer', 'end-user'])
    .withMessage('Role must be admin, manufacturer, or end-user'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
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
    .isIn(['createdAt', 'updatedAt', 'name', 'email', 'role', 'lastLogin'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// All user management routes require admin access
router.use(authMiddleware, adminOnly);

// Routes
router.get('/stats', getUserStats);
router.get('/', getUsersValidation, getUsers);
router.get('/:id', getUser);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUserValidation, updateUser);
router.patch('/:id/password', resetPasswordValidation, resetUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;
