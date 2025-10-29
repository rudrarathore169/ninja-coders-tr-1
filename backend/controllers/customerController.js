import Customer from '../models/Customer.js';
import Table from '../models/Table.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Generate JWT token for customer
 */
const generateCustomerToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      name: customer.name,
      table: customer.table,
      type: 'customer'
    },
    config.JWT_SECRET,
    { expiresIn: '24h' } // Customer sessions last 24 hours
  );
};

/**
 * Create or get existing customer session for a table
 */
export const createCustomerSession = async (req, res) => {
  try {
    const { qrSlug } = req.params;
    const { name, email, phone } = req.body;

    // Find table by QR slug
    const table = await Table.findOne({ qrSlug });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Check if table is active (has a session)
    if (!table.activeSessionId) {
      return res.status(400).json({
        success: false,
        message: 'Table is not activated. Please scan the QR code again.'
      });
    }

    // Check if customer already exists for this table
    let customer = await Customer.findOne({
      table: table._id,
      isActive: true
    });

    if (customer) {
      // Update existing customer info if provided
      if (name) customer.name = name;
      if (email) customer.email = email;
      if (phone) customer.phone = phone;
      customer.lastActivity = new Date();
      await customer.save();
    } else {
      // Create new customer
      customer = new Customer({
        name: name || 'Guest',
        email,
        phone,
        table: table._id,
        sessionToken: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        lastActivity: new Date()
      });
      await customer.save();
    }

    // Generate JWT token
    const token = generateCustomerToken(customer);

    res.status(201).json({
      success: true,
      message: 'Customer session created successfully',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          table: {
            id: table._id,
            number: table.number
          }
        },
        token
      }
    });
  } catch (error) {
    console.error('Error creating customer session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer session'
    });
  }
};

/**
 * Get customer profile
 */
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id)
      .populate('table', 'number qrSlug')
      .select('-sessionToken');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error getting customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer profile'
    });
  }
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const customer = await Customer.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    customer.lastActivity = new Date();

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * End customer session (logout)
 */
export const endCustomerSession = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.isActive = false;
    await customer.save();

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending customer session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
};

/**
 * Validate customer token middleware
 */
export const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.type !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check if customer still exists and is active
    const customer = await Customer.findById(decoded.id);
    if (!customer || !customer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Customer session expired'
      });
    }

    // Update last activity
    customer.lastActivity = new Date();
    await customer.save();

    req.customer = decoded;
    next();
  } catch (error) {
    console.error('Customer authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
