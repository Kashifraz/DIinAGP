const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  moveProjectUp,
  moveProjectDown,
  getProjectsStats,
  exportProjects
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('type')
    .optional()
    .isIn(['personal', 'academic', 'professional', 'open_source', 'freelance', 'research', 'other'])
    .withMessage('Type must be one of: personal, academic, professional, open_source, freelance, research, other'),
  body('status')
    .optional()
    .isIn(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'])
    .withMessage('Status must be one of: planning, in_progress, completed, on_hold, cancelled'),
  body('startDate')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return true;
    })
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return true;
    })
    .withMessage('End date must be a valid date'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array'),
  body('technologies.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Technology name cannot exceed 50 characters'),
  body('teamMembers')
    .optional()
    .isArray()
    .withMessage('Team members must be an array'),
  body('teamMembers.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Team member name is required')
    .isLength({ max: 100 })
    .withMessage('Team member name cannot exceed 100 characters'),
  body('teamMembers.*.role')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Role cannot exceed 100 characters'),
  body('teamMembers.*.email')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) && value.length <= 100;
      }
      return true;
    })
    .withMessage('Email must be valid and cannot exceed 100 characters'),
  body('url')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return value.length <= 500;
        } catch {
          return false;
        }
      }
      return true;
    })
    .withMessage('URL must be a valid URL and cannot exceed 500 characters'),
  body('repository')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return value.length <= 500;
        } catch {
          return false;
        }
      }
      return true;
    })
    .withMessage('Repository URL must be a valid URL and cannot exceed 500 characters'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('achievements.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Achievement cannot exceed 200 characters')
];

// All routes are protected
router.use(authenticate);

// @route   GET /api/projects
// @desc    Get user projects
// @access  Private
router.get('/', getProjects);

// @route   GET /api/projects/stats
// @desc    Get projects statistics
// @access  Private
router.get('/stats', getProjectsStats);

// @route   GET /api/projects/export
// @desc    Export projects
// @access  Private
router.get('/export', exportProjects);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', getProjectById);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', projectValidation, createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', projectValidation, updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', deleteProject);

// @route   PUT /api/projects/reorder
// @desc    Reorder projects
// @access  Private
router.put('/reorder', [
  body('projectIds')
    .isArray()
    .withMessage('Project IDs must be an array')
    .notEmpty()
    .withMessage('Project IDs array cannot be empty')
], reorderProjects);

// @route   PUT /api/projects/:id/move-up
// @desc    Move project up
// @access  Private
router.put('/:id/move-up', moveProjectUp);

// @route   PUT /api/projects/:id/move-down
// @desc    Move project down
// @access  Private
router.put('/:id/move-down', moveProjectDown);

module.exports = router;
