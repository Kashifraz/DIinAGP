const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for efficient user-specific queries
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  position: {
    type: String,
    required: [true, 'Position title is required'],
    trim: true,
    maxlength: [100, 'Position title cannot exceed 100 characters'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date(); // Start date cannot be in the future
      },
      message: 'Start date cannot be in the future',
    },
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v) {
        // End date must be after start date if both are present
        return !this.startDate || !v || v >= this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  achievements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Achievement cannot exceed 500 characters'],
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill cannot exceed 50 characters'],
  }],
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'consulting'],
    default: 'full-time',
  },
  order: {
    type: Number,
    required: true,
    default: 0, // Will be set in pre-save hook
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for duration
experienceSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;

  const start = new Date(this.startDate);
  const end = this.isCurrent ? new Date() : (this.endDate ? new Date(this.endDate) : null);

  if (!end) return null;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} year${years === 1 ? '' : 's'}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months === 1 ? '' : 's'}`);
  }

  return parts.length > 0 ? parts.join(' ') : 'Less than a month';
});

// Virtual for formatted date range
experienceSchema.virtual('dateRange').get(function() {
  if (!this.startDate) return null;

  const startOptions = { year: 'numeric', month: 'short' };
  const startDateFormatted = new Date(this.startDate).toLocaleDateString('en-US', startOptions);

  if (this.isCurrent) {
    return `${startDateFormatted} - Present`;
  } else if (this.endDate) {
    const endDateFormatted = new Date(this.endDate).toLocaleDateString('en-US', startOptions);
    return `${startDateFormatted} - ${endDateFormatted}`;
  }
  return startDateFormatted;
});

// Pre-save hook to set the order and validate dates
experienceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastExperience = await this.constructor.findOne(
      { user: this.user, isActive: true },
      {},
      { sort: { order: -1 } }
    );
    this.order = lastExperience ? lastExperience.order + 1 : 1;
  }

  // Validate that current experience cannot have end date
  if (this.isCurrent && this.endDate) {
    return next(new Error('Current experience cannot have an end date'));
  }

  // Validate that non-current experience must have end date
  if (this.isCurrent === false && !this.endDate) {
    return next(new Error('Completed experience must have an end date'));
  }

  next();
});

// Static method to reorder experience entries
experienceSchema.statics.reorderExperience = async function(userId, experienceIds) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const experienceEntries = await this.find({ user: userId, _id: { $in: experienceIds }, isActive: true }).session(session);
    if (experienceEntries.length !== experienceIds.length) {
      throw new Error('One or more experience entries not found or do not belong to the user.');
    }

    const updates = experienceIds.map((id, index) =>
      this.updateOne({ _id: id, user: userId }, { $set: { order: index + 1 } }, { session })
    );
    await Promise.all(updates);

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Static method to get all active experience for a user, sorted by order
experienceSchema.statics.getUserExperience = async function(userId) {
  return this.find({ user: userId, isActive: true }).sort('order');
};

// Instance method to move an experience entry up in order
experienceSchema.methods.moveUp = async function() {
  const prevExperience = await this.constructor.findOne({
    user: this.user,
    order: { $lt: this.order },
    isActive: true
  }).sort({ order: -1 });

  if (prevExperience) {
    const tempOrder = this.order;
    this.order = prevExperience.order;
    prevExperience.order = tempOrder;

    await Promise.all([this.save(), prevExperience.save()]);
  }
};

// Instance method to move an experience entry down in order
experienceSchema.methods.moveDown = async function() {
  const nextExperience = await this.constructor.findOne({
    user: this.user,
    order: { $gt: this.order },
    isActive: true
  }).sort({ order: 1 });

  if (nextExperience) {
    const tempOrder = this.order;
    this.order = nextExperience.order;
    nextExperience.order = tempOrder;

    await Promise.all([this.save(), nextExperience.save()]);
  }
};

module.exports = mongoose.model('Experience', experienceSchema);
