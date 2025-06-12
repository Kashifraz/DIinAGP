const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  verifyUser,
  rejectUser,
  getVerificationStats,
  getAllUsers,
  toggleUserVerification,
  updateUserConcern
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/users/pending
// @desc    Get users pending verification
// @access  Private/Admin
router.get('/users/pending', protect, authorize('admin'), getPendingUsers);

// @route   POST /api/admin/users/:id/verify
// @desc    Verify a user
// @access  Private/Admin
router.post('/users/:id/verify', protect, authorize('admin'), verifyUser);

// @route   POST /api/admin/users/:id/reject
// @desc    Reject a user with concerns
// @access  Private/Admin
router.post('/users/:id/reject', protect, authorize('admin'), rejectUser);

// @route   GET /api/admin/verification-stats
// @desc    Get verification statistics
// @access  Private/Admin
router.get('/verification-stats', protect, authorize('admin'), getVerificationStats);

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), getAllUsers);

// @route   PUT /api/admin/users/:id/verify
// @desc    Toggle user verification status
// @access  Private/Admin
router.put('/users/:id/verify', protect, authorize('admin'), toggleUserVerification);

// @route   PUT /api/admin/users/:id/concern
// @desc    Update user concern/notes
// @access  Private/Admin
router.put('/users/:id/concern', protect, authorize('admin'), updateUserConcern);

module.exports = router;

