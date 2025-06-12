const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Language name is required'],
    trim: true,
    maxlength: [50, 'Language name cannot exceed 50 characters']
  },
  proficiency: {
    type: String,
    required: [true, 'Proficiency level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'native', 'fluent'],
      message: 'Proficiency must be one of: beginner, intermediate, advanced, native, fluent'
    }
  },
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Certification name cannot exceed 100 characters']
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer name cannot exceed 100 characters']
    },
    dateObtained: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [50, 'Credential ID cannot exceed 50 characters']
    },
    credentialUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Credential URL cannot exceed 500 characters']
    }
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
languageSchema.index({ user: 1, order: 1 });
languageSchema.index({ user: 1, isActive: 1 });

// Virtual for proficiency percentage
languageSchema.virtual('proficiencyPercentage').get(function() {
  const proficiencyMap = {
    'beginner': 20,
    'intermediate': 40,
    'advanced': 60,
    'fluent': 80,
    'native': 100
  };
  return proficiencyMap[this.proficiency] || 0;
});

// Virtual for proficiency level display
languageSchema.virtual('proficiencyLevel').get(function() {
  return this.proficiency.charAt(0).toUpperCase() + this.proficiency.slice(1);
});

// Pre-save middleware to set order
languageSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.order = count;
  }
  next();
});

// Static method to reorder languages
languageSchema.statics.reorderLanguages = async function(userId, languageIds) {
  const updatePromises = languageIds.map((languageId, index) => 
    this.updateOne(
      { _id: languageId, user: userId },
      { order: index }
    )
  );
  await Promise.all(updatePromises);
};

// Static method to get user languages
languageSchema.statics.getUserLanguages = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ order: 1, createdAt: -1 });
};

module.exports = mongoose.model('Language', languageSchema);
