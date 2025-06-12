const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Profile', 'Experience', 'Education', 'Skills', 'Languages', 'Projects', 'Publications', 'Awards', 'References']
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  visible: {
    type: Boolean,
    default: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const cvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  templateName: {
    type: String,
    required: true
  },
  sections: [sectionSchema],
  settings: {
    colorScheme: {
      name: {
        type: String,
        default: 'Professional Blue'
      },
      primary: {
        type: String,
        default: '#1e40af'
      },
      secondary: {
        type: String,
        default: '#64748b'
      },
      accent: {
        type: String,
        default: '#3b82f6'
      },
      text: {
        type: String,
        default: '#ffffff'
      },
      background: {
        type: String,
        default: '#ffffff'
      }
    },
    font: {
      name: {
        type: String,
        default: 'Inter'
      },
      family: {
        type: String,
        default: 'Inter, sans-serif'
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
cvSchema.index({ user: 1, status: 1 });
cvSchema.index({ user: 1, createdAt: -1 });
cvSchema.index({ shareToken: 1 });

// Virtual for section count
cvSchema.virtual('sectionCount').get(function() {
  return this.sections.length;
});

// Virtual for visible sections count
cvSchema.virtual('visibleSectionCount').get(function() {
  return this.sections.filter(section => section.visible).length;
});

// Method to reorder sections
cvSchema.methods.reorderSections = function(sectionOrders) {
  const sectionMap = {};
  this.sections.forEach(section => {
    sectionMap[section.name] = section;
  });
  
  this.sections = sectionOrders.map((sectionName, index) => {
    if (sectionMap[sectionName]) {
      sectionMap[sectionName].order = index;
      return sectionMap[sectionName];
    }
    return null;
  }).filter(Boolean);
  
  return this.save();
};

// Method to toggle section visibility
cvSchema.methods.toggleSectionVisibility = function(sectionName) {
  const section = this.sections.find(s => s.name === sectionName);
  if (section) {
    section.visible = !section.visible;
    this.lastModified = new Date();
    return this.save();
  }
  throw new Error('Section not found');
};

// Method to update section data
cvSchema.methods.updateSectionData = function(sectionName, data) {
  const section = this.sections.find(s => s.name === sectionName);
  if (section) {
    section.data = { ...section.data, ...data };
    this.lastModified = new Date();
    return this.save();
  }
  throw new Error('Section not found');
};

// Method to generate share token
cvSchema.methods.generateShareToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.shareToken = token;
  this.isPublic = true;
  return this.save();
};

// Method to revoke sharing
cvSchema.methods.revokeSharing = function() {
  this.shareToken = undefined;
  this.isPublic = false;
  return this.save();
};

// Pre-save middleware to update lastModified
cvSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModified = new Date();
  }
  next();
});

// Static method to find by share token
cvSchema.statics.findByShareToken = function(token) {
  return this.findOne({ shareToken: token, isPublic: true });
};

// Static method to get user's CVs
cvSchema.statics.findByUser = function(userId, status = null) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('template', 'name description').sort({ updatedAt: -1 });
};

module.exports = mongoose.model('CV', cvSchema);
