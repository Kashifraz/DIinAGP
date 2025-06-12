const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Award title is required'],
    trim: true,
    maxlength: [200, 'Award title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  issuer: {
    type: String,
    required: [true, 'Award issuer is required'],
    trim: true,
    maxlength: [200, 'Issuer name cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Award category is required'],
    enum: {
      values: ['academic', 'professional', 'recognition', 'competition', 'achievement', 'service', 'leadership', 'innovation', 'other'],
      message: 'Category must be one of: academic, professional, recognition, competition, achievement, service, leadership, innovation, other'
    }
  },
  dateReceived: {
    type: Date,
    required: [true, 'Date received is required']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  value: {
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      trim: true,
      maxlength: [3, 'Currency code cannot exceed 3 characters'],
      uppercase: true
    }
  },
  url: {
    type: String,
    trim: true,
    maxlength: [500, 'URL cannot exceed 500 characters']
  },
  certificateUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Certificate URL cannot exceed 500 characters']
  },
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
awardSchema.index({ user: 1, order: 1 });
awardSchema.index({ user: 1, isActive: 1 });
awardSchema.index({ user: 1, category: 1 });
awardSchema.index({ user: 1, dateReceived: -1 });

// Virtual for formatted date
awardSchema.virtual('formattedDate').get(function() {
  return this.dateReceived.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted value
awardSchema.virtual('formattedValue').get(function() {
  if (!this.value || !this.value.amount) return null;
  
  const currency = this.value.currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(this.value.amount);
});

// Virtual for category display
awardSchema.virtual('categoryDisplay').get(function() {
  return this.category.charAt(0).toUpperCase() + this.category.slice(1).replace('_', ' ');
});

// Pre-save middleware to set order
awardSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.order = count;
  }
  next();
});

// Static method to reorder awards
awardSchema.statics.reorderAwards = async function(userId, awardIds) {
  const updatePromises = awardIds.map((awardId, index) => 
    this.updateOne(
      { _id: awardId, user: userId },
      { order: index }
    )
  );
  await Promise.all(updatePromises);
};

// Static method to get user awards
awardSchema.statics.getUserAwards = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ order: 1, dateReceived: -1 });
};

module.exports = mongoose.model('Award', awardSchema);
