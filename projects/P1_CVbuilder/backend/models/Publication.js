const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Publication title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Publication type is required'],
    enum: {
      values: ['journal', 'conference', 'book', 'book_chapter', 'patent', 'blog', 'article', 'other'],
      message: 'Type must be one of: journal, conference, book, book_chapter, patent, blog, article, other'
    }
  },
  authors: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    affiliation: {
      type: String,
      trim: true,
      maxlength: [200, 'Affiliation cannot exceed 200 characters']
    }
  }],
  publisher: {
    type: String,
    trim: true,
    maxlength: [200, 'Publisher name cannot exceed 200 characters']
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  doi: {
    type: String,
    trim: true,
    maxlength: [100, 'DOI cannot exceed 100 characters']
  },
  url: {
    type: String,
    trim: true,
    maxlength: [500, 'URL cannot exceed 500 characters']
  },
  abstract: {
    type: String,
    trim: true,
    maxlength: [2000, 'Abstract cannot exceed 2000 characters']
  },
  keywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'Keyword cannot exceed 50 characters']
  }],
  citationCount: {
    type: Number,
    default: 0,
    min: [0, 'Citation count cannot be negative']
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
publicationSchema.index({ user: 1, order: 1 });
publicationSchema.index({ user: 1, isActive: 1 });
publicationSchema.index({ user: 1, type: 1 });
publicationSchema.index({ user: 1, publicationDate: -1 });

// Virtual for formatted publication date
publicationSchema.virtual('formattedDate').get(function() {
  return this.publicationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for primary author
publicationSchema.virtual('primaryAuthor').get(function() {
  const primary = this.authors.find(author => author.isPrimary);
  return primary ? primary.name : (this.authors[0] ? this.authors[0].name : '');
});

// Pre-save middleware to set order
publicationSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.order = count;
  }
  next();
});

// Static method to reorder publications
publicationSchema.statics.reorderPublications = async function(userId, publicationIds) {
  const updatePromises = publicationIds.map((publicationId, index) => 
    this.updateOne(
      { _id: publicationId, user: userId },
      { order: index }
    )
  );
  await Promise.all(updatePromises);
};

// Static method to get user publications
publicationSchema.statics.getUserPublications = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ order: 1, publicationDate: -1 });
};

module.exports = mongoose.model('Publication', publicationSchema);
