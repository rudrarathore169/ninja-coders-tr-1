import bcrypt from 'bcrypt';
import User from '../models/User.js';
import {
  generateTokenPair,
  verifyRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
} from '../utils/generateTokens.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Authentication Controller
 * Handles user registration, login, logout, and token management
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;

  // Normalize input early
  const normalizedEmail = email?.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create new user
  const user = new User({
    name: (name || '').toString().trim(),
    email: normalizedEmail,
    passwordHash,
    role,
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokenPair(user._id.toString(), user.role, {
    email: user.email,
    name: user.name,
  });

  // Remove password hash from response
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      tokens,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // 2. Find user by email AND explicitly select the passwordHash
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+passwordHash'
  );

  // 3. Check if user exists
  if (!user) {
    // Do not reveal whether email exists
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // 4. Ensure passwordHash is present
  if (!user.passwordHash) {
    // This should not normally happen; log for debugging and return generic error
    console.error(`Missing passwordHash for user ${user._id} (${user.email})`);
    return res.status(500).json({ success: false, message: 'Server error: unable to verify credentials' });
  }

  // 5. Verify password
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  } catch (err) {
    console.error('Error comparing password:', err);
    return res.status(500).json({ success: false, message: 'Server error: unable to verify credentials' });
  }

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Generate tokens
  const tokens = generateTokenPair(user._id.toString(), user.role, {
    email: user.email,
    name: user.name,
  });

  // Remove password hash from response
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      tokens,
    },
  });
});

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // This endpoint can be used for logging purposes or future token blacklisting

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user._id.toString(), user.role, {
      email: user.email,
      name: user.name,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  // User is attached to request by auth middleware
  // We assume req.user does NOT have passwordHash, which is good
  const user = req.user;

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: userResponse,
    },
  });
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if email exists or not for security
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(user._id.toString());

  // In a real application, you would send this token via email
  // For now, we'll return it in the response (remove this in production)
  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    data: {
      resetToken, // Remove this in production - send via email instead
      expiresIn: '1 hour',
    },
  });
});

/**
 * Reset password using token
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required',
    });
  }

  try {
    // Verify reset token
    const decoded = verifyPasswordResetToken(token);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token',
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.passwordHash = passwordHash;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  }
});

/**
 * Change password (for authenticated users)
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id; // Get user ID from auth middleware

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
  }

  // 1. Re-fetch user from DB to get the passwordHash
  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // 2. Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Hash new password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  user.passwordHash = passwordHash;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Generate email verification token
 * POST /api/auth/send-verification
 */
export const sendEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  // Generate verification token
  const verificationToken = generateEmailVerificationToken(
    user._id.toString(),
    user.email
  );

  // In a real application, you would send this token via email
  // For now, we'll return it in the response (remove this in production)
  res.status(200).json({
    success: true,
    message: 'Email verification token generated',
    data: {
      verificationToken, // Remove this in production - send via email instead
      expiresIn: '24 hours',
    },
  });
});

/**
 * Verify email using token
 * POST /api/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required',
    });
  }

  try {
    // Verify email verification token
    const decoded = verifyEmailVerificationToken(token);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    // Update user as verified (you might want to add an 'emailVerified' field to your user schema)
    // user.emailVerified = true;
    // await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    });
  }
});

/**
 * Delete user account
 * DELETE /api/auth/delete-account
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user._id;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to delete account',
    });
  }

  // 1. Re-fetch user from DB to get the passwordHash
  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Incorrect password',
    });
  }

  // Delete user
  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

export default {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  sendEmailVerification,
  verifyEmail,
  deleteAccount,
};