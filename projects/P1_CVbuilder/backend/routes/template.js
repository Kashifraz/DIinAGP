const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getTemplates,
  getTemplateById,
  getFullTemplate,
  getTemplatesByCategory,
  getTemplateCategories,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus
} = require('../controllers/templateController');

// Validation rules
const templateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Template name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Template name must be between 2 and 50 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Template description is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Template description must be between 10 and 200 characters'),
  
  body('category')
    .isIn(['professional', 'creative', 'modern', 'classic', 'minimal'])
    .withMessage('Invalid template category'),
  
  body('preview')
    .trim()
    .notEmpty()
    .withMessage('Template preview is required'),
  
  body('html')
    .trim()
    .notEmpty()
    .withMessage('Template HTML is required'),
  
  body('css')
    .trim()
    .notEmpty()
    .withMessage('Template CSS is required'),
  
  body('sections')
    .isArray({ min: 1 })
    .withMessage('Template must have at least one section'),
  
  body('sections.*.name')
    .trim()
    .notEmpty()
    .withMessage('Section name is required'),
  
  body('sections.*.order')
    .isInt({ min: 0 })
    .withMessage('Section order must be a non-negative integer'),
  
  body('colorSchemes')
    .isArray({ min: 1 })
    .withMessage('Template must have at least one color scheme'),
  
  body('colorSchemes.*.name')
    .trim()
    .notEmpty()
    .withMessage('Color scheme name is required'),
  
  body('colorSchemes.*.primary')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),
  
  body('colorSchemes.*.secondary')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Secondary color must be a valid hex color'),
  
  body('colorSchemes.*.accent')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Accent color must be a valid hex color'),
  
  body('colorSchemes.*.text')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Text color must be a valid hex color'),
  
  body('colorSchemes.*.background')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Background color must be a valid hex color'),
  
  body('fonts')
    .isArray({ min: 1 })
    .withMessage('Template must have at least one font'),
  
  body('fonts.*.name')
    .trim()
    .notEmpty()
    .withMessage('Font name is required'),
  
  body('fonts.*.family')
    .trim()
    .notEmpty()
    .withMessage('Font family is required'),
  
  body('fonts.*.weights')
    .isArray({ min: 1 })
    .withMessage('Font must have at least one weight')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid template ID')
];

const categoryValidation = [
  param('category')
    .isIn(['professional', 'creative', 'modern', 'classic', 'minimal'])
    .withMessage('Invalid template category')
];

const queryValidation = [
  query('category')
    .optional()
    .isIn(['professional', 'creative', 'modern', 'classic', 'minimal'])
    .withMessage('Invalid category filter'),
  
  query('active')
    .optional()
    .isBoolean()
    .withMessage('Active filter must be a boolean')
];

// Public routes
router.get('/', queryValidation, getTemplates);
router.get('/categories', getTemplateCategories);
router.get('/category/:category', categoryValidation, getTemplatesByCategory);
router.get('/:id', idValidation, getTemplateById);
router.get('/:id/full', idValidation, getFullTemplate);

// Admin routes (require authentication and admin role)
router.post('/', authenticate, authorize(['admin']), templateValidation, createTemplate);
router.put('/:id', authenticate, authorize(['admin']), idValidation, templateValidation, updateTemplate);
router.delete('/:id', authenticate, authorize(['admin']), idValidation, deleteTemplate);
router.patch('/:id/toggle', authenticate, authorize(['admin']), idValidation, toggleTemplateStatus);

module.exports = router;
