const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireTaskAccess, requireProjectAccess, requireProjectPermission } = require('../middleware/auth');

const router = express.Router();

// Multer config for attachments
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const fileFilter = (req, file, cb) => {
  // Accept only images, pdf, doc, xls, txt
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Validation middleware
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title is required and must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date'),
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
];

// @route   GET /api/tasks
// @desc    Get tasks (with filters, pagination)
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { projectId, assignee, status, page = 1, limit = 20, column, search } = req.query;
  const query = { isArchived: false };
  if (projectId) query.project = projectId;
  if (assignee) query.assignees = assignee;
  if (status) query.status = status;
  if (column) query.column = column;
  if (search) query.$text = { $search: search };

  // Only return tasks user can access
  if (req.user.role !== 'admin') {
    query.$or = [
      { createdBy: req.user._id },
      { assignees: req.user._id }
    ];
  }

  const tasks = await Task.find(query)
    .populate('assignees', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('comments.author', 'firstName lastName email avatar')
    .populate('comments.mentions', 'firstName lastName email avatar')
    .sort({ order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const count = await Task.countDocuments(query);
  res.json({ success: true, data: { tasks, count } });
}));

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', validateTask, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  const { title, description, project, column, assignees, priority, dueDate, tags } = req.body;
  // Only team leads/admins can create tasks for any project; members only for assigned projects
  const projectDoc = await Project.findById(project);
  if (!projectDoc) return res.status(404).json({ success: false, message: 'Project not found' });
  if (req.user.role === 'member' && !projectDoc.members.some(m => m.user.toString() === req.user._id.toString())) {
    return res.status(403).json({ success: false, message: 'Not a project member' });
  }
  const order = await Task.countDocuments({ project, column });
  const task = new Task({
    title,
    description,
    project,
    column,
    order,
    assignees: assignees || [],
    createdBy: req.user._id,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    tags: tags || []
  });
  await task.save();
  res.status(201).json({ success: true, message: 'Task created', data: { task } });
}));

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', requireTaskAccess, asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignees', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('comments.author', 'firstName lastName email avatar')
    .populate('comments.mentions', 'firstName lastName email avatar');
  res.json({ success: true, data: { task } });
}));

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', requireTaskAccess, validateTask, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  const { title, description, assignees, priority, dueDate, tags, status } = req.body;
  const task = req.task;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignees) task.assignees = assignees;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  if (tags) task.tags = tags;
  if (status) await task.updateStatus(status);
  await task.save();
  res.json({ success: true, message: 'Task updated', data: { task } });
}));

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', requireTaskAccess, asyncHandler(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Task deleted' });
}));

// @route   POST /api/tasks/:id/move
// @desc    Move task to another column (drag-and-drop)
// @access  Private
router.post('/:id/move', requireTaskAccess, asyncHandler(async (req, res) => {
  const { column, order } = req.body;
  const task = req.task;
  if (!column) return res.status(400).json({ success: false, message: 'Column required' });
  await task.moveToColumn(column, order);
  res.json({ success: true, message: 'Task moved', data: { task } });
}));

// @route   POST /api/tasks/:id/attachments
// @desc    Add attachment to task
// @access  Private
router.post('/:id/attachments', requireTaskAccess, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const file = req.file;
  const attachment = {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype,
    uploadedBy: req.user._id
  };
  await req.task.addAttachment(attachment);
  res.json({ success: true, message: 'Attachment added', data: { attachment } });
}));

// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @desc    Remove attachment from task
// @access  Private
router.delete('/:id/attachments/:attachmentId', requireTaskAccess, asyncHandler(async (req, res) => {
  const { attachmentId } = req.params;
  await req.task.removeAttachment(attachmentId);
  res.json({ success: true, message: 'Attachment removed' });
}));

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', requireTaskAccess, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment required'),
  body('mentions').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  const { content, mentions = [], parentComment } = req.body;
  const comment = {
    content,
    author: req.user._id,
    mentions,
    parentComment: parentComment || null
  };
  await req.task.addComment(comment);
  res.status(201).json({ success: true, message: 'Comment added', data: { comment } });
}));

// @route   DELETE /api/tasks/:id/comments/:commentId
// @desc    Remove comment from task
// @access  Private
router.delete('/:id/comments/:commentId', requireTaskAccess, asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  req.task.comments = req.task.comments.filter(c => c._id.toString() !== commentId);
  await req.task.save();
  res.json({ success: true, message: 'Comment removed' });
}));

// @route   POST /api/tasks/:id/tags
// @desc    Add tag to task
// @access  Private
router.post('/:id/tags', requireTaskAccess, [
  body('tag').trim().isLength({ min: 1, max: 20 }).withMessage('Tag required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  const { tag } = req.body;
  if (!req.task.tags.includes(tag)) req.task.tags.push(tag);
  await req.task.save();
  res.json({ success: true, message: 'Tag added', data: { tags: req.task.tags } });
}));

// @route   DELETE /api/tasks/:id/tags/:tag
// @desc    Remove tag from task
// @access  Private
router.delete('/:id/tags/:tag', requireTaskAccess, asyncHandler(async (req, res) => {
  const { tag } = req.params;
  req.task.tags = req.task.tags.filter(t => t !== tag);
  await req.task.save();
  res.json({ success: true, message: 'Tag removed', data: { tags: req.task.tags } });
}));

module.exports = router; 