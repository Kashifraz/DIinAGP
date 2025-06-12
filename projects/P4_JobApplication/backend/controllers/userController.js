const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationBadge: user.verificationBadge,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, organization, professionalCategory } = req.body;

    // Build update object
    const updateData = {
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      'profile.phone': phone || ''
    };

    // Role-specific fields
    if (req.user.role === 'employer') {
      updateData['profile.organization'] = organization || '';
    }
    if (req.user.role === 'employee') {
      updateData['profile.professionalCategory'] = professionalCategory || '';
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationBadge: user.verificationBadge,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    // Delete old profile picture if exists
    if (user.profile.avatar) {
      const oldImagePath = path.join(process.cwd(), user.profile.avatar);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    // Update user with new avatar path
    user.profile.avatar = `uploads/photos/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        avatar: user.profile.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete current user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationBadge: user.verificationBadge,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationBadge: user.verificationBadge,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  updatePassword,
  deleteProfile,
  getAllUsers,
  getUserById
};

