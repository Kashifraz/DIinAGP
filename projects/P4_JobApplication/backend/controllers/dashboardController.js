const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

// @desc    Get employee dashboard statistics
// @route   GET /api/dashboard/employee/stats
// @access  Private (Employee)
exports.getEmployeeStats = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;

  // Get total applications
  const totalApplications = await Application.countDocuments({ 
    employee: employeeId, 
    isActive: true 
  });

  // Get applications by status
  const statusBreakdown = await Application.aggregate([
    { $match: { employee: mongoose.Types.ObjectId.createFromHexString(employeeId), isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Format status breakdown
  const statusCounts = {
    submitted: 0,
    under_review: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  };

  statusBreakdown.forEach(item => {
    if (statusCounts.hasOwnProperty(item._id)) {
      statusCounts[item._id] = item.count;
    }
  });

  // Get recent applications (last 5)
  const recentApplications = await Application.find({ 
    employee: employeeId, 
    isActive: true 
  })
    .populate('job', 'title company location')
    .sort({ submittedAt: -1 })
    .limit(5)
    .select('job status submittedAt');

  res.status(200).json({
    success: true,
    data: {
      totalApplications,
      statusCounts,
      recentApplications
    }
  });
});

// @desc    Get employer dashboard statistics
// @route   GET /api/dashboard/employer/stats
// @access  Private (Employer)
exports.getEmployerStats = asyncHandler(async (req, res) => {
  const employerId = req.user.id;

  // Get total jobs posted
  const totalJobs = await JobPosting.countDocuments({ employer: employerId });

  // Get active jobs
  const activeJobs = await JobPosting.countDocuments({ 
    employer: employerId, 
    status: 'active' 
  });

  // Get total applications received
  const totalApplications = await Application.countDocuments({ 
    employer: employerId, 
    isActive: true 
  });

  // Get applications by status
  const statusBreakdown = await Application.aggregate([
    { $match: { employer: mongoose.Types.ObjectId.createFromHexString(employerId), isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Format status breakdown
  const statusCounts = {
    submitted: 0,
    under_review: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  };

  statusBreakdown.forEach(item => {
    if (statusCounts.hasOwnProperty(item._id)) {
      statusCounts[item._id] = item.count;
    }
  });

  // Get recent applications (last 5)
  const recentApplications = await Application.find({ 
    employer: employerId, 
    isActive: true 
  })
    .populate('employee', 'profile.firstName profile.lastName profile.email')
    .populate('job', 'title')
    .sort({ submittedAt: -1 })
    .limit(5)
    .select('employee job status submittedAt');

  // Get recent job postings
  const recentJobs = await JobPosting.find({ 
    employer: employerId 
  })
    .select('title status postedAt')
    .sort({ postedAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalJobs,
      activeJobs,
      totalApplications,
      statusCounts,
      recentApplications,
      recentJobs
    }
  });
});

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin/stats
// @access  Private (Admin)
exports.getAdminStats = asyncHandler(async (req, res) => {
  // Get total users
  const totalUsers = await User.countDocuments();

  // Get users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Format role breakdown
  const roleCounts = {
    employee: 0,
    employer: 0,
    admin: 0
  };

  usersByRole.forEach(item => {
    if (roleCounts.hasOwnProperty(item._id)) {
      roleCounts[item._id] = item.count;
    }
  });

  // Get verified users count
  const verifiedUsers = await User.countDocuments({ verificationBadge: true });

  // Get active jobs count
  const activeJobs = await JobPosting.countDocuments({ status: 'active' });

  // Get total jobs count
  const totalJobs = await JobPosting.countDocuments();

  // Get total applications count
  const totalApplications = await Application.countDocuments({ isActive: true });

  // Get recent users (last 10)
  const recentUsers = await User.find()
    .select('profile.firstName profile.lastName email role createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get recent jobs (last 10)
  const recentJobs = await JobPosting.find()
    .populate('employer', 'profile.organization')
    .select('title status postedAt employer')
    .sort({ postedAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      roleCounts,
      verifiedUsers,
      activeJobs,
      totalJobs,
      totalApplications,
      recentUsers,
      recentJobs
    }
  });
});

