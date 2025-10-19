import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * JWT Token Generation and Validation Utilities
 */

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {Object} additionalPayload - Additional data to include in token
 * @returns {string} JWT access token
 */
export const generateAccessToken = (userId, role, additionalPayload = {}) => {
  const payload = {
    userId,
    role,
    type: 'access',
    ...additionalPayload
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
    issuer: 'restaurant-qr-menu',
    audience: 'restaurant-qr-menu-client'
  });
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId, role) => {
  const payload = {
    userId,
    role,
    type: 'refresh'
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE,
    issuer: 'restaurant-qr-menu',
    audience: 'restaurant-qr-menu-client'
  });
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {Object} additionalPayload - Additional data to include in access token
 * @returns {Object} Object containing accessToken and refreshToken
 */
export const generateTokenPair = (userId, role, additionalPayload = {}) => {
  const accessToken = generateAccessToken(userId, role, additionalPayload);
  const refreshToken = generateRefreshToken(userId, role);

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: config.JWT_EXPIRE
  };
};

/**
 * Verify JWT access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

/**
 * Verify JWT refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Token expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {string} Password reset token
 */
export const generatePasswordResetToken = (userId) => {
  const payload = {
    userId,
    type: 'password-reset',
    timestamp: Date.now()
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '1h', // Password reset tokens expire in 1 hour
    issuer: 'restaurant-qr-menu',
    audience: 'restaurant-qr-menu-client'
  });
};

/**
 * Verify password reset token
 * @param {string} token - Password reset token
 * @returns {Object} Decoded token payload
 */
export const verifyPasswordResetToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Email verification token
 */
export const generateEmailVerificationToken = (userId, email) => {
  const payload = {
    userId,
    email,
    type: 'email-verification',
    timestamp: Date.now()
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '24h', // Email verification tokens expire in 24 hours
    issuer: 'restaurant-qr-menu',
    audience: 'restaurant-qr-menu-client'
  });
};

/**
 * Verify email verification token
 * @param {string} token - Email verification token
 * @returns {Object} Decoded token payload
 */
export const verifyEmailVerificationToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

/**
 * Generate API key token (for external integrations)
 * @param {string} userId - User ID
 * @param {string} purpose - Purpose of the API key
 * @returns {string} API key token
 */
export const generateApiKey = (userId, purpose = 'general') => {
  const payload = {
    userId,
    purpose,
    type: 'api-key',
    timestamp: Date.now()
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '1y', // API keys expire in 1 year
    issuer: 'restaurant-qr-menu',
    audience: 'restaurant-qr-menu-client'
  });
};

/**
 * Verify API key token
 * @param {string} token - API key token
 * @returns {Object} Decoded token payload
 */
export const verifyApiKey = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  if (!authHeader.startsWith('Bearer ')) return null;
  
  return authHeader.substring(7);
};

/**
 * Generate secure random string
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generateApiKey,
  verifyApiKey,
  extractTokenFromHeader,
  generateRandomString
};
