const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Reference name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Reference title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: {
      values: ['supervisor', 'manager', 'colleague', 'client', 'professor', 'mentor', 'peer', 'other'],
      message: 'Relationship must be one of: supervisor, manager, colleague, client, professor, mentor, peer, other'
    }
  },
  relationshipDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Relationship description cannot exceed 200 characters']
  },
  yearsKnown: {
    type: Number,
    min: [0, 'Years known cannot be negative'],
    max: [50, 'Years known cannot exceed 50']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preferredContactMethod: {
    type: String,
    enum: {
      values: ['email', 'phone', 'both'],
      message: 'Preferred contact method must be one of: email, phone, both'
    },
    default: 'email'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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
referenceSchema.index({ user: 1, order: 1 });
referenceSchema.index({ user: 1, isActive: 1 });
referenceSchema.index({ user: 1, relationship: 1 });
referenceSchema.index({ user: 1, isAvailable: 1 });

// Virtual for relationship display
referenceSchema.virtual('relationshipDisplay').get(function() {
  return this.relationship.charAt(0).toUpperCase() + this.relationship.slice(1);
});

// Virtual for contact info
referenceSchema.virtual('contactInfo').get(function() {
  const info = [];
  if (this.email) info.push(`Email: ${this.email}`);
  if (this.phone) info.push(`Phone: ${this.phone}`);
  return info.join(' | ');
});

// Virtual for years known display
referenceSchema.virtual('yearsKnownDisplay').get(function() {
  if (!this.yearsKnown) return null;
  return `${this.yearsKnown} year${this.yearsKnown > 1 ? 's' : ''}`;
});

// Pre-save middleware to set order
referenceSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.order = count;
  }
  next();
});

// Static method to reorder references
referenceSchema.statics.reorderReferences = async function(userId, referenceIds) {
  const updatePromises = referenceIds.map((referenceId, index) => 
    this.updateOne(
      { _id: referenceId, user: userId },
      { order: index }
    )
  );
  await Promise.all(updatePromises);
};

// Static method to get user references
referenceSchema.statics.getUserReferences = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ order: 1, createdAt: -1 });
};

module.exports = mongoose.model('Reference', referenceSchema);
