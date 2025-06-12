const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const emailService = require('../utils/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF and Word documents are allowed'), false);
  }

  if (file.size > maxSize) {
    return cb(new Error('File size must be less than 5MB'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// @desc    Submit application for a job
// @route   POST /api/applications
// @access  Private (Employee)
exports.submitApplication = [
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    const { job, coverLetter, expectedSalary, availabilityDate, source, notes } = req.body;
    const employeeId = req.user.id;

    // Manual validation since multer processes form data
    if (!job) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
        errors: { job: 'Job ID is required' }
      });
    }

    if (!coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter is required',
        errors: { coverLetter: 'Cover letter is required' }
      });
    }

    if (!coverLetter || coverLetter.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter must be at least 50 characters long',
        errors: { coverLetter: 'Cover letter must be at least 50 characters long' }
      });
    }

    if (coverLetter.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter cannot exceed 2000 characters',
        errors: { coverLetter: 'Cover letter cannot exceed 2000 characters' }
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required',
        errors: { resume: 'Resume file is required' }
      });
    }

    // Check if job exists and is active
    const jobPosting = await JobPosting.findById(job);
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    console.log('Job posting found:', {
      id: jobPosting._id,
      title: jobPosting.title,
      employer: jobPosting.employer,
      status: jobPosting.status
    });

    if (jobPosting.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer accepting applications'
      });
    }

    // Check if application deadline has passed
    if (jobPosting.applicationDeadline && new Date() > jobPosting.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user already applied for this job
    const existingApplication = await Application.findOne({
      job: job,
      employee: employeeId,
      isActive: true
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const applicationData = {
      job: job,
      employee: employeeId,
      employer: jobPosting.employer,
      coverLetter: coverLetter,
      resume: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : undefined,
      availabilityDate: availabilityDate ? new Date(availabilityDate) : undefined,
      source: source || 'direct',
      notes: notes
    };

    console.log('Creating application with data:', {
      job: applicationData.job,
      employee: applicationData.employee,
      employer: applicationData.employer,
      coverLetter: applicationData.coverLetter ? 'Present' : 'Missing',
      resume: applicationData.resume ? 'Present' : 'Missing'
    });

    const application = await Application.create(applicationData);

    // Populate the application with related data
    await application.populate([
      { path: 'job', select: 'title company location status' },
      { path: 'employer', select: 'profile.firstName profile.lastName profile.organization verificationBadge' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  })
];

// @desc    Get applications for current employee
// @route   GET /api/applications/employee
// @access  Private (Employee)
exports.getEmployeeApplications = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const { status, page = 1, limit = 10, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

  const query = { employee: employeeId, isActive: true };
  if (status) query.status = status;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const applications = await Application.find(query)
    .populate('job', 'title company location status applicationDeadline')
    .populate('employer', 'profile.firstName profile.lastName profile.organization verificationBadge')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Application.countDocuments(query);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: applications
  });
});

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer/Admin)
exports.getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { status, page = 1, limit = 10, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    // Verify job ownership (for employers) or admin access
    const jobPosting = await JobPosting.findById(jobId);
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if user can view applications for this job
    const canView = 
      req.user.role === 'admin' || 
      jobPosting.employer?.toString() === req.user.id;

    if (!canView) {
      console.log('Access denied:', {
        userRole: req.user.role,
        userId: req.user.id,
        jobEmployer: jobPosting.employer?.toString(),
        jobTitle: jobPosting.title
      });
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for your own job postings'
      });
    }

  const query = { job: jobId, isActive: true };
  if (status) query.status = status;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const applications = await Application.find(query)
    .populate('employee', 'profile.firstName profile.lastName profile.email profile.phone profile.professionalCategory verificationBadge')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Application.countDocuments(query);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: applications
  });
});

// @desc    Get applications for current employer
// @route   GET /api/applications/employer
// @access  Private (Employer)
exports.getEmployerApplications = asyncHandler(async (req, res) => {
  const employerId = req.user.id;
  const { status, page = 1, limit = 10, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

  const query = { employer: employerId, isActive: true };
  if (status) query.status = status;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const applications = await Application.find(query)
    .populate('job', 'title company location status')
    .populate('employee', 'profile.firstName profile.lastName profile.email profile.phone verificationBadge')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Application.countDocuments(query);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: applications
  });
});

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'title company location description requirements status')
    .populate('employee', 'profile.firstName profile.lastName profile.email profile.phone profile.professionalCategory verificationBadge');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check access permissions - handle both ObjectId and populated object
  const employerId = typeof application.employer === 'object' && application.employer._id 
    ? application.employer._id.toString() 
    : application.employer.toString();
  
  const employeeId = typeof application.employee === 'object' && application.employee._id
    ? application.employee._id.toString()
    : application.employee.toString();

  const canAccess = 
    req.user.role === 'admin' ||
    employeeId === req.user.id ||
    employerId === req.user.id;

  if (!canAccess) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this application'
    });
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer/Admin)
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check permissions
  const canUpdate = 
    req.user.role === 'admin' ||
    application.employer.toString() === req.user.id;

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this application'
    });
  }

  // Update application
  application.status = status;
  if (status === 'under_review' || status === 'shortlisted') {
    application.reviewedAt = new Date();
  }
  if (notes) {
    application.notes = notes;
  }

  await application.save();

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: application
  });
});

// @desc    Respond to application
// @route   POST /api/applications/:id/respond
// @access  Private (Employer/Admin)
exports.respondToApplication = asyncHandler(async (req, res) => {
  const { type, message, interviewDetails } = req.body;
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check permissions
  const canRespond = 
    req.user.role === 'admin' ||
    application.employer.toString() === req.user.id;

  if (!canRespond) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to respond to this application'
    });
  }

  // Check if application can be responded to
  if (!application.canBeRespondedTo()) {
    return res.status(400).json({
      success: false,
      message: 'This application cannot be responded to in its current status'
    });
  }

  // Update application with response
  application.employerResponse = {
    type: type,
    message: message,
    interviewDetails: interviewDetails,
    respondedAt: new Date()
  };

  // Update status based on response type
  if (type === 'acceptance') {
    application.status = 'accepted';
  } else if (type === 'rejection') {
    application.status = 'rejected';
  } else if (type === 'interview_invitation') {
    application.status = 'interview_scheduled';
  }

  application.respondedAt = new Date();

  await application.save();

  // Send email notification to employee
  try {
    // Populate employee and job details for email
    const populatedApplication = await Application.findById(application._id)
      .populate('employee', 'email profile.firstName profile.lastName')
      .populate('job', 'title company.name')
      .populate('employer', 'profile.organization');

    if (populatedApplication.employee && populatedApplication.job) {
      await emailService.sendEmployerResponseEmail({
        employeeEmail: populatedApplication.employee.email,
        employeeName: `${populatedApplication.employee.profile?.firstName || ''} ${populatedApplication.employee.profile?.lastName || ''}`.trim(),
        jobTitle: populatedApplication.job.title,
        companyName: populatedApplication.job.company?.name || populatedApplication.employer?.profile?.organization || 'Company',
        responseType: type,
        message: message,
        interviewDetails: interviewDetails
      });
    }
  } catch (emailError) {
    console.error('Error sending response email:', emailError);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    message: 'Response sent successfully',
    data: application
  });
});

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Employee)
exports.withdrawApplication = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check if user owns this application
  if (application.employee.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only withdraw your own applications'
    });
  }

  // Check if application can be withdrawn
  if (!application.canBeWithdrawn()) {
    return res.status(400).json({
      success: false,
      message: 'This application cannot be withdrawn in its current status'
    });
  }

  // Update application status
  application.status = 'withdrawn';
  application.isActive = false;

  await application.save();

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully'
  });
});

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private
exports.getApplicationStats = asyncHandler(async (req, res) => {
  const { employer, employee, job, status, dateFrom, dateTo } = req.query;
  
  const filters = {};
  if (employer) filters.employer = employer;
  if (employee) filters.employee = employee;
  if (job) filters.job = job;
  if (status) filters.status = status;
  if (dateFrom) filters.dateFrom = new Date(dateFrom);
  if (dateTo) filters.dateTo = new Date(dateTo);

  const stats = await Application.getApplicationStats(filters);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalApplications: 0,
      statusBreakdown: []
    }
  });
});

// @desc    Download resume file
// @route   GET /api/applications/:id/resume
// @access  Private
exports.downloadResume = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check access permissions - handle both ObjectId and populated object
  const employerId = typeof application.employer === 'object' && application.employer._id 
    ? application.employer._id.toString() 
    : application.employer.toString();
  
  const employeeId = typeof application.employee === 'object' && application.employee._id
    ? application.employee._id.toString()
    : application.employee.toString();

  const canAccess = 
    req.user.role === 'admin' ||
    employeeId === req.user.id ||
    employerId === req.user.id;

  if (!canAccess) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to download this resume'
    });
  }

  const filePath = application.resume.path;
  
  try {
    await fs.access(filePath);
    res.download(filePath, application.resume.originalName);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Resume file not found'
    });
  }
});
