const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireProjectAccess, requireProjectPermission } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
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

const validateColumn = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Column name is required and must be less than 50 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
];

// @route   GET /api/projects
// @desc    Get user's projects
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { includeArchived = false, search } = req.query;
  
  let projects;
  
  if (search) {
    // Search projects by name or description
    const searchQuery = {
      $text: { $search: search },
      isArchived: includeArchived === 'true'
    };
    
    // Add user access filter
    if (req.user.role !== 'admin') {
      searchQuery.$or = [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ];
    }
    
    projects = await Project.find(searchQuery)
      .populate('members.user', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .sort({ score: { $meta: 'textScore' } });
  } else {
    // Get all accessible projects
    if (req.user.role === 'admin') {
      projects = await Project.find({ isArchived: includeArchived === 'true' })
        .populate('members.user', 'firstName lastName email avatar')
        .populate('createdBy', 'firstName lastName email avatar')
        .sort({ updatedAt: -1 });
    } else {
      projects = await Project.findByUser(req.user._id, includeArchived === 'true');
    }
  }

  res.json({
    success: true,
    data: {
      projects,
      count: projects.length
    }
  });
}));

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Team Lead or Admin)
router.post('/', validateProject, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, description, tags, settings } = req.body;

  // Check if user can create projects
  if (req.user.role === 'member') {
    return res.status(403).json({
      success: false,
      message: 'Members cannot create projects'
    });
  }

  const project = new Project({
    name,
    description,
    tags: tags || [],
    settings: settings || {},
    createdBy: req.user._id
  });

  // Add creator as owner
  await project.addMember(req.user._id, 'owner');

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: {
      project: await project.populate([
        { path: 'members.user', select: 'firstName lastName email avatar' },
        { path: 'createdBy', select: 'firstName lastName email avatar' }
      ])
    }
  });
}));

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', requireProjectAccess, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members.user', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar');

  res.json({
    success: true,
    data: { project }
  });
}));

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', requireProjectAccess, requireProjectPermission('canEditProject'), validateProject, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, description, tags, settings } = req.body;
  const project = req.project;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (tags) project.tags = tags;
  if (settings) project.settings = { ...project.settings, ...settings };

  await project.save();

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: {
      project: await project.populate([
        { path: 'members.user', select: 'firstName lastName email avatar' },
        { path: 'createdBy', select: 'firstName lastName email avatar' }
      ])
    }
  });
}));

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', requireProjectAccess, requireProjectPermission('canDeleteProject'), asyncHandler(async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
}));

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private
router.post('/:id/members', requireProjectAccess, requireProjectPermission('canManageMembers'), [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['owner', 'admin', 'member'])
    .withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { userId, role = 'member' } = req.body;
  const project = req.project;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user is already a member
  const existingMember = project.members.find(m => m.user.toString() === userId);
  if (existingMember) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member of this project'
    });
  }

  await project.addMember(userId, role);

  res.json({
    success: true,
    message: 'Member added successfully',
    data: {
      project: await project.populate('members.user', 'firstName lastName email avatar')
    }
  });
}));

// @route   PUT /api/projects/:id/members/:userId
// @desc    Update member role
// @access  Private
router.put('/:id/members/:userId', requireProjectAccess, requireProjectPermission('canManageMembers'), [
  body('role')
    .isIn(['owner', 'admin', 'member'])
    .withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { role } = req.body;
  const { userId } = req.params;
  const project = req.project;

  await project.updateMemberRole(userId, role);

  res.json({
    success: true,
    message: 'Member role updated successfully',
    data: {
      project: await project.populate('members.user', 'firstName lastName email avatar')
    }
  });
}));

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private
router.delete('/:id/members/:userId', requireProjectAccess, requireProjectPermission('canManageMembers'), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const project = req.project;

  // Prevent removing the project owner
  const member = project.members.find(m => m.user.toString() === userId);
  if (member && member.role === 'owner') {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove project owner'
    });
  }

  await project.removeMember(userId);

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: {
      project: await project.populate('members.user', 'firstName lastName email avatar')
    }
  });
}));

// @route   POST /api/projects/:id/columns
// @desc    Add column to project
// @access  Private
router.post('/:id/columns', requireProjectAccess, requireProjectPermission('canEditProject'), validateColumn, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, color } = req.body;
  const project = req.project;

  await project.addColumn({ name, color });

  res.json({
    success: true,
    message: 'Column added successfully',
    data: { project }
  });
}));

// @route   PUT /api/projects/:id/columns/:columnId
// @desc    Update column
// @access  Private
router.put('/:id/columns/:columnId', requireProjectAccess, requireProjectPermission('canEditProject'), validateColumn, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, color } = req.body;
  const { columnId } = req.params;
  const project = req.project;

  const column = project.columns.id(columnId);
  if (!column) {
    return res.status(404).json({
      success: false,
      message: 'Column not found'
    });
  }

  if (name) column.name = name;
  if (color) column.color = color;

  await project.save();

  res.json({
    success: true,
    message: 'Column updated successfully',
    data: { project }
  });
}));

// @route   DELETE /api/projects/:id/columns/:columnId
// @desc    Delete column
// @access  Private
router.delete('/:id/columns/:columnId', requireProjectAccess, requireProjectPermission('canEditProject'), asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  const project = req.project;

  const column = project.columns.id(columnId);
  if (!column) {
    return res.status(404).json({
      success: false,
      message: 'Column not found'
    });
  }

  if (column.isDefault) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete default columns'
    });
  }

  project.columns = project.columns.filter(c => c._id.toString() !== columnId);
  await project.save();

  res.json({
    success: true,
    message: 'Column deleted successfully',
    data: { project }
  });
}));

// @route   PUT /api/projects/:id/columns/reorder
// @desc    Reorder columns
// @access  Private
router.put('/:id/columns/reorder', requireProjectAccess, requireProjectPermission('canEditProject'), [
  body('columnOrders')
    .isArray()
    .withMessage('Column orders must be an array'),
  body('columnOrders.*.columnId')
    .isMongoId()
    .withMessage('Valid column ID is required'),
  body('columnOrders.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { columnOrders } = req.body;
  const project = req.project;

  // Update column orders
  for (const { columnId, order } of columnOrders) {
    await project.updateColumnOrder(columnId, order);
  }

  res.json({
    success: true,
    message: 'Columns reordered successfully',
    data: { project }
  });
}));

// @route   POST /api/projects/:id/archive
// @desc    Archive project
// @access  Private
router.post('/:id/archive', requireProjectAccess, requireProjectPermission('canDeleteProject'), asyncHandler(async (req, res) => {
  const project = req.project;

  await project.archive();

  res.json({
    success: true,
    message: 'Project archived successfully',
    data: { project }
  });
}));

// @route   POST /api/projects/:id/unarchive
// @desc    Unarchive project
// @access  Private
router.post('/:id/unarchive', requireProjectAccess, requireProjectPermission('canEditProject'), asyncHandler(async (req, res) => {
  const project = req.project;

  await project.unarchive();

  res.json({
    success: true,
    message: 'Project unarchived successfully',
    data: { project }
  });
}));

module.exports = router; 