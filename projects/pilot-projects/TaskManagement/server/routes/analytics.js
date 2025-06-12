const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/analytics/completion-rates
// @desc    Get task completion rates per project (optionally filtered by user)
// @access  Private
router.get('/completion-rates', asyncHandler(async (req, res) => {
  const { projectId, userId } = req.query;
  const match = { isArchived: false };
  if (projectId) match.project = projectId;
  if (userId) match.assignees = userId;
  if (req.user.role !== 'admin') match.assignees = req.user._id;

  const total = await Task.countDocuments(match);
  const completed = await Task.countDocuments({ ...match, status: 'completed' });
  const inProgress = await Task.countDocuments({ ...match, status: 'in_progress' });
  const open = await Task.countDocuments({ ...match, status: 'open' });
  const review = await Task.countDocuments({ ...match, status: 'review' });
  const cancelled = await Task.countDocuments({ ...match, status: 'cancelled' });

  res.json({
    success: true,
    data: {
      total,
      completed,
      inProgress,
      open,
      review,
      cancelled,
      completionRate: total ? Math.round((completed / total) * 100) : 0
    }
  });
}));

// @route   GET /api/analytics/workload
// @desc    Get workload distribution across team members for a project
// @access  Private
router.get('/workload', asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ success: false, message: 'Project ID required' });
  const match = { project: projectId, isArchived: false };
  if (req.user.role !== 'admin') match.assignees = req.user._id;

  const workload = await Task.aggregate([
    { $match: match },
    { $unwind: '$assignees' },
    { $group: { _id: '$assignees', count: { $sum: 1 } } },
    { $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user'
    } },
    { $unwind: '$user' },
    { $project: {
      _id: 0,
      userId: '$user._id',
      name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
      email: '$user.email',
      avatar: '$user.avatar',
      count: 1
    } }
  ]);
  res.json({ success: true, data: { workload } });
}));

// @route   GET /api/analytics/overdue
// @desc    Get overdue tasks (optionally filtered by project or user)
// @access  Private
router.get('/overdue', asyncHandler(async (req, res) => {
  const { projectId, userId } = req.query;
  const match = {
    isArchived: false,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  };
  if (projectId) match.project = projectId;
  if (userId) match.assignees = userId;
  if (req.user.role !== 'admin') match.assignees = req.user._id;

  const tasks = await Task.find(match)
    .populate('project', 'name')
    .populate('assignees', 'firstName lastName email avatar')
    .sort({ dueDate: 1 });
  res.json({ success: true, data: { tasks, count: tasks.length } });
}));

module.exports = router; 