const express = require('express');
const { body } = require('express-validator');
const {
  getReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
  reorderReferences,
  moveReferenceUp,
  moveReferenceDown,
  getReferencesStats,
  exportReferences
} = require('../controllers/referenceController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const referenceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Reference name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Reference title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('relationship')
    .isIn(['supervisor', 'manager', 'colleague', 'client', 'professor', 'mentor', 'peer', 'other'])
    .withMessage('Relationship must be one of: supervisor, manager, colleague, client, professor, mentor, peer, other'),
  body('relationshipDescription')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Relationship description cannot exceed 200 characters'),
  body('yearsKnown')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years known must be between 0 and 50'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('preferredContactMethod')
    .optional()
    .isIn(['email', 'phone', 'both'])
    .withMessage('Preferred contact method must be one of: email, phone, both'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// All routes are protected
router.use(authenticate);

// @route   GET /api/references
// @desc    Get user references
// @access  Private
router.get('/', getReferences);

// @route   GET /api/references/stats
// @desc    Get references statistics
// @access  Private
router.get('/stats', getReferencesStats);

// @route   GET /api/references/export
// @desc    Export references
// @access  Private
router.get('/export', exportReferences);

// @route   GET /api/references/:id
// @desc    Get single reference
// @access  Private
router.get('/:id', getReferenceById);

// @route   POST /api/references
// @desc    Create new reference
// @access  Private
router.post('/', referenceValidation, createReference);

// @route   PUT /api/references/:id
// @desc    Update reference
// @access  Private
router.put('/:id', referenceValidation, updateReference);

// @route   DELETE /api/references/:id
// @desc    Delete reference
// @access  Private
router.delete('/:id', deleteReference);

// @route   PUT /api/references/reorder
// @desc    Reorder references
// @access  Private
router.put('/reorder', [
  body('referenceIds')
    .isArray()
    .withMessage('Reference IDs must be an array')
    .notEmpty()
    .withMessage('Reference IDs array cannot be empty')
], reorderReferences);

// @route   PUT /api/references/:id/move-up
// @desc    Move reference up
// @access  Private
router.put('/:id/move-up', moveReferenceUp);

// @route   PUT /api/references/:id/move-down
// @desc    Move reference down
// @access  Private
router.put('/:id/move-down', moveReferenceDown);

module.exports = router;
