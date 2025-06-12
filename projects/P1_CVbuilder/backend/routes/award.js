const express = require('express');
const { body } = require('express-validator');
const {
  getAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward,
  reorderAwards,
  moveAwardUp,
  moveAwardDown,
  getAwardsStats,
  exportAwards
} = require('../controllers/awardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const awardValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Award title is required')
    .isLength({ max: 200 })
    .withMessage('Award title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('issuer')
    .trim()
    .notEmpty()
    .withMessage('Award issuer is required')
    .isLength({ max: 200 })
    .withMessage('Issuer name cannot exceed 200 characters'),
  body('category')
    .isIn(['academic', 'professional', 'recognition', 'competition', 'achievement', 'service', 'leadership', 'innovation', 'other'])
    .withMessage('Category must be one of: academic, professional, recognition, competition, achievement, service, leadership, innovation, other'),
  body('dateReceived')
    .isISO8601()
    .withMessage('Date received must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('value.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('value.currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  body('url')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('URL cannot exceed 500 characters'),
  body('certificateUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Certificate URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Certificate URL cannot exceed 500 characters')
];

// All routes are protected
router.use(authenticate);

// @route   GET /api/awards
// @desc    Get user awards
// @access  Private
router.get('/', getAwards);

// @route   GET /api/awards/stats
// @desc    Get awards statistics
// @access  Private
router.get('/stats', getAwardsStats);

// @route   GET /api/awards/export
// @desc    Export awards
// @access  Private
router.get('/export', exportAwards);

// @route   GET /api/awards/:id
// @desc    Get single award
// @access  Private
router.get('/:id', getAwardById);

// @route   POST /api/awards
// @desc    Create new award
// @access  Private
router.post('/', awardValidation, createAward);

// @route   PUT /api/awards/:id
// @desc    Update award
// @access  Private
router.put('/:id', awardValidation, updateAward);

// @route   DELETE /api/awards/:id
// @desc    Delete award
// @access  Private
router.delete('/:id', deleteAward);

// @route   PUT /api/awards/reorder
// @desc    Reorder awards
// @access  Private
router.put('/reorder', [
  body('awardIds')
    .isArray()
    .withMessage('Award IDs must be an array')
    .notEmpty()
    .withMessage('Award IDs array cannot be empty')
], reorderAwards);

// @route   PUT /api/awards/:id/move-up
// @desc    Move award up
// @access  Private
router.put('/:id/move-up', moveAwardUp);

// @route   PUT /api/awards/:id/move-down
// @desc    Move award down
// @access  Private
router.put('/:id/move-down', moveAwardDown);

module.exports = router;
