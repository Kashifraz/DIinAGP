import express from 'express';
import { body, validationResult, query } from 'express-validator';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * Helper function to get client IP address
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
};

/**
 * Helper function to check for spam patterns
 */
const checkSpamPatterns = (content, authorName, authorEmail) => {
  const spamKeywords = [
    'buy now', 'click here', 'limited time', 'act now',
    'make money', 'get rich', 'free money', 'guaranteed',
    'no credit check', 'risk free', 'winner', 'congratulations'
  ];
  
  const contentLower = content.toLowerCase();
  const nameLower = authorName.toLowerCase();
  const emailLower = authorEmail.toLowerCase();
  
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    return { isSpam: true, reason: 'Too many links' };
  }
  
  // Check for spam keywords
  for (const keyword of spamKeywords) {
    if (contentLower.includes(keyword) || nameLower.includes(keyword) || emailLower.includes(keyword)) {
      return { isSpam: true, reason: 'Contains spam keywords' };
    }
  }
  
  // Check for excessive capitalization
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperCaseRatio > 0.5 && content.length > 20) {
    return { isSpam: true, reason: 'Excessive capitalization' };
  }
  
  return { isSpam: false };
};

/**
 * Simple in-memory rate limiting (for development)
 * In production, use Redis or a proper rate limiting library
 */
const rateLimitMap = new Map();

const checkRateLimit = (ip, maxRequests = 5, windowMs = 60000) => {
  const now = Date.now();
  const key = `comment:${ip}`;
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  const limit = rateLimitMap.get(key);
  
  if (now > limit.resetTime) {
    // Reset window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (limit.count >= maxRequests) {
    return { allowed: false, resetTime: limit.resetTime };
  }
  
  limit.count++;
  return { allowed: true };
};

/**
 * @route   POST /api/comments
 * @desc    Create a new comment (public endpoint)
 * @access  Public
 */
router.post(
  '/',
  [
    body('postId')
      .notEmpty()
      .withMessage('Post ID is required')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid post ID format');
        }
        return true;
      }),
    body('authorName')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('authorEmail')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email cannot exceed 255 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Comment must be between 10 and 2000 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection unavailable', 503);
      }

      const { postId, authorName, authorEmail, content } = req.body;

      // Verify post exists and is published
      const post = await Post.findById(postId);
      if (!post) {
        return sendError(res, 'Post not found', 404);
      }
      if (post.status !== 'published') {
        return sendError(res, 'Comments can only be added to published posts', 400);
      }

      // Rate limiting
      const clientIp = getClientIp(req);
      const rateLimit = checkRateLimit(clientIp, 5, 60000); // 5 requests per minute
      if (!rateLimit.allowed) {
        const resetTime = new Date(rateLimit.resetTime).toISOString();
        return sendError(res, 'Too many requests. Please try again later.', 429);
      }

      // Spam detection
      const spamCheck = checkSpamPatterns(content, authorName, authorEmail);
      if (spamCheck.isSpam) {
        // Still create the comment but mark it as rejected
        const comment = await Comment.create({
          postId,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim().toLowerCase(),
          content: content.trim(),
          status: 'rejected',
          ipAddress: clientIp,
          userAgent: req.headers['user-agent'] || null
        });

        return sendError(res, 'Comment rejected due to spam detection', 400);
      }

      // Create comment
      const comment = await Comment.create({
        postId,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        content: content.trim(),
        status: 'pending',
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || null
      });

      sendSuccess(
        res,
        { comment },
        'Comment submitted successfully. It will be reviewed before being published.',
        201
      );
    } catch (error) {
      console.error('Create comment error:', error);
      sendError(res, 'Failed to submit comment', 500);
    }
  }
);

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get approved comments for a specific post (public endpoint)
 * @access  Public
 */
router.get('/post/:postId', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return sendError(res, 'Database connection unavailable', 503);
    }

    const { postId } = req.params;

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID format', 400);
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Get approved comments
    const comments = await Comment.find({
      postId,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .select('authorName authorEmail content createdAt')
      .lean();

    sendSuccess(
      res,
      { comments, count: comments.length },
      'Comments retrieved successfully',
      200
    );
  } catch (error) {
    console.error('Get comments error:', error);
    sendError(res, 'Failed to retrieve comments', 500);
  }
});

/**
 * @route   GET /api/comments
 * @desc    Get all comments with filters (author only)
 * @access  Private (Author only)
 */
router.get(
  '/',
  protect,
  authorize('author', 'admin'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Status must be pending, approved, or rejected'),
    query('postId').optional().custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid post ID format');
      }
      return true;
    }),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection unavailable', 503);
      }

      const { status, postId, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {};
      if (status) {
        query.status = status;
      }
      if (postId) {
        query.postId = postId;
      }

      // Get comments with pagination
      const comments = await Comment.find(query)
        .populate('postId', 'title slug')
        .populate('moderatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count
      const total = await Comment.countDocuments(query);

      sendSuccess(
        res,
        {
          comments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        },
        'Comments retrieved successfully',
        200
      );
    } catch (error) {
      console.error('Get all comments error:', error);
      sendError(res, 'Failed to retrieve comments', 500);
    }
  }
);

/**
 * @route   PUT /api/comments/:id/approve
 * @desc    Approve a comment (author only)
 * @access  Private (Author only)
 */
router.put(
  '/:id/approve',
  protect,
  authorize('author', 'admin'),
  async (req, res) => {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection unavailable', 503);
      }

      const { id } = req.params;

      // Validate comment ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 'Invalid comment ID format', 400);
      }

      // Find comment
      const comment = await Comment.findById(id);
      if (!comment) {
        return sendError(res, 'Comment not found', 404);
      }

      // Update comment status
      comment.status = 'approved';
      comment.moderatedBy = req.user._id;
      comment.moderatedAt = new Date();
      await comment.save();

      sendSuccess(
        res,
        { comment },
        'Comment approved successfully',
        200
      );
    } catch (error) {
      console.error('Approve comment error:', error);
      sendError(res, 'Failed to approve comment', 500);
    }
  }
);

/**
 * @route   PUT /api/comments/:id/reject
 * @desc    Reject a comment (author only)
 * @access  Private (Author only)
 */
router.put(
  '/:id/reject',
  protect,
  authorize('author', 'admin'),
  async (req, res) => {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection unavailable', 503);
      }

      const { id } = req.params;

      // Validate comment ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 'Invalid comment ID format', 400);
      }

      // Find comment
      const comment = await Comment.findById(id);
      if (!comment) {
        return sendError(res, 'Comment not found', 404);
      }

      // Update comment status
      comment.status = 'rejected';
      comment.moderatedBy = req.user._id;
      comment.moderatedAt = new Date();
      await comment.save();

      sendSuccess(
        res,
        { comment },
        'Comment rejected successfully',
        200
      );
    } catch (error) {
      console.error('Reject comment error:', error);
      sendError(res, 'Failed to reject comment', 500);
    }
  }
);

export default router;

