import config from '../config/config.js';

/**
 * Global Error Handler Middleware
 * Handles all errors in the application and provides consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    const message = 'CORS policy violation';
    error = { message, statusCode: 403 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 };
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timeout';
    error = { message, statusCode: 504 };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
    success: false,
    message: message,
    ...(config.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  // Add additional info for specific error types
  if (err.name === 'ValidationError') {
    errorResponse.errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  if (err.code === 11000) {
    errorResponse.duplicateField = Object.keys(err.keyValue)[0];
    errorResponse.duplicateValue = Object.values(err.keyValue)[0];
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch and pass errors to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Error Handler
 * Handles 404 errors for undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Validation Error Handler
 * Handles validation errors from express-validator
 */
export const validationErrorHandler = (req, res, next) => {
  // This will be used with express-validator
  // Implementation will be added when we implement validation
  next();
};

/**
 * Rate Limit Error Handler
 * Handles rate limiting errors
 */
export const rateLimitErrorHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: req.rateLimit?.resetTime || null
  });
};

/**
 * File Upload Error Handler
 * Handles file upload specific errors
 */
export const fileUploadErrorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large',
      maxSize: config.FILE_UPLOAD.MAX_FILE_SIZE
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field',
      expectedFields: ['image']
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded',
      maxCount: 1
    });
  }

  next(err);
};

export default {
  errorHandler,
  asyncHandler,
  notFound,
  validationErrorHandler,
  rateLimitErrorHandler,
  fileUploadErrorHandler
};
