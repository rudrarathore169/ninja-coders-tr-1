import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user to request object
 */
export const authenticate = async (req, res, next) => {
  try {
    // Allow preflight requests to pass through without authentication
    if (req.method === 'OPTIONS') return next();
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is required.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    // Check if user is active (you can add an 'active' field to user schema if needed)
    // if (!user.active) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Access denied. Account is deactivated.'
    //   });
    // }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Similar to authenticate but doesn't fail if no token is provided
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      req.userId = null;
      req.userRole = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      req.userId = null;
      req.userRole = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (user) {
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
    } else {
      req.user = null;
      req.userId = null;
      req.userRole = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    req.userId = null;
    req.userRole = null;
    next();
  }
};

/**
 * Refresh Token Authentication Middleware
 * Verifies refresh tokens for token renewal
 */
export const authenticateRefresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. User not found.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Refresh token middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during refresh token verification.'
    });
  }
};

export default {
  authenticate,
  optionalAuth,
  authenticateRefresh
};
