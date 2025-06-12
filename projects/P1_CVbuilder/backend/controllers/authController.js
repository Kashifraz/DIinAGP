const User = require('../models/User');
const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/response');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }

  const { email, password, fullName } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, 400, 'User with this email already exists');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    fullName
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);
    logger.info('Verification email sent', { userId: user._id, email: user.email });
  } catch (error) {
    logger.error('Failed to send verification email', { error: error.message, userId: user._id });
    // Don't fail registration if email sending fails
  }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Remove sensitive data
  const userData = {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };

  logger.info('User registered successfully', { userId: user._id, email: user.email });

  successResponse(res, 201, 'User registered successfully. Please check your email for verification.', {
    user: userData,
    token,
    refreshToken
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }

  const { email, password, rememberMe } = req.body;

  // Find user and include password for comparison
  const user = await User.findByEmail(email).select('+password +loginAttempts +lockUntil');
  
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    return errorResponse(res, 423, 'Account is temporarily locked due to too many failed login attempts. Please try again later.');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    logger.warn('Failed login attempt', { email, ip: req.ip });
    return errorResponse(res, 401, 'Invalid email or password');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Remove sensitive data
  const userData = {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    professionalTitle: user.professionalTitle,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin
  };

  logger.info('User logged in successfully', { userId: user._id, email: user.email });

  successResponse(res, 200, 'Login successful', {
    user: userData,
    token,
    refreshToken
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled on the client side
  // by removing the token. However, we can log the logout event.
  
  logger.info('User logged out', { userId: req.user.id, email: req.user.email });

  successResponse(res, 200, 'Logout successful');
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 401, 'Refresh token is required');
  }

  try {
    const jwt = require('jsonwebtoken');
    const config = require('../config');
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    successResponse(res, 200, 'Token refreshed successfully', {
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    return errorResponse(res, 401, 'Invalid refresh token');
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  const userData = {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    professionalTitle: user.professionalTitle,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    photo: user.photo,
    socialLinks: user.socialLinks,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  successResponse(res, 200, 'User data retrieved successfully', { user: userData });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findByVerificationToken(token);
  
  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired verification token');
  }

  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  try {
    // Send welcome email
    await sendWelcomeEmail(user.email, user.fullName);
    logger.info('Welcome email sent', { userId: user._id, email: user.email });
  } catch (error) {
    logger.error('Failed to send welcome email', { error: error.message, userId: user._id });
    // Don't fail verification if email sending fails
  }

  logger.info('Email verified successfully', { userId: user._id, email: user.email });

  successResponse(res, 200, 'Email verified successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }

  const { email } = req.body;

  const user = await User.findByEmail(email);
  
  if (!user) {
    // Don't reveal if email exists or not for security
    return successResponse(res, 200, 'If the email exists, a password reset link has been sent');
  }

  // Generate password reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);
    logger.info('Password reset email sent', { userId: user._id, email: user.email });
  } catch (error) {
    // Reset the token if email sending fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    logger.error('Failed to send password reset email', { error: error.message, userId: user._id });
    return errorResponse(res, 500, 'Error sending password reset email');
  }

  successResponse(res, 200, 'If the email exists, a password reset link has been sent');
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }

  const { token, password } = req.body;

  const user = await User.findByPasswordResetToken(token);
  
  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired password reset token');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info('Password reset successfully', { userId: user._id, email: user.email });

  successResponse(res, 200, 'Password reset successfully');
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }

  const { currentPassword, newPassword } = req.body;

  // Find user with password
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return errorResponse(res, 400, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info('Password changed successfully', { userId: user._id, email: user.email });

  successResponse(res, 200, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
};
