import express from 'express';
import {
  createTable,
  getTableById,
  getTableByQrSlug,
  updateTable,
  updateOccupancy,
  deleteTable,
  listTables
} from '../controllers/tableController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin, requireTableAccess, requireStaff } from '../middleware/roleMiddleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../utils/validationUtils.js';

const router = express.Router();

/**
 * Table management routes
 * Base: /api/tables
 */

// Create table (Admin)
router.post('/',
  authenticate,
  requireAdmin,
  [
    body('number').isInt({ min: 1 }).withMessage('Table number must be a positive integer')
  ],
  handleValidationErrors,
  createTable
);

// List tables (Admin)
router.get('/',
  authenticate,
  requireAdmin,
  listTables
);

// Get table by ID (Admin)
router.get('/:id',
  authenticate,
  requireAdmin,
  [param('id').isMongoId().withMessage('Invalid table ID')],
  handleValidationErrors,
  getTableById
);

// Public: Get table by QR slug (used when scanning QR)
router.get('/by-slug/:qrSlug',  // ← CHANGE THIS LINE ONLY
  [param('qrSlug').notEmpty().withMessage('qrSlug is required')],
  handleValidationErrors,
  getTableByQrSlug
);

// Update table (Admin)
router.put('/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid table ID'),
    body('number').optional().isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
    body('active').optional().isBoolean().withMessage('Active must be boolean')
  ],
  handleValidationErrors,
  updateTable
);

// Update occupancy (Staff/Admin)
router.patch('/:id/occupancy',
  authenticate,
  requireStaff,
  [
    param('id').isMongoId().withMessage('Invalid table ID'),
    body('occupied').isBoolean().withMessage('occupied must be boolean')
  ],
  handleValidationErrors,
  updateOccupancy
);

// Delete table (Admin)
router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isMongoId().withMessage('Invalid table ID')],
  handleValidationErrors,
  deleteTable
);

export default router;