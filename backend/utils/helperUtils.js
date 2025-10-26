/**
 * Helper Utilities for common operations
 */

/**
 * Generate unique ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${randomString}`;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-US') => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date and time
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, locale = 'en-US') => {
  const dateObj = new Date(date);
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Calculate time difference in human readable format
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date (default: now)
 * @returns {string} Human readable time difference
 */
export const getTimeDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Calculate order total
 * @param {Array} items - Array of order items
 * @returns {number} Total amount
 */
export const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.qty);
  }, 0);
};

/**
 * Calculate tax amount
 * @param {number} amount - Amount to calculate tax on
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns {number} Tax amount
 */
export const calculateTax = (amount, taxRate = 0.08) => {
  return amount * taxRate;
};

/**
 * Calculate total with tax
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns {number} Total amount including tax
 */
export const calculateTotalWithTax = (amount, taxRate = 0.08) => {
  return amount + calculateTax(amount, taxRate);
};

/**
 * Generate order number
 * @param {string} prefix - Prefix for order number (default: ORD)
 * @returns {string} Unique order number
 */
export const generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomString}`;
};

/**
 * Generate invoice number
 * @param {string} prefix - Prefix for invoice number (default: INV)
 * @returns {string} Unique invoice number
 */
export const generateInvoiceNumber = (prefix = 'INV') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomString}`;
};

/**
 * Generate receipt number
 * @param {string} prefix - Prefix for receipt number (default: RCP)
 * @returns {string} Unique receipt number
 */
export const generateReceiptNumber = (prefix = 'RCP') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomString}`;
};

/**
 * Paginate array of data
 * @param {Array} data - Array to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
export const paginateArray = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      totalItems: data.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < data.length,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Sort array by field
 * @param {Array} data - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortArray = (data, field, order = 'asc') => {
  return data.sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (order === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
};

/**
 * Filter array by search term
 * @param {Array} data - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} Filtered array
 */
export const filterArray = (data, searchTerm, fields) => {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  
  return data.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      return false;
    });
  });
};

/**
 * Generate slug from string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export const deepMerge = (target, source) => {
  const result = deepClone(target);
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
};

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random boolean
 * @returns {boolean} Random boolean value
 */
export const randomBoolean = () => {
  return Math.random() < 0.5;
};

/**
 * Generate random item from array
 * @param {Array} array - Array to pick from
 * @returns {any} Random item
 */
export const randomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export default {
  generateUniqueId,
  formatCurrency,
  formatDate,
  formatDateTime,
  getTimeDifference,
  calculateOrderTotal,
  calculateTax,
  calculateTotalWithTax,
  generateOrderNumber,
  generateInvoiceNumber,
  generateReceiptNumber,
  paginateArray,
  sortArray,
  filterArray,
  generateSlug,
  capitalizeWords,
  generateRandomColor,
  isEmpty,
  deepClone,
  deepMerge,
  randomBetween,
  randomBoolean,
  randomFromArray
};
