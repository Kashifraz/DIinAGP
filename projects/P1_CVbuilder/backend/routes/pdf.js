const express = require('express');
const router = express.Router();
const { generatePDF, debugHTML } = require('../controllers/pdfController');
const { authenticate } = require('../middleware/auth');

// Generate PDF from CV data
router.post('/generate', authenticate, generatePDF);

// Debug HTML generation
router.post('/debug', authenticate, debugHTML);

module.exports = router;
