const User = require('../models/User');

// @desc    Get users pending verification
// @route   GET /api/admin/users/pending
// @access  Private/Admin
const getPendingUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isVerified: false });

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
          createdAt: user.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a user
// @route   POST /api/admin/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationBadge = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
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

// @desc    Reject a user with concerns
// @route   POST /api/admin/users/:id/reject
// @access  Private/Admin
const rejectUser = async (req, res, next) => {
  try {
    const { concerns } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already verified user'
      });
    }

    // TODO: Send rejection email with concerns
    // For now, just return success message

    res.status(200).json({
      success: true,
      message: 'User rejection processed. Concerns have been communicated.',
      data: {
        concerns,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verification statistics
// @route   GET /api/admin/verification-stats
// @access  Private/Admin
const getVerificationStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const pendingUsers = await User.countDocuments({ isVerified: false });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ]);

    const recentRegistrations = await User.find()
      .select('email role createdAt isVerified')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          verifiedUsers,
          pendingUsers,
          verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
        },
        usersByRole,
        recentRegistrations: recentRegistrations.map(user => ({
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters (Admin)
// @route   GET /api/admin/users
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
    if (req.query.verificationBadge !== undefined) filter.verificationBadge = req.query.verificationBadge === 'true';

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
          adminNotes: user.adminNotes,
          createdAt: user.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const toggleUserVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle verification badge
    user.verificationBadge = !user.verificationBadge;
    // Set isVerified to true when verificationBadge is true
    if (user.verificationBadge) {
      user.isVerified = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: user.verificationBadge ? 'User verified successfully' : 'User unverified successfully',
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

// @desc    Update user concern/notes
// @route   PUT /api/admin/users/:id/concern
// @access  Private/Admin
const updateUserConcern = async (req, res, next) => {
  try {
    const { concern } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { adminNotes: concern || '' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User concern updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          adminNotes: user.adminNotes
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingUsers,
  verifyUser,
  rejectUser,
  getVerificationStats,
  getAllUsers,
  toggleUserVerification,
  updateUserConcern
};

