import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * User Management Controller
 * Handles user profile management and user administration
 */

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  
  // Build query
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get users
  const users = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await User.countDocuments(query);

  // Format response
  const usersResponse = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: usersResponse,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      }
    }
  });
});

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: userResponse
    }
  });
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  // Check if email is being changed and if it already exists
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another user'
      });
    }
  }

  // Update user
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.toLowerCase().trim();

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-passwordHash');

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userResponse
    }
  });
});

/**
 * Update user role (Admin only)
 * PUT /api/users/:id/role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  const validRoles = ['customer', 'staff', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be one of: customer, staff, admin'
    });
  }

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from changing their own role
  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot change your own role'
    });
  }

  // Update user role
  user.role = role;
  await user.save();

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: userResponse
    }
  });
});

/**
 * Deactivate user account (Admin only)
 * PUT /api/users/:id/deactivate
 */
export const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deactivating themselves
  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account'
    });
  }

  // For now, we'll delete the user (in a real app, you might want to add an 'active' field)
  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'User account deactivated successfully'
  });
});

/**
 * Get user statistics (Admin only)
 * GET /api/users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  // Get user counts by role
  const totalUsers = await User.countDocuments();
  const customerCount = await User.countDocuments({ role: 'customer' });
  const staffCount = await User.countDocuments({ role: 'staff' });
  const adminCount = await User.countDocuments({ role: 'admin' });

  // Get recent users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Get users created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const monthlyUsers = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  res.status(200).json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: {
      stats: {
        totalUsers,
        customerCount,
        staffCount,
        adminCount,
        recentUsers,
        monthlyUsers
      }
    }
  });
});

/**
 * Search users (Admin only)
 * GET /api/users/search
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, role, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  // Build search query
  const query = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  };

  if (role) {
    query.role = role;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Search users
  const users = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await User.countDocuments(query);

  // Format response
  const usersResponse = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));

  res.status(200).json({
    success: true,
    message: 'User search completed successfully',
    data: {
      users: usersResponse,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      },
      searchQuery: q
    }
  });
});

export default {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  deactivateUser,
  getUserStats,
  searchUsers
};