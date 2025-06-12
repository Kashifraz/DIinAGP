const express = require('express');
const { body } = require('express-validator');
const {
  getSkills,
  getSkillsByCategory,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
  moveSkillUp,
  moveSkillDown,
  getSkillsStats,
  toggleSkillHighlight,
  getHighlightedSkills,
  exportSkills,
  bulkUpdateSkills,
} = require('../controllers/skillController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules for creating/updating skills
const skillValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  body('category')
    .isIn([
      'technical', 'programming', 'framework', 'database', 'cloud', 'devops',
      'design', 'language', 'soft', 'certification', 'tool', 'other'
    ])
    .withMessage('Invalid skill category'),
  body('proficiency')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid proficiency level'),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('certifications.*.name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Certification name cannot exceed 200 characters'),
  body('certifications.*.issuer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Issuer name cannot exceed 100 characters'),
  body('certifications.*.dateObtained')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date obtained must be a valid date'),
  body('certifications.*.expiryDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Expiry date must be a valid date'),
  body('certifications.*.credentialId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Credential ID cannot exceed 100 characters'),
  body('certifications.*.credentialUrl')
    .optional()
    .isURL()
    .withMessage('Credential URL must be a valid URL'),
  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),
  body('projects.*.name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Project name cannot exceed 200 characters'),
  body('projects.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Project description cannot exceed 500 characters'),
  body('projects.*.url')
    .optional()
    .isURL()
    .withMessage('Project URL must be a valid URL'),
  body('projects.*.technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array'),
  body('projects.*.technologies.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Technology name cannot exceed 50 characters'),
  body('isHighlighted')
    .optional()
    .isBoolean()
    .withMessage('isHighlighted must be a boolean'),
  handleValidationErrors,
];

// Validation for reordering
const reorderValidation = [
  body('skillIds')
    .isArray({ min: 1 })
    .withMessage('skillIds must be a non-empty array'),
  body('skillIds.*')
    .isMongoId()
    .withMessage('Each skill ID must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

// Validation for bulk updates
const bulkUpdateValidation = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates must be a non-empty array'),
  body('updates.*.id')
    .isMongoId()
    .withMessage('Each update must have a valid skill ID'),
  handleValidationErrors,
];

// Routes
router.get('/', getSkills);
router.get('/category/:category', getSkillsByCategory);
router.get('/highlighted', getHighlightedSkills);
router.get('/stats', getSkillsStats);
router.get('/export', exportSkills);
router.get('/:id', getSkillById);
router.post('/', skillValidation, createSkill);
router.put('/:id', skillValidation, updateSkill);
router.put('/:id/highlight', toggleSkillHighlight);
router.put('/reorder', reorderValidation, reorderSkills);
router.put('/:id/move-up', moveSkillUp);
router.put('/:id/move-down', moveSkillDown);
router.put('/bulk-update', bulkUpdateValidation, bulkUpdateSkills);
router.delete('/:id', deleteSkill);

module.exports = router;
