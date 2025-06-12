const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  getProfileCompletion
} = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const updateProfileValidation = [
  body('fullName')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        throw new Error('Full name must be at least 2 characters');
      }
      if (trimmed.length > 50) {
        throw new Error('Full name cannot exceed 50 characters');
      }
      return true;
    }),
  body('professionalTitle')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (trimmed.length > 100) {
        throw new Error('Professional title cannot exceed 100 characters');
      }
      return true;
    }),
  body('phone')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (!/^[+]?[1-9]\d{0,15}$/.test(trimmed)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  body('location')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (trimmed.length > 100) {
        throw new Error('Location cannot exceed 100 characters');
      }
      return true;
    }),
  body('bio')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (trimmed.length > 1000) {
        throw new Error('Bio cannot exceed 1000 characters');
      }
      return true;
    }),
  body('socialLinks.linkedin')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(trimmed)) {
        throw new Error('Please provide a valid LinkedIn URL');
      }
      return true;
    }),
  body('socialLinks.github')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (!/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/.test(trimmed)) {
        throw new Error('Please provide a valid GitHub URL');
      }
      return true;
    }),
  body('socialLinks.portfolio')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Skip validation for empty values
      }
      const trimmed = value.trim();
      if (!/^https?:\/\/.+/.test(trimmed)) {
        throw new Error('Please provide a valid portfolio URL');
      }
      return true;
    }),
  handleValidationErrors
];

// Routes
router.get('/me', getProfile);
router.put('/me', updateProfileValidation, updateProfile);
router.post('/me/photo', handleUpload, uploadPhoto);
router.delete('/me/photo', deletePhoto);
router.get('/me/completion', getProfileCompletion);

module.exports = router;
