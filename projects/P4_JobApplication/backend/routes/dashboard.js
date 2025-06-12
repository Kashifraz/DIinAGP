const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployeeStats,
  getEmployerStats,
  getAdminStats
} = require('../controllers/dashboardController');

// All routes are protected
router.use(protect);

// Employee dashboard
router.get('/employee/stats', authorize('employee'), getEmployeeStats);

// Employer dashboard
router.get('/employer/stats', authorize('employer'), getEmployerStats);

// Admin dashboard
router.get('/admin/stats', authorize('admin'), getAdminStats);

module.exports = router;

