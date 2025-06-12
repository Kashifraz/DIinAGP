import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  authorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for efficient querying
commentSchema.index({ postId: 1, status: 1 })
commentSchema.index({ createdAt: -1 })
commentSchema.index({ postId: 1, createdAt: -1 })

// Instance method to get formatted date
commentSchema.methods.getFormattedDate = function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Static method to get comment count for a post
commentSchema.statics.getApprovedCount = async function(postId) {
  return await this.countDocuments({ postId, status: 'approved' })
}

// Static method to get pending count
commentSchema.statics.getPendingCount = async function() {
  return await this.countDocuments({ status: 'pending' })
}

const Comment = mongoose.model('Comment', commentSchema)

export default Comment

