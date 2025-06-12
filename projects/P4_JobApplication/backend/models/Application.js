const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Core relationships
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: [true, 'Job posting is required'],
    index: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
    index: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer is required'],
    index: true
  },

  // Application details
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    filename: {
      type: String,
      required: [true, 'Resume filename is required']
    },
    originalName: {
      type: String,
      required: [true, 'Resume original name is required']
    },
    path: {
      type: String,
      required: [true, 'Resume path is required']
    },
    size: {
      type: Number,
      required: [true, 'Resume size is required'],
      min: [1, 'Resume size must be greater than 0']
    },
    mimeType: {
      type: String,
      required: [true, 'Resume MIME type is required']
    }
  },

  // Application status and tracking
  status: {
    type: String,
    enum: {
      values: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn'],
      message: 'Status must be one of: submitted, under_review, shortlisted, interview_scheduled, accepted, rejected, withdrawn'
    },
    default: 'submitted',
    index: true
  },

  // Application timeline
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  },

  // Employer response
  employerResponse: {
    type: {
      type: String,
      enum: ['acceptance', 'rejection', 'interview_invitation', 'additional_info_requested'],
      default: null
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response message cannot exceed 1000 characters']
    },
    interviewDetails: {
      scheduledDate: Date,
      location: String,
      meetingLink: String,
      notes: String
    },
    respondedAt: {
      type: Date
    }
  },

  // Application metadata
  applicationNumber: {
    type: String,
    unique: true,
    required: false // Will be generated in pre-save middleware
  },
  source: {
    type: String,
    enum: ['direct', 'referral', 'job_board'],
    default: 'direct'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Additional information
  expectedSalary: {
    type: Number,
    min: [0, 'Expected salary cannot be negative']
  },
  availabilityDate: {
    type: Date
  },
  additionalDocuments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ job: 1, employee: 1 }, { unique: true }); // One application per job per employee
applicationSchema.index({ employee: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ status: 1, submittedAt: -1 });

// Virtual fields
applicationSchema.virtual('jobDetails', {
  ref: 'JobPosting',
  localField: 'job',
  foreignField: '_id',
  justOne: true
});

applicationSchema.virtual('employeeDetails', {
  ref: 'User',
  localField: 'employee',
  foreignField: '_id',
  justOne: true
});

applicationSchema.virtual('employerDetails', {
  ref: 'User',
  localField: 'employer',
  foreignField: '_id',
  justOne: true
});

// Instance methods
applicationSchema.methods.canBeWithdrawn = function() {
  return ['submitted', 'under_review', 'shortlisted'].includes(this.status);
};

applicationSchema.methods.canBeRespondedTo = function() {
  return ['submitted', 'under_review', 'shortlisted'].includes(this.status);
};

applicationSchema.methods.getStatusDisplay = function() {
  const statusMap = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  };
  return statusMap[this.status] || this.status;
};

applicationSchema.methods.getResponseTypeDisplay = function() {
  if (!this.employerResponse?.type) return null;
  
  const responseMap = {
    acceptance: 'Job Offer',
    rejection: 'Rejection',
    interview_invitation: 'Interview Invitation',
    additional_info_requested: 'Additional Information Requested'
  };
  return responseMap[this.employerResponse.type] || this.employerResponse.type;
};

// Static methods
applicationSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const query = { employee: employeeId, isActive: true };
  if (options.status) query.status = options.status;
  if (options.isArchived !== undefined) query.isArchived = options.isArchived;
  
  return this.find(query)
    .populate('job', 'title company location status')
    .populate('employer', 'profile.firstName profile.lastName profile.organization')
    .sort({ submittedAt: -1 });
};

applicationSchema.statics.findByJob = function(jobId, options = {}) {
  const query = { job: jobId, isActive: true };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('employee', 'profile.firstName profile.lastName profile.email profile.phone')
    .sort({ submittedAt: -1 });
};

applicationSchema.statics.findByEmployer = function(employerId, options = {}) {
  const query = { employer: employerId, isActive: true };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('job', 'title company location')
    .populate('employee', 'profile.firstName profile.lastName profile.email')
    .sort({ submittedAt: -1 });
};

applicationSchema.statics.getApplicationStats = function(filters = {}) {
  const matchStage = { isActive: true };
  
  if (filters.employer) matchStage.employer = filters.employer;
  if (filters.employee) matchStage.employee = filters.employee;
  if (filters.job) matchStage.job = filters.job;
  if (filters.status) matchStage.status = filters.status;
  if (filters.dateFrom) matchStage.submittedAt = { $gte: filters.dateFrom };
  if (filters.dateTo) {
    matchStage.submittedAt = matchStage.submittedAt || {};
    matchStage.submittedAt.$lte = filters.dateTo;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        applications: { $push: '$$ROOT' }
      }
    },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: '$count' },
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware to generate application number
applicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationNumber) {
    try {
      const count = await this.constructor.countDocuments();
      this.applicationNumber = `APP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if count fails
      this.applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
  }
  next();
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
