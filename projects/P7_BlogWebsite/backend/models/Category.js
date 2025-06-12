import mongoose from 'mongoose';
import { generateSlug, generateUniqueSlug } from '../utils/slugGenerator.js';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true, // This automatically creates an index
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true, // This automatically creates an index
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Note: slug and name indexes are automatically created by unique: true, no need for explicit indexes

// Update updatedAt before saving
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate slug from name if not provided
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    const baseSlug = generateSlug(this.name);
    
    // Check if slug exists
    const checkExists = async (slug, excludeId = null) => {
      const query = { slug: slug.toLowerCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const category = await mongoose.model('Category').findOne(query);
      return !!category;
    };
    
    this.slug = await generateUniqueSlug(baseSlug, checkExists, this._id);
  }
  next();
});

// Static method to find category by slug
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get post count
categorySchema.methods.getPostCount = async function() {
  const Post = mongoose.model('Post');
  return await Post.countDocuments({ categoryId: this._id });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;

