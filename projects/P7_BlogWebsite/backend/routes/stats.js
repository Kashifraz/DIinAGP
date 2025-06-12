import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/stats
 * @desc    Get dashboard statistics (author only)
 * @access  Private (Author only)
 */
router.get('/', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Build query - authors see only their posts, admins see all
    const postQuery = isAdmin ? {} : { authorId: userId };

    // Get post statistics
    const totalPosts = await Post.countDocuments(postQuery);
    const publishedPosts = await Post.countDocuments({ ...postQuery, status: 'published' });
    const draftPosts = await Post.countDocuments({ ...postQuery, status: 'draft' });

    // Get comment statistics
    // For comments, we need to get posts by this author first
    let commentQuery = {};
    if (!isAdmin) {
      const userPosts = await Post.find({ authorId: userId }).select('_id');
      const postIds = userPosts.map(p => p._id);
      commentQuery = { postId: { $in: postIds } };
    }

    const totalComments = await Comment.countDocuments(commentQuery);
    const pendingComments = await Comment.countDocuments({ ...commentQuery, status: 'pending' });
    const approvedComments = await Comment.countDocuments({ ...commentQuery, status: 'approved' });

    // Get category count
    const totalCategories = await Category.countDocuments();

    // Get top posts by view count (published only)
    const topPosts = await Post.find({ ...postQuery, status: 'published' })
      .populate('authorId', 'name email avatar')
      .populate('categoryId', 'name slug')
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title slug viewCount publishedAt featuredImage')
      .lean();

    // Get recent posts
    const recentPosts = await Post.find(postQuery)
      .populate('authorId', 'name email avatar')
      .populate('categoryId', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title slug status updatedAt featuredImage')
      .lean();

    // Get recent comments
    const recentComments = await Comment.find(commentQuery)
      .populate('postId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('authorName authorEmail content status createdAt postId')
      .lean();

    sendSuccess(
      res,
      {
        posts: {
          total: totalPosts,
          published: publishedPosts,
          drafts: draftPosts
        },
        comments: {
          total: totalComments,
          pending: pendingComments,
          approved: approvedComments
        },
        categories: {
          total: totalCategories
        },
        topPosts,
        recentPosts,
        recentComments
      },
      'Statistics retrieved successfully',
      200
    );
  } catch (error) {
    console.error('Get stats error:', error);
    sendError(res, 'Failed to retrieve statistics', 500);
  }
});

export default router;

