import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required'],
    trim: true
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    validate: {
      validator: function(v) {
        // Validate that it's an image MIME type
        return /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i.test(v);
      },
      message: 'File must be an image (JPEG, PNG, GIF, WebP, or SVG)'
    }
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0'],
    max: [10 * 1024 * 1024, 'File size cannot exceed 10MB'] // 10MB max
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We'll manage createdAt manually
});

// Indexes for performance
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ createdAt: -1 }); // Descending for latest first
mediaSchema.index({ mimeType: 1 });

// Static method to find media by uploader
mediaSchema.statics.findByUploader = function(uploaderId, options = {}) {
  const query = this.find({ uploadedBy: uploaderId });
  
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
  
  return query.populate('uploadedBy', 'name email');
};

// Static method to find media by MIME type
mediaSchema.statics.findByMimeType = function(mimeType) {
  return this.find({ mimeType: new RegExp(mimeType, 'i') });
};

const Media = mongoose.model('Media', mediaSchema);

export default Media;

