import express from 'express';
import QuizResponse from '../models/QuizResponse.js';
import Post from '../models/Post.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

// Rate limiting map (in-memory, simple implementation)
// In production, use Redis or a proper rate limiting library
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

/**
 * Simple rate limiting middleware
 */
const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `${ip}:${req.params.postId}:${req.params.blockId}`;
  const now = Date.now();

  // Clean up old entries
  if (rateLimitMap.has(key)) {
    const entry = rateLimitMap.get(key);
    if (now - entry.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    } else if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
      return sendError(res, 'Too many requests. Please wait before submitting again.', 429);
    }
  }

  // Update or create entry
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { firstRequest: now, count: 1 });
  } else {
    rateLimitMap.get(key).count++;
  }

  next();
};

/**
 * POST /api/quizzes/:postId/:blockId/respond
 * Submit a quiz/poll response
 */
router.post('/:postId/:blockId/respond', rateLimit, async (req, res) => {
  try {
    const { postId, blockId } = req.params;
    const { answers, identifier } = req.body;

    // Validate postId
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return sendError(res, 'Invalid post ID', 400);
    }

    // Validate blockId
    if (!blockId || typeof blockId !== 'string' || blockId.trim().length === 0) {
      return sendError(res, 'Invalid block ID', 400);
    }

    // Validate answers
    if (answers === undefined || answers === null) {
      return sendError(res, 'Answers are required', 400);
    }

    // Check if post exists and is published
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    if (post.status !== 'published') {
      return sendError(res, 'Post is not published', 403);
    }

    // Find the quiz/poll block in the post content
    // Block ID can be the index (as string) or a unique identifier
    let block = null;
    if (/^\d+$/.test(blockId)) {
      // If blockId is a number (as string), use it as array index
      const index = parseInt(blockId);
      if (index >= 0 && index < post.content.length) {
        block = post.content[index];
      }
    } else {
      // Otherwise, search for block by type
      block = post.content.find(b => (b.type === 'quiz' || b.type === 'poll'));
    }

    if (!block || (block.type !== 'quiz' && block.type !== 'poll')) {
      return sendError(res, 'Quiz/Poll block not found in post', 404);
    }

    // Validate answers format based on block type
    const blockData = block.data;
    if (blockData.allowMultipleAnswers) {
      // Multiple answers allowed - should be array
      if (!Array.isArray(answers)) {
        return sendError(res, 'Answers must be an array when multiple answers are allowed', 400);
      }
      if (answers.length === 0) {
        return sendError(res, 'At least one answer must be selected', 400);
      }
      if (answers.length > blockData.options.length) {
        return sendError(res, 'Too many answers selected', 400);
      }
      // Validate each answer is a valid option index or value
      for (const answer of answers) {
        const isValid = blockData.options.some((opt, idx) => 
          opt.value === answer || idx === answer || opt.value === String(answer) || String(idx) === String(answer)
        );
        if (!isValid) {
          return sendError(res, `Invalid answer: ${answer}`, 400);
        }
      }
    } else {
      // Single answer - can be string, number, or array with one element
      let singleAnswer;
      if (Array.isArray(answers)) {
        if (answers.length !== 1) {
          return sendError(res, 'Only one answer is allowed', 400);
        }
        singleAnswer = answers[0];
      } else {
        singleAnswer = answers;
      }
      // Validate answer is a valid option
      const isValid = blockData.options.some((opt, idx) => 
        opt.value === singleAnswer || idx === singleAnswer || opt.value === String(singleAnswer) || String(idx) === String(singleAnswer)
      );
      if (!isValid) {
        return sendError(res, `Invalid answer: ${singleAnswer}`, 400);
      }
    }

    // Get IP address for rate limiting
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create response
    const response = new QuizResponse({
      postId,
      blockId,
      answers: Array.isArray(answers) ? answers : [answers],
      identifier: identifier || null,
      ipAddress,
      userAgent
    });

    await response.save();

    sendSuccess(res, { responseId: response._id }, 'Response submitted successfully', 201);
  } catch (error) {
    console.error('Submit quiz response error:', error);
    sendError(res, error.message || 'Failed to submit response', 500);
  }
});

/**
 * GET /api/quizzes/:postId/:blockId/stats
 * Get statistics for a quiz/poll block
 */
router.get('/:postId/:blockId/stats', async (req, res) => {
  try {
    const { postId, blockId } = req.params;

    // Validate postId
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return sendError(res, 'Invalid post ID', 400);
    }

    // Validate blockId
    if (!blockId || typeof blockId !== 'string' || blockId.trim().length === 0) {
      return sendError(res, 'Invalid block ID', 400);
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Find the quiz/poll block in the post content
    // Block ID can be the index (as string) or a unique identifier
    let block = null;
    if (/^\d+$/.test(blockId)) {
      // If blockId is a number (as string), use it as array index
      const index = parseInt(blockId);
      if (index >= 0 && index < post.content.length) {
        block = post.content[index];
      }
    } else {
      // Otherwise, search for block by type
      block = post.content.find(b => (b.type === 'quiz' || b.type === 'poll'));
    }

    if (!block || (block.type !== 'quiz' && block.type !== 'poll')) {
      return sendError(res, 'Quiz/Poll block not found in post', 404);
    }

    // Get all responses for this block
    const responses = await QuizResponse.find({ postId, blockId });

    // Calculate statistics
    const totalResponses = responses.length;
    const blockData = block.data;
    const options = blockData.options || [];

    // Initialize option counts
    const optionStats = options.map((opt, index) => ({
      index,
      value: opt.value !== undefined ? opt.value : index,
      text: opt.text,
      count: 0,
      percentage: 0
    }));

    // Count responses
    responses.forEach(response => {
      const answers = Array.isArray(response.answers) ? response.answers : [response.answers];
      answers.forEach(answer => {
        const optionIndex = optionStats.findIndex(stat => 
          stat.value === answer || 
          stat.index === answer || 
          String(stat.value) === String(answer) || 
          String(stat.index) === String(answer)
        );
        if (optionIndex !== -1) {
          optionStats[optionIndex].count++;
        }
      });
    });

    // Calculate percentages
    if (totalResponses > 0) {
      optionStats.forEach(stat => {
        stat.percentage = Math.round((stat.count / totalResponses) * 100 * 10) / 10; // Round to 1 decimal
      });
    }

    sendSuccess(res, {
      totalResponses,
      options: optionStats,
      blockType: block.type,
      question: blockData.question
    }, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('Get quiz statistics error:', error);
    sendError(res, error.message || 'Failed to get statistics', 500);
  }
});

export default router;

