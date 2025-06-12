const express = require('express');
const { body } = require('express-validator');
const {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  reorderLanguages,
  moveLanguageUp,
  moveLanguageDown,
  getLanguagesStats,
  exportLanguages
} = require('../controllers/languageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const languageValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Language name is required')
    .isLength({ max: 50 })
    .withMessage('Language name cannot exceed 50 characters'),
  body('proficiency')
    .isIn(['beginner', 'intermediate', 'advanced', 'native', 'fluent'])
    .withMessage('Proficiency must be one of: beginner, intermediate, advanced, native, fluent'),
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('certifications.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Certification name is required')
    .isLength({ max: 100 })
    .withMessage('Certification name cannot exceed 100 characters'),
  body('certifications.*.issuer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Issuer name cannot exceed 100 characters'),
  body('certifications.*.dateObtained')
    .optional()
    .isISO8601()
    .withMessage('Date obtained must be a valid date'),
  body('certifications.*.credentialId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Credential ID cannot exceed 50 characters'),
  body('certifications.*.credentialUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Credential URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Credential URL cannot exceed 500 characters')
];

// All routes are protected
router.use(authenticate);

// @route   GET /api/languages
// @desc    Get user languages
// @access  Private
router.get('/', getLanguages);

// @route   GET /api/languages/stats
// @desc    Get languages statistics
// @access  Private
router.get('/stats', getLanguagesStats);

// @route   GET /api/languages/export
// @desc    Export languages
// @access  Private
router.get('/export', exportLanguages);

// @route   GET /api/languages/:id
// @desc    Get single language
// @access  Private
router.get('/:id', getLanguageById);

// @route   POST /api/languages
// @desc    Create new language
// @access  Private
router.post('/', languageValidation, createLanguage);

// @route   PUT /api/languages/:id
// @desc    Update language
// @access  Private
router.put('/:id', languageValidation, updateLanguage);

// @route   DELETE /api/languages/:id
// @desc    Delete language
// @access  Private
router.delete('/:id', deleteLanguage);

// @route   PUT /api/languages/reorder
// @desc    Reorder languages
// @access  Private
router.put('/reorder', [
  body('languageIds')
    .isArray()
    .withMessage('Language IDs must be an array')
    .notEmpty()
    .withMessage('Language IDs array cannot be empty')
], reorderLanguages);

// @route   PUT /api/languages/:id/move-up
// @desc    Move language up
// @access  Private
router.put('/:id/move-up', moveLanguageUp);

// @route   PUT /api/languages/:id/move-down
// @desc    Move language down
// @access  Private
router.put('/:id/move-down', moveLanguageDown);

module.exports = router;
