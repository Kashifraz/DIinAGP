const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  updateJobStatus
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validate(schemas.jobSearch), getJobs);
router.get('/:id', getJobById);

// Protected routes (authentication required)
router.use(protect);

// Job management routes (employers and admins only)
router.post('/', 
  authorize('employer', 'admin'),
  validate(schemas.jobPosting),
  createJob
);

router.put('/:id',
  validate(schemas.jobUpdate),
  updateJob
);

router.delete('/:id', deleteJob);

router.patch('/:id/status',
  validate(schemas.jobStatusUpdate),
  updateJobStatus
);

// Get current user's jobs (employer and admin only)
router.get('/my/jobs', authorize('employer', 'admin'), getMyJobs);

module.exports = router;
