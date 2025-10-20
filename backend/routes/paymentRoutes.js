import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payment intent (authenticated)
router.post('/create-intent', authenticate, createPaymentIntent);

// NOTE: The webhook route is mounted directly in index.js before the JSON body parser
// to ensure Stripe signature verification receives the raw request body.

export default router;