const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: 500
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    trim: true,
    match: /^#[0-9A-F]{6}$/i,
    default: '#007bff'
  },
  jobCount: {
    type: Number,
    default: 0
  },
  metadata: {
    keywords: [String],
    tags: [String]
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for job count (will be populated)
categorySchema.virtual('jobs', {
  ref: 'JobPosting',
  localField: '_id',
  foreignField: 'category'
});

// Instance methods
categorySchema.methods.getFullPath = function() {
  if (this.parentCategory) {
    return `${this.parentCategory.name} > ${this.name}`;
  }
  return this.name;
};

categorySchema.methods.isLeafCategory = function() {
  return this.level === 3; // Maximum depth
};

// Static methods
categorySchema.statics.findActiveCategories = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findSubcategories = function(parentId) {
  return this.find({ parentCategory: parentId, isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getCategoryHierarchy = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { level: 1, sortOrder: 1, name: 1 } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parentCategory',
        as: 'subcategories'
      }
    },
    {
      $addFields: {
        subcategories: {
          $filter: {
            input: '$subcategories',
            cond: { $eq: ['$$this.isActive', true] }
          }
        }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
