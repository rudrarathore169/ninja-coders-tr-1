import validator from 'validator';
import { body, validationResult } from 'express-validator';

/**
 * Input Validation Utilities
 */

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };
  
  if (!password || typeof password !== 'string') {
    result.feedback.push('Password is required');
    return result;
  }
  
  // Length check
  if (password.length < 8) {
    result.feedback.push('Password must be at least 8 characters long');
  } else {
    result.score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password must contain at least one uppercase letter');
  } else {
    result.score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password must contain at least one lowercase letter');
  } else {
    result.score += 1;
  }
  
  // Number check
  if (!/\d/.test(password)) {
    result.feedback.push('Password must contain at least one number');
  } else {
    result.score += 1;
  }
  
  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.feedback.push('Password must contain at least one special character');
  } else {
    result.score += 1;
  }
  
  // Common password check
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    result.feedback.push('Password is too common');
  } else {
    result.score += 1;
  }
  
  result.isValid = result.score >= 4;
  
  return result;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const isValidPhoneNumber = (phone) => {
  return validator.isMobilePhone(phone);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const isValidURL = (url) => {
  return validator.isURL(url);
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId to validate
 * @returns {boolean} True if ObjectId is valid
 */
export const isValidObjectId = (id) => {
  return validator.isMongoId(id);
};

/**
 * Validate price (positive number with up to 2 decimal places)
 * @param {number|string} price - Price to validate
 * @returns {boolean} True if price is valid
 */
export const isValidPrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0 && numPrice <= 999999.99;
};

/**
 * Validate quantity (positive integer)
 * @param {number|string} quantity - Quantity to validate
 * @returns {boolean} True if quantity is valid
 */
export const isValidQuantity = (quantity) => {
  const numQuantity = parseInt(quantity);
  return !isNaN(numQuantity) && numQuantity > 0 && numQuantity <= 999;
};

/**
 * Validate table number (positive integer)
 * @param {number|string} tableNumber - Table number to validate
 * @returns {boolean} True if table number is valid
 */
export const isValidTableNumber = (tableNumber) => {
  const numTableNumber = parseInt(tableNumber);
  return !isNaN(numTableNumber) && numTableNumber > 0 && numTableNumber <= 999;
};

/**
 * Validate order status
 * @param {string} status - Order status to validate
 * @returns {boolean} True if status is valid
 */
export const isValidOrderStatus = (status) => {
  const validStatuses = ['placed', 'preparing', 'ready', 'served', 'canceled'];
  return validStatuses.includes(status);
};

/**
 * Validate user role
 * @param {string} role - User role to validate
 * @returns {boolean} True if role is valid
 */
export const isValidUserRole = (role) => {
  const validRoles = ['customer', 'staff', 'admin'];
  return validRoles.includes(role);
};

/**
 * Validate name (letters, digits, spaces, hyphens, apostrophes)
 * Accepts names like 'John Doe', 'QA User 3', or 'Anne-Marie'
 * @param {string} name - Name to validate
 * @returns {boolean} True if name is valid
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Allow letters, numbers, spaces, hyphens and apostrophes
  const nameRegex = /^[a-zA-Z0-9\s\-']+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Validate description (text with reasonable length)
 * @param {string} description - Description to validate
 * @returns {boolean} True if description is valid
 */
export const isValidDescription = (description) => {
  if (!description || typeof description !== 'string') return false;
  return description.trim().length >= 10 && description.trim().length <= 1000;
};

/**
 * Validate tags (array of strings)
 * @param {Array} tags - Tags to validate
 * @returns {boolean} True if tags are valid
 */
export const isValidTags = (tags) => {
  if (!Array.isArray(tags)) return false;
  if (tags.length > 10) return false;
  
  return tags.every(tag => 
    typeof tag === 'string' && 
    tag.trim().length >= 2 && 
    tag.trim().length <= 20
  );
};

/**
 * Express-validator middleware for user registration
 */
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    // Accept digits as well (useful for QA names like 'QA User 3')
    .matches(/^[a-zA-Z0-9\s\-']+$/)
    .withMessage("Name can only contain letters, numbers, spaces, hyphens, and apostrophes"),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['customer', 'staff', 'admin'])
    .withMessage('Role must be customer, staff, or admin')
];

/**
 * Express-validator middleware for user login
 */
export const validateUserLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Express-validator middleware for menu item creation
 */
export const validateMenuItem = [
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
    .withMessage('Availability must be a boolean value'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

/**
 * Express-validator middleware for table creation
 */
export const validateTable = [
  body('number')
    .isInt({ min: 1, max: 999 })
    .withMessage('Table number must be a positive integer between 1 and 999')
];

/**
 * Express-validator middleware for order creation
 */
export const validateOrder = [
  body('tableId')
    .optional()
    .isMongoId()
    .withMessage('Table ID must be a valid MongoDB ObjectId'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.menuItemId')
    .isMongoId()
    .withMessage('Menu item ID must be a valid MongoDB ObjectId'),
  
  body('items.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Item name is required'),
  
  body('items.*.price')
    .isFloat({ min: 0.01 })
    .withMessage('Item price must be a positive number'),
  
  body('items.*.qty')
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be a positive integer between 1 and 999'),
  
  body('items.*.note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Note cannot exceed 200 characters')
];

/**
 * Express-validator middleware for order status update
 */
export const validateOrderStatus = [
  body('status')
    .isIn(['placed', 'preparing', 'ready', 'served', 'canceled'])
    .withMessage('Status must be one of: placed, preparing, ready, served, canceled')
];

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} Error response if validation fails
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

export default {
  sanitizeString,
  isValidEmail,
  validatePasswordStrength,
  isValidPhoneNumber,
  isValidURL,
  isValidObjectId,
  isValidPrice,
  isValidQuantity,
  isValidTableNumber,
  isValidOrderStatus,
  isValidUserRole,
  isValidName,
  isValidDescription,
  isValidTags,
  validateUserRegistration,
  validateUserLogin,
  validateMenuItem,
  validateTable,
  validateOrder,
  validateOrderStatus,
  handleValidationErrors
};
