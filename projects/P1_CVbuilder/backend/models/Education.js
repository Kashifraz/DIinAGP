const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [200, 'Institution name cannot exceed 200 characters']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [100, 'Degree cannot exceed 100 characters']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
    maxlength: [100, 'Field of study cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // End date should be after start date
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot exceed 4.0'],
    validate: {
      validator: function(value) {
        // GPA should have at most 2 decimal places
        return !value || /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'GPA must have at most 2 decimal places'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration
educationSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;
  
  const endDate = this.isCurrent ? new Date() : this.endDate;
  if (!endDate) return null;
  
  const start = new Date(this.startDate);
  const end = new Date(endDate);
  
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  
  if (months < 0) {
    const adjustedYears = years - 1;
    const adjustedMonths = 12 + months;
    return `${adjustedYears} year${adjustedYears === 1 ? '' : 's'} ${adjustedMonths} month${adjustedMonths === 1 ? '' : 's'}`;
  }
  
  if (years === 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  
  return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`;
});

// Virtual for formatted date range
educationSchema.virtual('dateRange').get(function() {
  if (!this.startDate) return null;
  
  const startYear = this.startDate.getFullYear();
  const startMonth = this.startDate.toLocaleString('default', { month: 'short' });
  
  if (this.isCurrent) {
    return `${startMonth} ${startYear} - Present`;
  }
  
  if (!this.endDate) return `${startMonth} ${startYear}`;
  
  const endYear = this.endDate.getFullYear();
  const endMonth = this.endDate.toLocaleString('default', { month: 'short' });
  
  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
});

// Indexes for better performance
educationSchema.index({ user: 1, order: 1 });
educationSchema.index({ user: 1, isActive: 1 });

// Pre-save middleware to handle order and validation
educationSchema.pre('save', async function(next) {
  // If this is a new document and no order is specified, set it to the highest order + 1
  if (this.isNew && this.order === 0) {
    const lastEducation = await this.constructor.findOne(
      { user: this.user, isActive: true },
      { order: 1 },
      { sort: { order: -1 } }
    );
    this.order = lastEducation ? lastEducation.order + 1 : 1;
  }
  
  // Validate that current education cannot have end date
  if (this.isCurrent && this.endDate) {
    return next(new Error('Current education cannot have an end date'));
  }
  
  // Validate that non-current education must have end date
  if (this.isCurrent === false && !this.endDate) {
    return next(new Error('Completed education must have an end date'));
  }
  
  next();
});

// Static method to reorder education entries
educationSchema.statics.reorderEducation = async function(userId, educationIds) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      for (let i = 0; i < educationIds.length; i++) {
        await this.updateOne(
          { _id: educationIds[i], user: userId },
          { order: i + 1 },
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }
};

// Static method to get user's education in order
educationSchema.statics.getUserEducation = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate('user', 'fullName email');
};

// Instance method to move education up/down
educationSchema.methods.moveUp = async function() {
  const prevEducation = await this.constructor.findOne({
    user: this.user,
    order: { $lt: this.order },
    isActive: true
  }).sort({ order: -1 });
  
  if (prevEducation) {
    const tempOrder = this.order;
    this.order = prevEducation.order;
    prevEducation.order = tempOrder;
    
    await Promise.all([this.save(), prevEducation.save()]);
  }
};

educationSchema.methods.moveDown = async function() {
  const nextEducation = await this.constructor.findOne({
    user: this.user,
    order: { $gt: this.order },
    isActive: true
  }).sort({ order: 1 });
  
  if (nextEducation) {
    const tempOrder = this.order;
    this.order = nextEducation.order;
    nextEducation.order = tempOrder;
    
    await Promise.all([this.save(), nextEducation.save()]);
  }
};

module.exports = mongoose.model('Education', educationSchema);
