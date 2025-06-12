const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getCVs,
  getCVById,
  createCV,
  updateCV,
  deleteCV,
  reorderSections,
  toggleSectionVisibility,
  updateSectionData,
  generateShareToken,
  revokeSharing,
  getCVByShareToken
} = require('../controllers/cvController');
const { authenticate } = require('../middleware/auth');

// Validation middleware
const validateCV = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('CV name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('CV name must be between 1 and 100 characters'),
  body('templateId')
    .isMongoId()
    .withMessage('Valid template ID is required'),
  body('sections')
    .optional()
    .isArray()
    .withMessage('Sections must be an array'),
  body('sections.*.name')
    .optional()
    .isIn(['Profile', 'Experience', 'Education', 'Skills', 'Languages', 'Projects', 'Publications', 'Awards', 'References'])
    .withMessage('Invalid section name'),
  body('sections.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Section order must be a non-negative integer'),
  body('sections.*.visible')
    .optional()
    .isBoolean()
    .withMessage('Section visibility must be a boolean')
];

const validateSectionData = [
  body('data')
    .isObject()
    .withMessage('Section data must be an object')
];

const validateSectionOrders = [
  body('sectionOrders')
    .isArray()
    .withMessage('Section orders must be an array')
    .custom((value) => {
      const validSections = ['Profile', 'Experience', 'Education', 'Skills', 'Languages', 'Projects', 'Publications', 'Awards', 'References'];
      return value.every(section => validSections.includes(section));
    })
    .withMessage('All section names must be valid')
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Valid CV ID is required')
];

const validateSectionName = [
  param('sectionName')
    .isIn(['Profile', 'Experience', 'Education', 'Skills', 'Languages', 'Projects', 'Publications', 'Awards', 'References'])
    .withMessage('Invalid section name')
];

const validateShareToken = [
  param('token')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid share token format')
];

// Public routes (no authentication required)
router.get('/shared/:token', validateShareToken, getCVByShareToken);

// Protected routes (authentication required)
router.use(authenticate);

// Get all CVs for authenticated user
router.get('/', 
  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  getCVs
);

// Get a single CV by ID
router.get('/:id', validateId, getCVById);

// Create a new CV
router.post('/', validateCV, createCV);

// Update CV
router.put('/:id', validateId, updateCV);

// Delete CV
router.delete('/:id', validateId, deleteCV);

// Reorder sections
router.patch('/:id/sections/reorder', 
  validateId,
  validateSectionOrders,
  reorderSections
);

// Toggle section visibility
router.patch('/:id/sections/:sectionName/visibility', 
  validateId,
  validateSectionName,
  toggleSectionVisibility
);

// Update section data
router.patch('/:id/sections/:sectionName/data', 
  validateId,
  validateSectionName,
  validateSectionData,
  updateSectionData
);

// Generate share token
router.post('/:id/share', validateId, generateShareToken);

// Revoke sharing
router.delete('/:id/share', validateId, revokeSharing);

module.exports = router;
