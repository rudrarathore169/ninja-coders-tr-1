/**
 * Role-Based Access Control Middleware
 * Controls access to routes based on user roles
 */

/**
 * Middleware to check if user has required role
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // Convert single role to array for consistent handling
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to require staff or admin role
 */
export const requireStaff = requireRole(['staff', 'admin']);

/**
 * Middleware to require customer role
 */
export const requireCustomer = requireRole('customer');

/**
 * Middleware to require any authenticated user (customer, staff, or admin)
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }
  next();
};

/**
 * Middleware to check if user can access resource
 * Useful for checking if user can access their own data or admin can access any data
 */
export const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }

  const resourceUserId = req.params.userId || req.params.id;
  
  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // User can only access their own resource
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

/**
 * Middleware to check if user can manage orders
 * Staff and admin can manage orders, customers can only view their own
 */
export const requireOrderAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }

  // Staff and admin can access any order
  if (['staff', 'admin'].includes(req.user.role)) {
    return next();
  }

  // For customers, check if they're accessing their own order
  if (req.user.role === 'customer') {
    // This will be implemented when we have order routes
    // For now, allow access
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Insufficient permissions to access orders.'
  });
};

/**
 * Middleware to check if user can manage menu items
 * Only admin can manage menu items
 */
export const requireMenuManagement = requireAdmin;

/**
 * Middleware to check if user can manage tables
 * Only admin can manage tables
 */
export const requireTableManagement = requireAdmin;

/**
 * Middleware to check if user can view analytics
 * Only admin can view analytics
 */
export const requireAnalyticsAccess = requireAdmin;

/**
 * Middleware to check if user can manage users
 * Only admin can manage users
 */
export const requireUserManagement = requireAdmin;

/**
 * Middleware to check if user can access table by QR code
 * This allows unauthenticated access for QR code scanning
 */
export const allowQRCodeAccess = (req, res, next) => {
  // QR code access is allowed without authentication
  // The table route will handle the QR code validation
  next();
};

/**
 * Middleware to check if user can place orders
 * Customers and unauthenticated users can place orders
 */
export const requireOrderPlacement = (req, res, next) => {
  // Orders can be placed by anyone (authenticated or not)
  // This allows guest orders
  next();
};

/**
 * Middleware to check if user can view menu
 * Menu is publicly accessible
 */
export const requireMenuAccess = (req, res, next) => {
  // Menu is publicly accessible
  next();
};

/**
 * Middleware to check if user can view categories
 * Categories are publicly accessible
 */
export const requireCategoryAccess = (req, res, next) => {
  // Categories are publicly accessible
  next();
};

/**
 * Middleware to check if user can view tables
 * Tables are publicly accessible for QR code scanning
 */
export const requireTableAccess = (req, res, next) => {
  // Tables are publicly accessible for QR code scanning
  next();
};

export default {
  requireRole,
  requireAdmin,
  requireStaff,
  requireCustomer,
  requireAuth,
  requireOwnershipOrAdmin,
  requireOrderAccess,
  requireMenuManagement,
  requireTableManagement,
  requireAnalyticsAccess,
  requireUserManagement,
  allowQRCodeAccess,
  requireOrderPlacement,
  requireMenuAccess,
  requireCategoryAccess,
  requireTableAccess
};
