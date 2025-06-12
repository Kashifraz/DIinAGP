const User = require('../models/User');
const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// @desc    Get user profile
// @route   GET /api/profiles/me
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  const profileData = {
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

  logger.info('Profile retrieved', { userId: user._id });

  successResponse(res, 200, 'Profile retrieved successfully', { profile: profileData });
});

// @desc    Update user profile
// @route   PUT /api/profiles/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }

  const {
    fullName,
    professionalTitle,
    phone,
    location,
    bio,
    socialLinks
  } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  // Update profile fields
  const updateData = {};
  
  if (fullName !== undefined) updateData.fullName = fullName;
  if (professionalTitle !== undefined) updateData.professionalTitle = professionalTitle;
  if (phone !== undefined) updateData.phone = phone;
  if (location !== undefined) updateData.location = location;
  if (bio !== undefined) updateData.bio = bio;
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  const profileData = {
    id: updatedUser._id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    professionalTitle: updatedUser.professionalTitle,
    phone: updatedUser.phone,
    location: updatedUser.location,
    bio: updatedUser.bio,
    photo: updatedUser.photo,
    socialLinks: updatedUser.socialLinks,
    isVerified: updatedUser.isVerified,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };

  logger.info('Profile updated', { userId: user._id, updatedFields: Object.keys(updateData) });

  successResponse(res, 200, 'Profile updated successfully', { profile: profileData });
});

// @desc    Upload profile photo
// @route   POST /api/profiles/me/photo
// @access  Private
const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'No photo file provided');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  // Delete old photo if exists
  if (user.photo) {
    const oldPhotoPath = path.join(__dirname, '../uploads', user.photo);
    if (fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath);
    }
  }

  // Update user with new photo path
  const photoPath = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { photo: photoPath },
    { new: true }
  );

  const profileData = {
    id: updatedUser._id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    professionalTitle: updatedUser.professionalTitle,
    phone: updatedUser.phone,
    location: updatedUser.location,
    bio: updatedUser.bio,
    photo: updatedUser.photo,
    socialLinks: updatedUser.socialLinks,
    isVerified: updatedUser.isVerified,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };

  logger.info('Profile photo uploaded', { userId: user._id, photoPath });

  successResponse(res, 200, 'Profile photo uploaded successfully', { profile: profileData });
});

// @desc    Delete profile photo
// @route   DELETE /api/profiles/me/photo
// @access  Private
const deletePhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  if (!user.photo) {
    return errorResponse(res, 400, 'No photo to delete');
  }

  // Delete photo file
  const photoPath = path.join(__dirname, '../uploads', user.photo);
  if (fs.existsSync(photoPath)) {
    fs.unlinkSync(photoPath);
  }

  // Update user to remove photo reference
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { photo: null },
    { new: true }
  );

  const profileData = {
    id: updatedUser._id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    professionalTitle: updatedUser.professionalTitle,
    phone: updatedUser.phone,
    location: updatedUser.location,
    bio: updatedUser.bio,
    photo: updatedUser.photo,
    socialLinks: updatedUser.socialLinks,
    isVerified: updatedUser.isVerified,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };

  logger.info('Profile photo deleted', { userId: user._id });

  successResponse(res, 200, 'Profile photo deleted successfully', { profile: profileData });
});

// @desc    Get profile completion percentage
// @route   GET /api/profiles/me/completion
// @access  Private
const getProfileCompletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  // Calculate completion percentage
  const fields = [
    'fullName',
    'professionalTitle',
    'phone',
    'location',
    'bio',
    'photo',
    'socialLinks.linkedin',
    'socialLinks.github',
    'socialLinks.portfolio'
  ];

  let completedFields = 0;
  const totalFields = fields.length;

  fields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (user[parent] && user[parent][child]) {
        completedFields++;
      }
    } else if (user[field]) {
      completedFields++;
    }
  });

  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const completionData = {
    percentage: completionPercentage,
    completedFields,
    totalFields,
    missingFields: fields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return !(user[parent] && user[parent][child]);
      }
      return !user[field];
    })
  };

  logger.info('Profile completion calculated', { userId: user._id, percentage: completionPercentage });

  successResponse(res, 200, 'Profile completion retrieved successfully', completionData);
});

module.exports = {
  getProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  getProfileCompletion
};
