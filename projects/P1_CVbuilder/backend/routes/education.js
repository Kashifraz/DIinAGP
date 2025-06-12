const express = require('express');
const { body, param } = require('express-validator');
const {
  getEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation,
  moveEducationUp,
  moveEducationDown,
  getEducationStats,
  exportEducation
} = require('../controllers/educationController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createEducationValidation = [
  body('institution')
    .trim()
    .notEmpty()
    .withMessage('Institution name is required')
    .isLength({ max: 200 })
    .withMessage('Institution name cannot exceed 200 characters'),
  body('degree')
    .trim()
    .notEmpty()
    .withMessage('Degree is required')
    .isLength({ max: 100 })
    .withMessage('Degree cannot exceed 100 characters'),
  body('fieldOfStudy')
    .trim()
    .notEmpty()
    .withMessage('Field of study is required')
    .isLength({ max: 100 })
    .withMessage('Field of study cannot exceed 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
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
    .withMessage('isCurrent must be a boolean'),
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4 })
    .withMessage('GPA must be between 0 and 4.0')
    .custom((value) => {
      if (value !== null && value !== undefined) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
          throw new Error('GPA must have at most 2 decimal places');
        }
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  handleValidationErrors
];

const updateEducationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid education ID'),
  body('institution')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Institution name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Institution name cannot exceed 200 characters'),
  body('degree')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Degree cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Degree cannot exceed 100 characters'),
  body('fieldOfStudy')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Field of study cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Field of study cannot exceed 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
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
    .withMessage('isCurrent must be a boolean'),
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4 })
    .withMessage('GPA must be between 0 and 4.0')
    .custom((value) => {
      if (value !== null && value !== undefined) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
          throw new Error('GPA must have at most 2 decimal places');
        }
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  handleValidationErrors
];

const educationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid education ID'),
  handleValidationErrors
];

const reorderValidation = [
  body('educationIds')
    .isArray({ min: 1 })
    .withMessage('Education IDs array is required and must not be empty')
    .custom((value) => {
      if (!value.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('All education IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
  handleValidationErrors
];

// Routes
router.get('/', getEducation);
router.get('/stats', getEducationStats);
router.get('/export', exportEducation);
router.get('/:id', educationIdValidation, getEducationById);
router.post('/', createEducationValidation, createEducation);
router.put('/:id', updateEducationValidation, updateEducation);
router.delete('/:id', educationIdValidation, deleteEducation);
router.put('/reorder', reorderValidation, reorderEducation);
router.put('/:id/move-up', educationIdValidation, moveEducationUp);
router.put('/:id/move-down', educationIdValidation, moveEducationDown);

module.exports = router;
