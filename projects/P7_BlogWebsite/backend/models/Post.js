import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true, // This automatically creates an index
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)']
  },
  content: {
    type: Array,
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Content must be an array of blocks'
    }
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    default: ''
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // Check array length
        if (v.length > 20) {
          return false;
        }
        // Validate each tag
        return v.every(tag => {
          if (typeof tag !== 'string') return false;
          const trimmed = tag.trim();
          // Tag must be 1-50 characters, alphanumeric with spaces, hyphens, underscores
          return trimmed.length >= 1 && 
                 trimmed.length <= 50 && 
                 /^[a-zA-Z0-9\s\-_]+$/.test(trimmed);
        });
      },
      message: 'Tags must be an array of strings (1-50 characters each, max 20 tags). Each tag can contain letters, numbers, spaces, hyphens, and underscores.'
    },
    set: function(v) {
      // Normalize tags: trim, lowercase, remove duplicates
      if (!Array.isArray(v)) return [];
      return [...new Set(
        v
          .map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '')
          .filter(tag => tag.length > 0)
      )];
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  featuredImage: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
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

// Indexes for performance
postSchema.index({ authorId: 1 });
postSchema.index({ status: 1 });
postSchema.index({ publishedAt: -1 }); // Descending for latest first
// Note: slug index is automatically created by unique: true, no need for explicit index
postSchema.index({ categoryId: 1 });
postSchema.index({ tags: 1 });
// Compound index for common queries
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ authorId: 1, status: 1 });
postSchema.index({ featured: 1, status: 1, publishedAt: -1 }); // For featured posts queries
// Text indexes for full-text search (title, excerpt, tags)
postSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

// Update updatedAt before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Clear publishedAt when status changes to draft
  if (this.isModified('status') && this.status === 'draft') {
    this.publishedAt = null;
  }
  
  next();
});

// Static method to find posts by author
postSchema.statics.findByAuthor = function(authorId, options = {}) {
  const query = this.find({ authorId });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  if (options.skip) {
    query.skip(options.skip);
  }
  
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ createdAt: -1 }); // Default: newest first
  }
  
  return query.populate('authorId', 'name email avatar bio').populate('categoryId', 'name slug');
};

// Static method to find published posts
postSchema.statics.findPublished = function(options = {}) {
  const query = this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() } // Only posts that have been published
  });
  
  if (options.featured !== undefined) {
    query.where('featured').equals(options.featured);
  }
  
  if (options.categoryId) {
    query.where('categoryId').equals(options.categoryId);
  }
  
  if (options.tags && options.tags.length > 0) {
    query.where('tags').in(options.tags);
  }
  
  if (options.search) {
    // Enhanced search: try text search first, fallback to regex
    const searchTerm = options.search.trim();
    if (searchTerm.length > 0) {
      // Use regex search for better compatibility (text search requires specific index setup)
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  if (options.skip) {
    query.skip(options.skip);
  }
  
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ publishedAt: -1 }); // Default: newest published first
  }
  
  return query.populate('authorId', 'name email avatar bio').populate('categoryId', 'name slug');
};

// Static method to find post by slug
postSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() })
    .populate('authorId', 'name email avatar bio')
    .populate('categoryId', 'name slug description');
};

// Instance method to increment view count
postSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to generate slug from title
postSchema.methods.generateSlug = function() {
  return this.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const Post = mongoose.model('Post', postSchema);

export default Post;

