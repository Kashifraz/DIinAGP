const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  // Basic job information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  
  requirements: {
    type: String,
    required: [true, 'Job requirements are required'],
    maxlength: [2000, 'Job requirements cannot exceed 2000 characters']
  },
  
  responsibilities: {
    type: String,
    required: [true, 'Job responsibilities are required'],
    maxlength: [2000, 'Job responsibilities cannot exceed 2000 characters']
  },
  
  // Job details
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'mid'
  },
  
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    }
  },
  
  // Category and skills
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Job category is required']
  },
  
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  
  // Company information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website URL cannot exceed 200 characters']
    },
    logo: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Company description cannot exceed 1000 characters']
    }
  },
  
  // Job relationship
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer is required'],
    index: true
  },

  // Job status and management
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'paused'],
    default: 'draft'
  },
  
  isRemote: {
    type: Boolean,
    default: false
  },
  
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Application settings
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  
  maxApplications: {
    type: Number,
    min: [1, 'Maximum applications must be at least 1'],
    default: 100
  },
  
  // Metadata
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  
  applicationCount: {
    type: Number,
    default: 0,
    min: [0, 'Application count cannot be negative']
  },
  
  // Timestamps
  postedAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
jobPostingSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });
jobPostingSchema.index({ category: 1, status: 1 });
jobPostingSchema.index({ location: 1, status: 1 });
jobPostingSchema.index({ employmentType: 1, status: 1 });
jobPostingSchema.index({ experienceLevel: 1, status: 1 });
jobPostingSchema.index({ employer: 1, status: 1 });
jobPostingSchema.index({ postedAt: -1 });
jobPostingSchema.index({ expiresAt: 1 });

// Virtual for checking if job is expired
jobPostingSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if job is accepting applications
jobPostingSchema.virtual('isAcceptingApplications').get(function() {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  if (this.applicationDeadline && this.applicationDeadline < new Date()) return false;
  if (this.applicationCount >= this.maxApplications) return false;
  return true;
});

// Pre-save middleware to update updatedAt
jobPostingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get active jobs
jobPostingSchema.statics.getActiveJobs = function() {
  return this.find({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

// Instance method to increment views
jobPostingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment application count
jobPostingSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

module.exports = mongoose.model('JobPosting', jobPostingSchema);

