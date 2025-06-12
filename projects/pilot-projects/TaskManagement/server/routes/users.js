const express = require('express');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAdmin, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    List all users (admin only, with search)
// @access  Private (admin)
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };
  if (q) query.$text = { $search: q };
  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
  const count = await User.countDocuments(query);
  res.json({ success: true, data: { users, count } });
}));

module.exports = router; 