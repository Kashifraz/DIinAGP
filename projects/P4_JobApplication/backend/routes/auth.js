const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  resetPassword,
  updateProfile
} = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { schemas } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(schemas.userRegistration), registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(schemas.userLogin), loginUser);

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', resetPassword);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

module.exports = router;

