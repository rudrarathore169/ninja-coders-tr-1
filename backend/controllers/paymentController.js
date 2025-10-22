import config from '../config/config.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';

const stripe = config.STRIPE.SECRET_KEY ? new Stripe(config.STRIPE.SECRET_KEY, { apiVersion: '2022-11-15' }) : null;

/**
 * Create a Stripe PaymentIntent for an order
 * POST /api/payments/create-intent
 * Body: { orderId, currency }
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, currency = 'usd' } = req.body;

  if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Authorization: owner or staff/admin
  if (req.user) {
    if (!(['staff', 'admin'].includes(req.user.role) || (order.customerId && order.customerId.toString() === req.user._id.toString()))) {
      return res.status(403).json({ success: false, message: 'Access denied to create payment for this order' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const amount = Math.round((order.totals || 0) * 100); // amount in cents

  if (!stripe) {
    // Fallback for demo when stripe key not configured
    const clientSecret = `demo_client_secret_${Date.now()}`;
    order.payment = order.payment || {};
    order.payment.provider = 'stripe-demo';
    order.payment.providerData = { paymentIntentId: `pi_demo_${Date.now()}` };
    order.payment.status = 'pending';
    await order.save();

    return res.status(200).json({ success: true, data: { clientSecret, amount, currency } });
  }

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { orderId: order._id.toString() },
    description: `Order ${order._id}`
  });

  // Save provider info on order
  order.payment = order.payment || {};
  order.payment.provider = 'stripe';
  order.payment.providerData = order.payment.providerData || {};
  order.payment.providerData.paymentIntentId = paymentIntent.id;
  order.payment.providerData.clientSecret = paymentIntent.client_secret;
  order.payment.status = 'pending';
  await order.save();

  res.status(200).json({ success: true, data: { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, amount, currency } });
});

/**
 * Stripe webhook handler
 * POST /api/payments/webhook
 * Requires raw body for signature verification
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.STRIPE.WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    // If no stripe configured, just ack
    return res.status(200).json({ success: true, message: 'Webhook received (no stripe configured)' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types we care about
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const paymentIntentId = pi.id;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.payment = order.payment || {};
          order.payment.provider = 'stripe';
          order.payment.providerData = { paymentIntentId };
          order.payment.status = 'paid';
          await order.save();
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const paymentIntentId = pi.id;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.payment = order.payment || {};
          order.payment.provider = 'stripe';
          order.payment.providerData = { paymentIntentId };
          order.payment.status = 'failed';
          await order.save();
        }
      }
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;
      // Find order by paymentIntentId
      const order = await Order.findOne({ 'payment.providerData.paymentIntentId': paymentIntentId });
      if (order) {
        order.payment.status = 'refunded';
        await order.save();
      }
      break;
    }
    default:
      // Unexpected event type
      console.log(`Unhandled stripe event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export default { createPaymentIntent, handleWebhook };