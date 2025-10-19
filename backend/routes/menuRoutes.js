import express from 'express';
import {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Menu Items
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemAvailability,
  updateMenuItemPopularity,
  getMenuStats,
  
  // Image Upload
  uploadMenuItemImage,
  deleteMenuItemImage,
  uploadCategoryImage,
  deleteCategoryImage
} from '../controllers/menuController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin, requireMenuAccess, requireCategoryAccess } from '../middleware/roleMiddleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../utils/validationUtils.js';
import { uploadMenuItemImage as uploadMenuItemImageMiddleware, uploadCategoryImage as uploadCategoryImageMiddleware, handleUploadError } from '../config/upload.js';

const router = express.Router();

/**
 * Menu Management Routes
 * Base path: /api/menu
 */

// ==================== MENU STATISTICS ====================

/**
 * @route   GET /api/menu/stats
 * @desc    Get menu statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats',
  authenticate,
  requireAdmin,
  getMenuStats
);

// ==================== CATEGORY ROUTES ====================

/**
 * @route   GET /api/menu/categories
 * @desc    Get all menu categories
 * @access  Public
 */
router.get('/categories',
  [
    query('active').optional().isBoolean().withMessage('Active must be a boolean'),
    query('sortBy').optional().isIn(['name', 'displayOrder', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  getCategories
);

/**
 * @route   GET /api/menu/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/categories/:id',
  [
    param('id').isMongoId().withMessage('Invalid category ID')
  ],
  handleValidationErrors,
  getCategoryById
);

/**
 * @route   POST /api/menu/categories
 * @desc    Create new category (Admin only)
 * @access  Private (Admin)
 */
router.post('/categories',
  authenticate,
  requireAdmin,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s\-&']+$/)
      .withMessage('Category name can only contain letters, spaces, hyphens, ampersands, and apostrophes'),
    
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],
  handleValidationErrors,
  createCategory
);

/**
 * @route   PUT /api/menu/categories/:id
 * @desc    Update category (Admin only)
 * @access  Private (Admin)
 */
router.put('/categories/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid category ID'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s\-&']+$/)
      .withMessage('Category name can only contain letters, spaces, hyphens, ampersands, and apostrophes'),
    
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer'),
    
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean')
  ],
  handleValidationErrors,
  updateCategory
);

/**
 * @route   DELETE /api/menu/categories/:id
 * @desc    Delete category (Admin only)
 * @access  Private (Admin)
 */
router.delete('/categories/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid category ID')
  ],
  handleValidationErrors,
  deleteCategory
);

// ==================== MENU ITEM ROUTES ====================

/**
 * @route   GET /api/menu/items
 * @desc    Get all menu items
 * @access  Public
 */
router.get('/items',
  [
    query('categoryId').optional().isMongoId().withMessage('Invalid category ID'),
    query('available').optional().isBoolean().withMessage('Available must be a boolean'),
    query('search').optional().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
    query('tags').optional().isString().withMessage('Tags must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['name', 'price', 'popularity', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a non-negative number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a non-negative number')
  ],
  handleValidationErrors,
  getMenuItems
);

/**
 * @route   GET /api/menu/items/:id
 * @desc    Get menu item by ID
 * @access  Public
 */
router.get('/items/:id',
  [
    param('id').isMongoId().withMessage('Invalid menu item ID')
  ],
  handleValidationErrors,
  getMenuItemById
);

/**
 * @route   POST /api/menu/items
 * @desc    Create new menu item (Admin only)
 * @access  Private (Admin)
 */
router.post('/items',
  authenticate,
  requireAdmin,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    
    body('price')
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Price must be a positive number with up to 2 decimal places'),
    
    body('categoryId')
      .isMongoId()
      .withMessage('Category ID must be a valid MongoDB ObjectId'),
    
    body('availability')
      .optional()
      .isBoolean()
      .withMessage('Availability must be a boolean'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags && tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        if (tags) {
          tags.forEach(tag => {
            if (typeof tag !== 'string' || tag.trim().length < 2 || tag.trim().length > 20) {
              throw new Error('Each tag must be a string between 2 and 20 characters');
            }
          });
        }
        return true;
      })
  ],
  handleValidationErrors,
  createMenuItem
);

/**
 * @route   PUT /api/menu/items/:id
 * @desc    Update menu item (Admin only)
 * @access  Private (Admin)
 */
router.put('/items/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid menu item ID'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    
    body('price')
      .optional()
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Price must be a positive number with up to 2 decimal places'),
    
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Category ID must be a valid MongoDB ObjectId'),
    
    body('availability')
      .optional()
      .isBoolean()
      .withMessage('Availability must be a boolean'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags && tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        if (tags) {
          tags.forEach(tag => {
            if (typeof tag !== 'string' || tag.trim().length < 2 || tag.trim().length > 20) {
              throw new Error('Each tag must be a string between 2 and 20 characters');
            }
          });
        }
        return true;
      })
  ],
  handleValidationErrors,
  updateMenuItem
);

/**
 * @route   DELETE /api/menu/items/:id
 * @desc    Delete menu item (Admin only)
 * @access  Private (Admin)
 */
router.delete('/items/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid menu item ID')
  ],
  handleValidationErrors,
  deleteMenuItem
);

/**
 * @route   PATCH /api/menu/items/:id/availability
 * @desc    Update menu item availability (Admin only)
 * @access  Private (Admin)
 */
router.patch('/items/:id/availability',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid menu item ID'),
    body('availability').isBoolean().withMessage('Availability must be a boolean')
  ],
  handleValidationErrors,
  updateMenuItemAvailability
);

/**
 * @route   PATCH /api/menu/items/:id/popularity
 * @desc    Update menu item popularity (Admin only)
 * @access  Private (Admin)
 */
router.patch('/items/:id/popularity',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid menu item ID'),
    body('popularity').isInt({ min: 0 }).withMessage('Popularity must be a non-negative integer')
  ],
  handleValidationErrors,
  updateMenuItemPopularity
);

// ==================== IMAGE UPLOAD ROUTES ====================

/**
 * @route   POST /api/menu/items/:id/image
 * @desc    Upload menu item image (Admin only)
 * @access  Private (Admin)
 */
router.post('/items/:id/image',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid menu item ID')
  ],
  handleValidationErrors,
  uploadMenuItemImageMiddleware.single('image'),
  handleUploadError,
  uploadMenuItemImage
);

/**
 * @route   DELETE /api/menu/items/:id/image
 * @desc    Delete menu item image (Admin only)
 * @access  Private (Admin)
 */
router.delete('/items/:id/image',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid menu item ID')
  ],
  handleValidationErrors,
  deleteMenuItemImage
);

/**
 * @route   POST /api/menu/categories/:id/image
 * @desc    Upload category image (Admin only)
 * @access  Private (Admin)
 */
router.post('/categories/:id/image',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid category ID')
  ],
  handleValidationErrors,
  uploadCategoryImageMiddleware.single('image'),
  handleUploadError,
  uploadCategoryImage
);

/**
 * @route   DELETE /api/menu/categories/:id/image
 * @desc    Delete category image (Admin only)
 * @access  Private (Admin)
 */
router.delete('/categories/:id/image',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid category ID')
  ],
  handleValidationErrors,
  deleteCategoryImage
);

export default router;
