const express = require('express');
const { body } = require('express-validator');
const {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  reorderPublications,
  movePublicationUp,
  movePublicationDown,
  getPublicationsStats,
  exportPublications
} = require('../controllers/publicationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const publicationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Publication title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('type')
    .isIn(['journal', 'conference', 'book', 'book_chapter', 'patent', 'blog', 'article', 'other'])
    .withMessage('Type must be one of: journal, conference, book, book_chapter, patent, blog, article, other'),
  body('authors')
    .isArray()
    .withMessage('Authors must be an array')
    .notEmpty()
    .withMessage('At least one author is required'),
  body('authors.*.name')
    .trim()
    .notEmpty()
    .withMessage('Author name is required')
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('authors.*.isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
  body('authors.*.affiliation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Affiliation cannot exceed 200 characters'),
  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Publisher name cannot exceed 200 characters'),
  body('publicationDate')
    .isISO8601()
    .withMessage('Publication date must be a valid date'),
  body('doi')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('DOI cannot exceed 100 characters'),
  body('url')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('URL cannot exceed 500 characters'),
  body('abstract')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Abstract cannot exceed 2000 characters'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Keyword cannot exceed 50 characters'),
  body('citationCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Citation count must be a non-negative integer')
];

// All routes are protected
router.use(authenticate);

// @route   GET /api/publications
// @desc    Get user publications
// @access  Private
router.get('/', getPublications);

// @route   GET /api/publications/stats
// @desc    Get publications statistics
// @access  Private
router.get('/stats', getPublicationsStats);

// @route   GET /api/publications/export
// @desc    Export publications
// @access  Private
router.get('/export', exportPublications);

// @route   GET /api/publications/:id
// @desc    Get single publication
// @access  Private
router.get('/:id', getPublicationById);

// @route   POST /api/publications
// @desc    Create new publication
// @access  Private
router.post('/', publicationValidation, createPublication);

// @route   PUT /api/publications/:id
// @desc    Update publication
// @access  Private
router.put('/:id', publicationValidation, updatePublication);

// @route   DELETE /api/publications/:id
// @desc    Delete publication
// @access  Private
router.delete('/:id', deletePublication);

// @route   PUT /api/publications/reorder
// @desc    Reorder publications
// @access  Private
router.put('/reorder', [
  body('publicationIds')
    .isArray()
    .withMessage('Publication IDs must be an array')
    .notEmpty()
    .withMessage('Publication IDs array cannot be empty')
], reorderPublications);

// @route   PUT /api/publications/:id/move-up
// @desc    Move publication up
// @access  Private
router.put('/:id/move-up', movePublicationUp);

// @route   PUT /api/publications/:id/move-down
// @desc    Move publication down
// @access  Private
router.put('/:id/move-down', movePublicationDown);

module.exports = router;
