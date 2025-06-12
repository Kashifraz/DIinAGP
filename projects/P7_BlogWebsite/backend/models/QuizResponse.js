import mongoose from 'mongoose';

const quizResponseSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID is required'],
    index: true
  },
  blockId: {
    type: String,
    required: [true, 'Block ID is required'],
    index: true
  },
  // For tracking unique responses (optional - can use IP, user agent, or cookie)
  // This allows preventing duplicate submissions if needed
  identifier: {
    type: String,
    required: false,
    index: true
  },
  // Selected answer(s) - can be single value for quiz or array for poll
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Answers are required']
    // Can be:
    // - String (single answer for quiz)
    // - Array of strings (multiple answers for poll)
    // - Number (index of selected option)
  },
  // Response metadata
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Optional: IP address for rate limiting
  ipAddress: {
    type: String,
    required: false
  },
  // Optional: User agent for additional tracking
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
quizResponseSchema.index({ postId: 1, blockId: 1 });
quizResponseSchema.index({ postId: 1, blockId: 1, identifier: 1 });

// Index for statistics queries
quizResponseSchema.index({ postId: 1, blockId: 1, submittedAt: -1 });

const QuizResponse = mongoose.model('QuizResponse', quizResponseSchema);

export default QuizResponse;

