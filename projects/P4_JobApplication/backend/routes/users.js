const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  updatePassword,
  deleteProfile,
  getAllUsers,
  getUserById
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const uploadProfilePictureMiddleware = require('../middleware/uploadProfilePicture');
const { validate, schemas } = require('../middleware/validation');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, validate(schemas.profileUpdate), updateProfile);

// @route   POST /api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', protect, uploadProfilePictureMiddleware.single('avatar'), uploadProfilePicture);

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put('/password', protect, validate(schemas.passwordUpdate), updatePassword);

// @route   DELETE /api/users/profile
// @desc    Delete current user profile
// @access  Private
router.delete('/profile', protect, deleteProfile);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), getUserById);

module.exports = router;

