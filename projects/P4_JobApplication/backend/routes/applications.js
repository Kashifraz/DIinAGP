const express = require('express');
const {
  submitApplication,
  getEmployeeApplications,
  getJobApplications,
  getEmployerApplications,
  getApplication,
  updateApplicationStatus,
  respondToApplication,
  withdrawApplication,
  getApplicationStats,
  downloadResume
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Employee routes
router.post('/', 
  authorize('employee'),
  submitApplication[0],  // multer middleware
  submitApplication[1]   // handler
);

router.get('/employee', 
  authorize('employee'), 
  getEmployeeApplications
);

router.delete('/:id', 
  authorize('employee'), 
  withdrawApplication
);

// Employer routes
router.get('/employer', 
  authorize('employer', 'admin'), 
  getEmployerApplications
);

router.get('/job/:jobId', 
  authorize('employer', 'admin'), 
  getJobApplications
);

router.patch('/:id/status', 
  authorize('employer', 'admin'), 
  validate(schemas.applicationStatusUpdate), 
  updateApplicationStatus
);

router.post('/:id/respond', 
  authorize('employer', 'admin'), 
  validate(schemas.applicationResponse), 
  respondToApplication
);

// General routes (accessible by all authenticated users)
// MUST be defined BEFORE /:id route to avoid route conflicts
router.get('/stats', getApplicationStats);

router.get('/:id/resume', downloadResume);

router.get('/:id', getApplication);

module.exports = router;
