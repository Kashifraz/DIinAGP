const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      const fieldErrors = {};
      
      // Extract field-specific errors
      error.details.forEach(detail => {
        const field = detail.path.join('.');
        fieldErrors[field] = detail.message;
      });
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: fieldErrors
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration validation
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('employer', 'employee', 'admin').required(),
    profile: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('').optional(),
      organization: Joi.string().min(2).max(100).allow('').optional(),
      professionalCategory: Joi.string().allow('').optional()
    }).required()
  }).custom((value, helpers) => {
    // Custom validation for role-specific fields
    if (value.role === 'employer' && (!value.profile.organization || value.profile.organization.trim() === '')) {
      return helpers.error('any.custom', { message: 'Organization is required for employers' });
    }
    if (value.role === 'employee' && (!value.profile.professionalCategory || value.profile.professionalCategory.trim() === '')) {
      return helpers.error('any.custom', { message: 'Professional category is required for employees' });
    }
    return value;
  }),

  // User login validation
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Job posting validation
  jobPosting: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(20).max(2000).required(),
    category: Joi.string().required(),
    requirements: Joi.object({
      education: Joi.string().required(),
      experience: Joi.string().required(),
      skills: Joi.array().items(Joi.string()).min(1).required()
    }).required(),
    salary: Joi.object({
      min: Joi.number().min(0).required(),
      max: Joi.number().min(Joi.ref('min')).required()
    }).required(),
    location: Joi.string().min(2).max(100).required(),
    dueDate: Joi.date().greater('now').required()
  }),

  // Application validation
  application: Joi.object({
    coverLetter: Joi.string().min(50).max(1000).required(),
    resume: Joi.string().required() // File path will be validated separately
  }),

  // Job posting validation
  jobPosting: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(50).max(5000).required(),
    requirements: Joi.string().min(20).max(2000).required(),
    responsibilities: Joi.string().min(20).max(2000).required(),
    location: Joi.string().min(2).max(100).required(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance').required(),
    experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').required(),
    salaryRange: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').default('USD')
    }).optional(),
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    skills: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    company: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      website: Joi.string().uri().max(200).allow('').optional(),
      logo: Joi.string().uri().allow('').optional(),
      description: Joi.string().max(1000).allow('').optional()
    }).required(),
    isRemote: Joi.boolean().default(false),
    isUrgent: Joi.boolean().default(false),
    applicationDeadline: Joi.date().greater('now').optional(),
    maxApplications: Joi.number().min(1).max(1000).default(100),
    expiresAt: Joi.date().greater('now').optional()
  }).custom((value, helpers) => {
    // Validate salary range
    if (value.salaryRange) {
      if (value.salaryRange.min && value.salaryRange.max && value.salaryRange.min > value.salaryRange.max) {
        return helpers.error('any.custom', { message: 'Minimum salary cannot be greater than maximum salary' });
      }
    }
    return value;
  }),

  // Job update validation (all fields optional)
  jobUpdate: Joi.object({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(50).max(5000).optional(),
    requirements: Joi.string().min(20).max(2000).optional(),
    responsibilities: Joi.string().min(20).max(2000).optional(),
    location: Joi.string().min(2).max(100).optional(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance').optional(),
    experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
    salaryRange: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').optional()
    }).optional(),
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    skills: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    company: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      website: Joi.string().uri().max(200).allow('').optional(),
      logo: Joi.string().uri().allow('').optional(),
      description: Joi.string().max(1000).allow('').optional()
    }).optional(),
    status: Joi.string().valid('draft', 'active', 'closed', 'paused').optional(),
    isRemote: Joi.boolean().optional(),
    isUrgent: Joi.boolean().optional(),
    applicationDeadline: Joi.date().greater('now').optional(),
    maxApplications: Joi.number().min(1).max(1000).optional(),
    expiresAt: Joi.date().greater('now').optional()
  }).custom((value, helpers) => {
    // Validate salary range if provided
    if (value.salaryRange) {
      if (value.salaryRange.min && value.salaryRange.max && value.salaryRange.min > value.salaryRange.max) {
        return helpers.error('any.custom', { message: 'Minimum salary cannot be greater than maximum salary' });
      }
    }
    return value;
  }),

  // Job search/filter validation
  jobSearch: Joi.object({
    search: Joi.string().max(100).optional(),
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    location: Joi.string().max(100).optional(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance').optional(),
    experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
    isRemote: Joi.boolean().optional(),
    minSalary: Joi.number().min(0).optional(),
    maxSalary: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').default('USD'),
    sortBy: Joi.string().valid('postedAt', 'title', 'salary', 'views').default('postedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10)
  }).custom((value, helpers) => {
    // Validate salary range
    if (value.minSalary && value.maxSalary && value.minSalary > value.maxSalary) {
      return helpers.error('any.custom', { message: 'Minimum salary cannot be greater than maximum salary' });
    }
    return value;
  }),

  // Job status update validation
  jobStatusUpdate: Joi.object({
    status: Joi.string().valid('draft', 'active', 'closed', 'paused').required()
  }),

  // Category validation
  category: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(10).max(500),
    parentCategory: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
    level: Joi.number().min(0).max(3).default(0),
    sortOrder: Joi.number().min(0).default(0),
    isActive: Joi.boolean().default(true),
    icon: Joi.string().max(50),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#007bff'),
    metadata: Joi.object({
      keywords: Joi.array().items(Joi.string().max(50)),
      tags: Joi.array().items(Joi.string().max(30))
    })
  }),

  categoryUpdate: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().min(10).max(500),
    parentCategory: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
    level: Joi.number().min(0).max(3),
    sortOrder: Joi.number().min(0),
    isActive: Joi.boolean(),
    icon: Joi.string().max(50),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
    metadata: Joi.object({
      keywords: Joi.array().items(Joi.string().max(50)),
      tags: Joi.array().items(Joi.string().max(30))
    })
  }),

  categoryReorder: Joi.object({
    categories: Joi.array().items(
      Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        sortOrder: Joi.number().min(0).required()
      })
    ).min(1).required()
  }),

  // Application validation
  applicationSubmission: Joi.object({
    job: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    coverLetter: Joi.string().required().min(50).max(2000),
    expectedSalary: Joi.number().min(0).optional(),
    availabilityDate: Joi.date().min('now').optional(),
    source: Joi.string().valid('direct', 'referral', 'job_board').default('direct'),
    notes: Joi.string().max(500).optional()
  }),

  applicationStatusUpdate: Joi.object({
    status: Joi.string().valid('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn').required(),
    notes: Joi.string().max(500).optional()
  }),

  applicationResponse: Joi.object({
    type: Joi.string().valid('acceptance', 'rejection', 'interview_invitation', 'additional_info_requested').required(),
    message: Joi.string().required().min(10).max(1000),
    interviewDetails: Joi.object({
      scheduledDate: Joi.date().min('now').optional(),
      location: Joi.string().max(200).optional(),
      meetingLink: Joi.string().uri().optional(),
      notes: Joi.string().max(500).optional()
    }).optional()
  }),

  applicationQuery: Joi.object({
    status: Joi.string().valid('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn').optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().valid('submittedAt', 'status', 'job.title').default('submittedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Profile management validation
  profileUpdate: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('').optional(),
    organization: Joi.string().min(2).max(100).allow('').optional(),
    professionalCategory: Joi.string().allow('').optional()
  }),

  passwordUpdate: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

module.exports = {
  validate,
  schemas
};
