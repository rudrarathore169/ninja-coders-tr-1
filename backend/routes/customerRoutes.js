import express from 'express';
import {
  createCustomerSession,
  getCustomerProfile,
  updateCustomerProfile,
  endCustomerSession,
  authenticateCustomer
} from '../controllers/customerController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validationUtils.js';

const router = express.Router();

/**
 * Customer authentication routes
 * Base: /api/customers
 */

// Create customer session (when scanning QR code)
router.post('/session/:qrSlug',
  [
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  handleValidationErrors,
  createCustomerSession
);

// Get customer profile (protected)
router.get('/profile',
  authenticateCustomer,
  getCustomerProfile
);

// Update customer profile (protected)
router.put('/profile',
  authenticateCustomer,
  [
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  handleValidationErrors,
  updateCustomerProfile
);

// End customer session (logout) (protected)
router.post('/logout',
  authenticateCustomer,
  endCustomerSession
);

export default router;
