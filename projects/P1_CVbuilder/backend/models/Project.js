const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Project type is required'],
    enum: {
      values: ['personal', 'academic', 'professional', 'open_source', 'freelance', 'research', 'other'],
      message: 'Type must be one of: personal, academic, professional, open_source, freelance, research, other'
    }
  },
  status: {
    type: String,
    required: [true, 'Project status is required'],
    enum: {
      values: ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'],
      message: 'Status must be one of: planning, in_progress, completed, on_hold, cancelled'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot exceed 50 characters']
  }],
  teamMembers: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Team member name cannot exceed 100 characters']
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      maxlength: [100, 'Email cannot exceed 100 characters']
    }
  }],
  url: {
    type: String,
    trim: true,
    maxlength: [500, 'URL cannot exceed 500 characters']
  },
  repository: {
    type: String,
    trim: true,
    maxlength: [500, 'Repository URL cannot exceed 500 characters']
  },
  achievements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ user: 1, order: 1 });
projectSchema.index({ user: 1, isActive: 1 });
projectSchema.index({ user: 1, type: 1 });
projectSchema.index({ user: 1, status: 1 });
projectSchema.index({ user: 1, startDate: -1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;
  
  const endDate = this.endDate || new Date();
  const diffTime = Math.abs(endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
  }
});

// Virtual for formatted date range
projectSchema.virtual('dateRange').get(function() {
  if (!this.startDate) return '';
  
  const start = this.startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
  
  if (!this.endDate) {
    return `${start} - Present`;
  }
  
  const end = this.endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
  
  return `${start} - ${end}`;
});

// Pre-save middleware to set order
projectSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.order = count;
  }
  next();
});

// Static method to reorder projects
projectSchema.statics.reorderProjects = async function(userId, projectIds) {
  const updatePromises = projectIds.map((projectId, index) => 
    this.updateOne(
      { _id: projectId, user: userId },
      { order: index }
    )
  );
  await Promise.all(updatePromises);
};

// Static method to get user projects
projectSchema.statics.getUserProjects = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ order: 1, startDate: -1 });
};

module.exports = mongoose.model('Project', projectSchema);
