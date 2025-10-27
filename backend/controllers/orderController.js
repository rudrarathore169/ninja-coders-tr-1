import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateOrderTotal, generateOrderNumber } from '../utils/helperUtils.js';
import { isValidOrderStatus } from '../utils/validationUtils.js';

/**
 * Create a new order (guest or authenticated)
 * POST /api/orders
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { tableId, items = [], meta = {} } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
  }

  // Optionally validate menu item ids and prices (basic sanity check)
  // We'll accept the items as provided but ensure required fields exist
  const normalizedItems = items.map((it) => ({
    menuItemId: it.menuItemId,
    name: (it.name || '').toString().trim(),
    price: parseFloat(it.price),
    qty: parseInt(it.qty, 10) || 1,
    note: it.note || ''
  }));

  // Validate item fields strictly and provide clear error messages
  for (let i = 0; i < normalizedItems.length; i++) {
    const it = normalizedItems[i];
    if (!it.name) {
      return res.status(400).json({ success: false, message: `Item at index ${i} is missing a name` });
    }
    if (Number.isNaN(it.price) || it.price <= 0) {
      return res.status(400).json({ success: false, message: `Item '${it.name}' at index ${i} has an invalid price` });
    }
    if (Number.isNaN(it.qty) || it.qty < 1) {
      return res.status(400).json({ success: false, message: `Item '${it.name}' at index ${i} has an invalid quantity` });
    }
  }

  // Calculate totals
  const totals = calculateOrderTotal(normalizedItems);

  // Normalize tableId if provided
  const normalizedTableId = typeof tableId === 'string' ? tableId.trim() : tableId || null;

  const customerId = req.user ? req.user._id : null;

  const order = new Order({
    tableId: normalizedTableId,
    customerId,
    orderNumber: generateOrderNumber(),
    items: normalizedItems,
    totals,
    status: 'placed',
    meta: meta || {}
  });

  try {
    await order.save();
  } catch (err) {
    console.error('Error saving order:', err);
    return res.status(500).json({ success: false, message: 'Failed to place order' });
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totals: order.totals,
      createdAt: order.createdAt
    }
  });
});

/**
 * List orders
 * GET /api/orders
 * - staff/admin: all orders
 * - customer: their orders
 */
export const listOrders = asyncHandler(async (req, res) => {
  const user = req.user;

  const query = {};
  if (user) {
    if (['staff', 'admin'].includes(user.role)) {
      // allow filters via query: tableId, status
      if (req.query.tableId) query.tableId = req.query.tableId;
      if (req.query.status) {
        if (!isValidOrderStatus(req.query.status)) return res.status(400).json({ success: false, message: 'Invalid status filter' });
        query.status = req.query.status;
      }
    } else {
      // customer: only their orders
      query.customerId = user._id;
    }
  } else {
    // unauthenticated: not allowed to list; require at least session info
    return res.status(401).json({ success: false, message: 'Authentication required to list orders' });
  }

  let orders;
  try {
    orders = await Order.find(query)
      .populate({
        path: 'items.menuItemId',
        select: 'name description price categoryId availability tags popularity imageUrl'
      })
      .populate('tableId', 'tableNumber qrSlug')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
  }

  res.status(200).json({ success: true, message: 'Orders retrieved', data: orders });
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id)
    .populate({
      path: 'items.menuItemId',
      select: 'name description price categoryId availability tags popularity imageUrl'
    })
    .populate('tableId', 'tableNumber qrSlug')
    .populate('customerId', 'name email');
    
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Authorization: staff/admin or owner
  if (req.user) {
    if (!(['staff', 'admin'].includes(req.user.role) || (order.customerId && order.customerId.toString() === req.user._id.toString()))) {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }
  } else {
    // Allow unauthenticated access for guest orders (orders without a customerId or with tableToken in meta).
    // This enables guests who placed an order to view its status without signing in.
    // NOTE: In production you may want a stronger mechanism (signed token or tableToken) to prevent arbitrary access.
    if (order.customerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
  }

  res.status(200).json({ success: true, data: order });
});

/**
 * Update order status (staff/admin)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidOrderStatus(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = status;
  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated', data: { id: order._id, status: order.status } });
});

/**
 * Update order payment status (staff/admin)
 * PATCH /api/orders/:id/payment
 */
export const updateOrderPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
  if (!validPaymentStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status' });
  }

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Initialize payment object if it doesn't exist
  if (!order.payment) {
    order.payment = {};
  }

  order.payment.status = status;
  await order.save();

  res.status(200).json({ success: true, message: 'Order payment status updated', data: { id: order._id, payment: order.payment } });
});

/**
 * Cancel order (owner or staff)
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // owner or staff/admin can cancel
  if (req.user) {
    if (!(['staff', 'admin'].includes(req.user.role) || (order.customerId && order.customerId.toString() === req.user._id.toString()))) {
      return res.status(403).json({ success: false, message: 'Access denied to cancel this order' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  order.status = 'canceled';
  await order.save();

  res.status(200).json({ success: true, message: 'Order canceled', data: { id: order._id } });
});

export default {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};