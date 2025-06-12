const express = require('express');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/search/tasks
// @desc    Full-text search across tasks (title, description, comments)
// @access  Private
router.get('/tasks', asyncHandler(async (req, res) => {
  const { q, projectId, page = 1, limit = 20 } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Search query required' });
  const query = {
    $text: { $search: q },
    isArchived: false
  };
  if (projectId) query.project = projectId;
  if (req.user.role !== 'admin') query.assignees = req.user._id;
  const tasks = await Task.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('assignees', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar');
  const count = await Task.countDocuments(query);
  res.json({ success: true, data: { tasks, count } });
}));

module.exports = router; 