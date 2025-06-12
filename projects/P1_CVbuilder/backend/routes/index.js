const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const educationRoutes = require('./education');
const experienceRoutes = require('./experience');
const skillRoutes = require('./skill');
const languageRoutes = require('./language');
const publicationRoutes = require('./publication');
const projectRoutes = require('./project');
const awardRoutes = require('./award');
const referenceRoutes = require('./reference');
const templateRoutes = require('./template');
const cvRoutes = require('./cv');
const pdfRoutes = require('./pdf');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CV Builder API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CV Builder API',
    version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          users: '/api/users',
          profiles: '/api/profiles',
          education: '/api/education',
          experience: '/api/experience',
          skills: '/api/skills',
          languages: '/api/languages',
          publications: '/api/publications',
          projects: '/api/projects',
          awards: '/api/awards',
          references: '/api/references',
          cvs: '/api/cvs',
          templates: '/api/templates',
          pdf: '/api/pdf'
        },
    documentation: 'https://github.com/your-repo/cv-builder-api'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/education', educationRoutes);
router.use('/experience', experienceRoutes);
router.use('/skills', skillRoutes);
router.use('/languages', languageRoutes);
router.use('/publications', publicationRoutes);
router.use('/projects', projectRoutes);
router.use('/awards', awardRoutes);
router.use('/references', referenceRoutes);
router.use('/templates', templateRoutes);
router.use('/cvs', cvRoutes);
router.use('/pdf', pdfRoutes);

module.exports = router;
