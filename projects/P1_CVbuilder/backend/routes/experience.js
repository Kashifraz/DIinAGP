const express = require('express');
const { body, param } = require('express-validator');
const {
  getExperience,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperience,
  moveExperienceUp,
  moveExperienceDown,
  getExperienceStats,
  exportExperience
} = require('../controllers/experienceController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createExperienceValidation = [
  body('company')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('position')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Position title must be between 1 and 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Start date cannot be in the future');
      }
      return true;
    }),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('isCurrent')
    .isBoolean()
    .withMessage('isCurrent must be a boolean value'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('achievements.*')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Each achievement cannot exceed 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each skill cannot exceed 50 characters'),
  body('employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'consulting'])
    .withMessage('Invalid employment type'),
  handleValidationErrors
];

const updateExperienceValidation = [
  param('id').isMongoId().withMessage('Invalid experience ID'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Position title must be between 1 and 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Start date cannot be in the future');
      }
      return true;
    }),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('isCurrent')
    .optional()
    .isBoolean()
    .withMessage('isCurrent must be a boolean value'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('achievements.*')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Each achievement cannot exceed 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each skill cannot exceed 50 characters'),
  body('employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'consulting'])
    .withMessage('Invalid employment type'),
  handleValidationErrors
];

const reorderValidation = [
  body('experienceIds')
    .isArray({ min: 1 })
    .withMessage('Experience IDs array is required and must not be empty'),
  body('experienceIds.*')
    .isMongoId()
    .withMessage('Each experience ID must be valid'),
  handleValidationErrors
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid experience ID'),
  handleValidationErrors
];

// Routes
router.get('/', getExperience);
router.get('/stats', getExperienceStats);
router.get('/export', exportExperience);
router.get('/:id', idValidation, getExperienceById);
router.post('/', createExperienceValidation, createExperience);
router.put('/:id', updateExperienceValidation, updateExperience);
router.delete('/:id', idValidation, deleteExperience);
router.put('/reorder', reorderValidation, reorderExperience);
router.put('/:id/move-up', idValidation, moveExperienceUp);
router.put('/:id/move-down', idValidation, moveExperienceDown);

module.exports = router;
