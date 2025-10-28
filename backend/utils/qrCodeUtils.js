import { generateRandomString } from './generateTokens.js';

/**
 * QR Code Generation and Management Utilities
 */

/**
 * Generate a unique QR code slug for a table
 * @param {number} tableNumber - Table number
 * @returns {string} Unique QR code slug
 */
export const generateQRCodeSlug = (tableNumber) => {
  const timestamp = Date.now().toString(36);
  const randomString = generateRandomString(8);
  return `table-${tableNumber}-${timestamp}-${randomString}`;
};

/**
 * Generate QR code URL for a table
 * @param {string} qrSlug - QR code slug
 * @param {string} baseUrl - Base URL of the application
 * @returns {string} Complete QR code URL
 */
export const generateQRCodeURL = (qrSlug, baseUrl = 'http://localhost:3000') => {
  // QR landing route in frontend is /m/:qrSlug (configured in Router.jsx)
  return `${baseUrl.replace(/\/$/, '')}/m/${qrSlug}`;
};

/**
 * Parse QR code slug to extract table information
 * @param {string} qrSlug - QR code slug
 * @returns {Object|null} Parsed table information or null if invalid
 */
export const parseQRCodeSlug = (qrSlug) => {
  try {
    // Expected format: table-{number}-{timestamp}-{randomString}
    const parts = qrSlug.split('-');

    if (parts.length < 4 || parts[0] !== 'table') {
      return null;
    }

    const tableNumber = parseInt(parts[1]);
    const timestamp = parts[2];
    const randomString = parts.slice(3).join('-');

    if (isNaN(tableNumber) || tableNumber <= 0) {
      return null;
    }

    return {
      tableNumber,
      timestamp,
      randomString,
      isValid: true
    };
  } catch (error) {
    return null;
  }
};

/**
 * Validate QR code slug format
 * @param {string} qrSlug - QR code slug to validate
 * @returns {boolean} True if valid format
 */
export const isValidQRCodeSlug = (qrSlug) => {
  const parsed = parseQRCodeSlug(qrSlug);
  return parsed !== null && parsed.isValid;
};

/**
 * Generate QR code data for API response
 * @param {Object} table - Table object
 * @param {string} baseUrl - Base URL of the application
 * @returns {Object} QR code data object
 */
export const generateQRCodeData = (table, baseUrl = 'http://localhost:3000') => {
  const qrUrl = generateQRCodeURL(table.qrSlug, baseUrl);

  return {
    // Keep backward-compatible `tableId`, and include `_id` and `id` so frontend
    // code that expects Mongo's `_id` property works correctly.
    tableId: table._id,
    _id: table._id,
    id: table._id,
    // include both `number` and `tableNumber` for compatibility with various clients
    number: table.number,
    tableNumber: table.number,
    qrSlug: table.qrSlug,
    qrUrl: qrUrl,
    occupied: !!table.occupied,
    createdAt: table.createdAt,
    updatedAt: table.updatedAt
  };
};

/**
 * Generate QR code data for multiple tables
 * @param {Array} tables - Array of table objects
 * @param {string} baseUrl - Base URL of the application
 * @returns {Array} Array of QR code data objects
 */
export const generateMultipleQRCodeData = (tables, baseUrl = 'http://localhost:3000') => {
  return tables.map(table => generateQRCodeData(table, baseUrl));
};

/**
 * Generate session ID for table QR code access
 * @param {string} qrSlug - QR code slug
 * @param {string} userAgent - User agent string
 * @param {string} ipAddress - IP address
 * @returns {string} Session ID
 */
export const generateTableSessionId = (qrSlug, userAgent = '', ipAddress = '') => {
  const timestamp = Date.now().toString(36);
  const randomString = generateRandomString(12);
  const userAgentHash = userAgent ? userAgent.substring(0, 8) : '';
  const ipHash = ipAddress ? ipAddress.replace(/\./g, '') : '';

  return `session-${qrSlug}-${timestamp}-${randomString}-${userAgentHash}-${ipHash}`;
};

/**
 * Parse session ID to extract information
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Parsed session information or null if invalid
 */
export const parseTableSessionId = (sessionId) => {
  try {
    // Expected format: session-{qrSlug}-{timestamp}-{randomString}-{userAgentHash}-{ipHash}
    const parts = sessionId.split('-');

    if (parts.length < 6 || parts[0] !== 'session') {
      return null;
    }

    const qrSlug = parts.slice(1, -4).join('-'); // Everything between 'session' and last 4 parts
    const timestamp = parts[parts.length - 4];
    const randomString = parts[parts.length - 3];
    const userAgentHash = parts[parts.length - 2];
    const ipHash = parts[parts.length - 1];

    return {
      qrSlug,
      timestamp,
      randomString,
      userAgentHash,
      ipHash,
      isValid: true
    };
  } catch (error) {
    return null;
  }
};

/**
 * Generate QR code for menu access (public menu)
 * @param {string} baseUrl - Base URL of the application
 * @returns {Object} QR code data for public menu access
 */
export const generatePublicMenuQRCode = (baseUrl = 'http://localhost:3000') => {
  const qrSlug = `public-menu-${generateRandomString(16)}`;
  const qrUrl = `${baseUrl}/menu/public`;

  return {
    qrSlug,
    qrUrl,
    type: 'public-menu',
    createdAt: new Date()
  };
};

/**
 * Generate QR code for specific menu category
 * @param {string} categoryId - Category ID
 * @param {string} categoryName - Category name
 * @param {string} baseUrl - Base URL of the application
 * @returns {Object} QR code data for category access
 */
export const generateCategoryQRCode = (categoryId, categoryName, baseUrl = 'http://localhost:3000') => {
  const qrSlug = `category-${categoryId}-${generateRandomString(12)}`;
  const qrUrl = `${baseUrl}/menu/category/${categoryId}`;

  return {
    categoryId,
    categoryName,
    qrSlug,
    qrUrl,
    type: 'category',
    createdAt: new Date()
  };
};

/**
 * Generate QR code for specific menu item
 * @param {string} itemId - Menu item ID
 * @param {string} itemName - Menu item name
 * @param {string} baseUrl - Base URL of the application
 * @returns {Object} QR code data for item access
 */
export const generateMenuItemQRCode = (itemId, itemName, baseUrl = 'http://localhost:3000') => {
  const qrSlug = `item-${itemId}-${generateRandomString(12)}`;
  const qrUrl = `${baseUrl}/menu/item/${itemId}`;

  return {
    itemId,
    itemName,
    qrSlug,
    qrUrl,
    type: 'menu-item',
    createdAt: new Date()
  };
};

/**
 * Validate QR code URL
 * @param {string} url - QR code URL to validate
 * @returns {boolean} True if valid URL format
 */
export const isValidQRCodeURL = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Check if it's a valid QR code URL pattern
    return (
      pathname.startsWith('/table/') ||
      pathname.startsWith('/menu/') ||
      pathname.startsWith('/category/') ||
      pathname.startsWith('/item/')
    );
  } catch (error) {
    return false;
  }
};

/**
 * Extract QR code type from URL
 * @param {string} url - QR code URL
 * @returns {string|null} QR code type or null if invalid
 */
export const extractQRCodeType = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    if (pathname.startsWith('/table/')) return 'table';
    if (pathname.startsWith('/menu/public')) return 'public-menu';
    if (pathname.startsWith('/menu/category/')) return 'category';
    if (pathname.startsWith('/menu/item/')) return 'menu-item';

    return null;
  } catch (error) {
    return null;
  }
};

export default {
  generateQRCodeSlug,
  generateQRCodeURL,
  parseQRCodeSlug,
  isValidQRCodeSlug,
  generateQRCodeData,
  generateMultipleQRCodeData,
  generateTableSessionId,
  parseTableSessionId,
  generatePublicMenuQRCode,
  generateCategoryQRCode,
  generateMenuItemQRCode,
  isValidQRCodeURL,
  extractQRCodeType
};
