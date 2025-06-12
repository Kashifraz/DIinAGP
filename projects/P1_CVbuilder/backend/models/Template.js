const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['professional', 'creative', 'modern', 'classic', 'minimal'],
    default: 'professional'
  },
  preview: {
    type: String,
    required: true,
    trim: true
  },
  html: {
    type: String,
    required: true
  },
  css: {
    type: String,
    required: true
  },
  sections: [{
    name: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    required: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: true
    }
  }],
  colorSchemes: [{
    name: {
      type: String,
      required: true
    },
    primary: {
      type: String,
      required: true
    },
    secondary: {
      type: String,
      required: true
    },
    accent: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    background: {
      type: String,
      required: true
    }
  }],
  fonts: [{
    name: {
      type: String,
      required: true
    },
    family: {
      type: String,
      required: true
    },
    weights: [{
      type: String,
      required: true
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ name: 1 });

// Virtual for template URL
templateSchema.virtual('templateUrl').get(function() {
  return `/api/templates/${this._id}`;
});

// Method to get template data for rendering
templateSchema.methods.getTemplateData = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    preview: this.preview,
    sections: this.sections,
    colorSchemes: this.colorSchemes,
    fonts: this.fonts,
    version: this.version,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get full template for rendering
templateSchema.methods.getFullTemplate = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    preview: this.preview,
    html: this.html,
    css: this.css,
    sections: this.sections,
    colorSchemes: this.colorSchemes,
    fonts: this.fonts,
    version: this.version,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Template', templateSchema);
