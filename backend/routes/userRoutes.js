import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  deactivateUser,
  getUserStats,
  searchUsers
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  requireAdmin, 
  requireOwnershipOrAdmin,
  requireAuth 
} from '../middleware/roleMiddleware.js';
import { body, query, param } from 'express-validator';
import { handleValidationErrors } from '../utils/validationUtils.js';

const router = express.Router();

/**
 * User Management Routes
 * Base path: /api/users
 */

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', 
  authenticate, 
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['customer', 'staff', 'admin']).withMessage('Invalid role'),
    query('search').optional().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
  ],
  handleValidationErrors,
  getAllUsers
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats', 
  authenticate, 
  requireAdmin,
  getUserStats
);

/**
 * @route   GET /api/users/search
 * @desc    Search users (Admin only)
 * @access  Private (Admin)
 */
router.get('/search',
  authenticate,
  requireAdmin,
  [
    query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
    query('role').optional().isIn(['customer', 'staff', 'admin']).withMessage('Invalid role'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  searchUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private (Admin)
 */
router.get('/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  getUserById
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticate,
  requireAuth,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s\-']+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],
  handleValidationErrors,
  updateProfile
);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id/role',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role')
      .isIn(['customer', 'staff', 'admin'])
      .withMessage('Role must be customer, staff, or admin')
  ],
  handleValidationErrors,
  updateUserRole
);

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate user account (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id/deactivate',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  deactivateUser
);
export default router;
