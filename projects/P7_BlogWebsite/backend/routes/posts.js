import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult, query } from 'express-validator';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { generateSlug, generateUniqueSlug } from '../utils/slugGenerator.js';
import { validateBlocks, sanitizeBlocks } from '../utils/blockValidator.js';

const router = express.Router();

/**
 * Helper function to check if slug exists
 */
const checkSlugExists = async (slug, excludeId = null) => {
  const query = { slug: slug.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const post = await Post.findOne(query);
  return !!post;
};

/**
 * @route   GET /api/posts
 * @desc    Get all posts (with filters)
 * @access  Private (Author only - can see own posts)
 */
router.get(
  '/',
  protect,
  [
    query('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('tag').optional().isString().withMessage('Tag must be a string'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const { status, page = 1, limit = 10, tag, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query - authors can only see their own posts
      const queryOptions = {
        status: status || undefined,
        limit: parseInt(limit),
        skip: skip,
        sort: { createdAt: -1 }
      };

      // Add tag filter if provided
      if (tag) {
        queryOptions.tags = [tag.toLowerCase()];
      }

      // Add search filter if provided
      if (search) {
        queryOptions.search = search;
      }

      // Remove undefined values
      Object.keys(queryOptions).forEach(key => 
        queryOptions[key] === undefined && delete queryOptions[key]
      );

      // Build MongoDB query
      const mongoQuery = { authorId: req.user._id };
      if (status) {
        mongoQuery.status = status;
      }
      if (tag) {
        mongoQuery.tags = { $in: [tag.toLowerCase()] };
      }
      if (search) {
        const searchTerm = search.trim();
        if (searchTerm.length > 0) {
          mongoQuery.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { excerpt: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ];
        }
      }

      const posts = await Post.find(mongoQuery)
        .populate('authorId', 'name email avatar bio')
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Post.countDocuments(mongoQuery);

      sendSuccess(
        res,
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        },
        'Posts retrieved successfully',
        200
      );
    } catch (error) {
      console.error('Get posts error:', error);
      sendError(res, 'Failed to retrieve posts', 500);
    }
  }
);

/**
 * @route   GET /api/posts/search
 * @desc    Search posts (public endpoint for published posts, private for all posts)
 * @access  Public (for published) / Private (for all posts)
 */
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('tag').optional().isString().withMessage('Tag must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('publishedOnly').optional().isBoolean().withMessage('publishedOnly must be a boolean')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      // Check MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection not available. Please try again later.', 503);
      }

      const { q, page = 1, limit = 10, tag, category, publishedOnly = true } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const searchTerm = q.trim();

      if (searchTerm.length === 0) {
        return sendError(res, 'Search query cannot be empty', 400);
      }

      // Build query
      const mongoQuery = {};

      // If publishedOnly is true or user is not authenticated, only show published posts
      if (publishedOnly || !req.user) {
        mongoQuery.status = 'published';
        mongoQuery.publishedAt = { $lte: new Date() };
      } else if (req.user) {
        // Authenticated users can search their own posts (all statuses)
        mongoQuery.authorId = req.user._id;
      }

      // Add category filter if provided
      if (category) {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          mongoQuery.categoryId = categoryDoc._id;
        }
      }

      // Add tag filter if provided
      if (tag) {
        mongoQuery.tags = { $in: [tag.toLowerCase()] };
      }

      // Add search filter
      mongoQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];

      // Execute query
      const posts = await Post.find(mongoQuery)
        .populate('authorId', 'name email avatar bio')
        .populate('categoryId', 'name slug')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Post.countDocuments(mongoQuery);

      sendSuccess(
        res,
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          },
          searchQuery: searchTerm
        },
        'Search completed successfully',
        200
      );
    } catch (error) {
      console.error('Search posts error:', error);
      sendError(res, 'Failed to search posts', 500);
    }
  }
);

/**
 * @route   GET /api/posts/public/featured
 * @desc    Get featured published posts (public endpoint)
 * @access  Public
 */
router.get('/public/featured', async (req, res) => {
  try {
    const queryOptions = {
      featured: true,
      limit: 10,
      sort: { publishedAt: -1 }
    };

    const featuredPosts = await Post.findPublished(queryOptions);

    sendSuccess(
      res,
      { posts: featuredPosts },
      'Featured posts retrieved successfully',
      200
    );
  } catch (error) {
    console.error('Get featured posts error:', error);
    sendError(res, 'Failed to retrieve featured posts', 500);
  }
});

/**
 * @route   GET /api/posts/public
 * @desc    Get all published posts (public endpoint)
 * @access  Public
 */
router.get(
  '/public',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('tag').optional().isString().withMessage('Tag must be a string'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const { page = 1, limit = 10, category, tag, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query options
      const queryOptions = {
        limit: parseInt(limit),
        skip: skip,
        sort: { publishedAt: -1 }
      };

      // Add category filter if provided
      if (category) {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          queryOptions.categoryId = categoryDoc._id;
        }
      }

      // Add tag filter if provided
      if (tag) {
        queryOptions.tags = [tag.toLowerCase()];
      }

      // Add search filter if provided
      if (search) {
        queryOptions.search = search;
      }

      // Get published posts
      const posts = await Post.findPublished(queryOptions);
      
      // Build count query
      const countQuery = {
        status: 'published',
        publishedAt: { $lte: new Date() }
      };
      
      if (queryOptions.categoryId) {
        countQuery.categoryId = queryOptions.categoryId;
      }
      
      if (queryOptions.tags) {
        countQuery.tags = { $in: queryOptions.tags };
      }
      
      if (queryOptions.search) {
        const searchTerm = queryOptions.search.trim();
        if (searchTerm.length > 0) {
          countQuery.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { excerpt: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ];
        }
      }
      
      const total = await Post.countDocuments(countQuery);

      sendSuccess(
        res,
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        },
        'Published posts retrieved successfully',
        200
      );
    } catch (error) {
      console.error('Get published posts error:', error);
      sendError(res, 'Failed to retrieve published posts', 500);
    }
  }
);

/**
 * @route   GET /api/posts/public/:slug
 * @desc    Get single published post by slug (public endpoint)
 * @access  Public
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const post = await Post.findBySlug(req.params.slug);

    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Only return published posts
    if (post.status !== 'published') {
      return sendError(res, 'Post not found', 404);
    }

    // Check if post has been published (publishedAt is set and in the past)
    if (!post.publishedAt || post.publishedAt > new Date()) {
      return sendError(res, 'Post not found', 404);
    }

    // Check if view count should be incremented (skip if ?noIncrement=true)
    const shouldIncrement = req.query.noIncrement !== 'true';
    
    if (shouldIncrement) {
      // Increment view count
      await post.incrementViewCount();
    }

    sendSuccess(res, { post }, 'Post retrieved successfully', 200);
  } catch (error) {
    console.error('Get published post error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid post slug', 400);
    }
    
    sendError(res, 'Failed to retrieve post', 500);
  }
});

/**
 * @route   GET /api/posts/:id/preview
 * @desc    Get post preview (for authors to preview their own posts, including drafts)
 * @access  Private (Author only - can preview own posts)
 * 
 * NOTE: This route must come before the generic /:id route to ensure proper matching
 */
router.get('/:id/preview', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name email avatar bio')
      .populate('categoryId', 'name slug description');

    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Check if user owns this post
    const authorId = post.authorId._id ? post.authorId._id.toString() : post.authorId.toString();
    if (authorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to preview this post', 403);
    }

    sendSuccess(res, { post }, 'Post preview retrieved successfully', 200);
  } catch (error) {
    console.error('Get post preview error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid post ID', 400);
    }
    
    sendError(res, 'Failed to retrieve post preview', 500);
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post by ID
 * @access  Private (Author only - can see own posts)
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name email avatar bio')
      .populate('categoryId', 'name slug');

    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Check if user owns this post
    if (post.authorId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to access this post', 403);
    }

    sendSuccess(res, { post }, 'Post retrieved successfully', 200);
  } catch (error) {
    console.error('Get post error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid post ID', 400);
    }
    
    sendError(res, 'Failed to retrieve post', 500);
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create new post
 * @access  Private (Author only)
 */
router.post(
  '/',
  protect,
  authorize('author', 'admin'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .optional()
      .isArray()
      .withMessage('Content must be an array'),
    body('excerpt')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Excerpt cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be draft or published'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (!Array.isArray(tags)) {
          throw new Error('Tags must be an array');
        }
        if (tags.length > 20) {
          throw new Error('Cannot have more than 20 tags');
        }
        // Validate each tag
        tags.forEach((tag, index) => {
          if (typeof tag !== 'string') {
            throw new Error(`Tag at index ${index} must be a string`);
          }
          const trimmed = tag.trim();
          if (trimmed.length < 1 || trimmed.length > 50) {
            throw new Error(`Tag at index ${index} must be between 1 and 50 characters`);
          }
          if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
            throw new Error(`Tag at index ${index} can only contain letters, numbers, spaces, hyphens, and underscores`);
          }
        });
        return true;
      }),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('featuredImage')
      .optional()
      .isURL()
      .withMessage('Featured image must be a valid URL'),
    body('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be a boolean')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      let { title, content = [], excerpt = '', status = 'draft', tags = [], categoryId, featuredImage, featured = false } = req.body;

      // Validate category if provided
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return sendError(res, 'Invalid category ID', 400);
        }
      }

      // Validate and sanitize content blocks
      if (content && Array.isArray(content) && content.length > 0) {
        const validationResult = validateBlocks(content);
        if (!validationResult.valid) {
          return sendError(res, `Content validation failed: ${validationResult.errors.join(', ')}`, 400);
        }
        content = sanitizeBlocks(content);
      }

      // Generate unique slug
      const baseSlug = generateSlug(title);
      const slug = await generateUniqueSlug(baseSlug, checkSlugExists);

      // Normalize tags (trim, lowercase, remove duplicates)
      const normalizedTags = tags && Array.isArray(tags)
        ? [...new Set(tags.map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '').filter(tag => tag.length > 0))]
        : [];

      // Create post
      const post = new Post({
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt.trim(),
        status,
        tags: normalizedTags,
        categoryId: categoryId || null,
        featuredImage: featuredImage || null,
        featured: featured === true,
        authorId: req.user._id
      });

      await post.save();

      // Populate references
      await post.populate('authorId', 'name email avatar');
      await post.populate('categoryId', 'name slug');

      sendSuccess(res, { post }, 'Post created successfully', 201);
    } catch (error) {
      console.error('Create post error:', error);
      
      if (error.name === 'ValidationError') {
        return sendError(res, Object.values(error.errors)[0].message, 400);
      }
      
      if (error.code === 11000) {
        return sendError(res, 'A post with this slug already exists', 400);
      }
      
      sendError(res, 'Failed to create post', 500);
    }
  }
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post
 * @access  Private (Author only - can update own posts)
 */
router.put(
  '/:id',
  protect,
  authorize('author', 'admin'),
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .optional()
      .isArray()
      .withMessage('Content must be an array'),
    body('excerpt')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Excerpt cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be draft or published'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (!Array.isArray(tags)) {
          throw new Error('Tags must be an array');
        }
        if (tags.length > 20) {
          throw new Error('Cannot have more than 20 tags');
        }
        // Validate each tag
        tags.forEach((tag, index) => {
          if (typeof tag !== 'string') {
            throw new Error(`Tag at index ${index} must be a string`);
          }
          const trimmed = tag.trim();
          if (trimmed.length < 1 || trimmed.length > 50) {
            throw new Error(`Tag at index ${index} must be between 1 and 50 characters`);
          }
          if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
            throw new Error(`Tag at index ${index} can only contain letters, numbers, spaces, hyphens, and underscores`);
          }
        });
        return true;
      }),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('featuredImage')
      .optional()
      .isURL()
      .withMessage('Featured image must be a valid URL')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const post = await Post.findById(req.params.id);

      if (!post) {
        return sendError(res, 'Post not found', 404);
      }

      // Check if user owns this post
      if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return sendError(res, 'Not authorized to update this post', 403);
      }

      const { title, content, excerpt, status, tags, categoryId, featuredImage, featured } = req.body;

      // Validate category if provided
      if (categoryId !== undefined) {
        if (categoryId === null || categoryId === '') {
          post.categoryId = null;
        } else {
          const category = await Category.findById(categoryId);
          if (!category) {
            return sendError(res, 'Invalid category ID', 400);
          }
          post.categoryId = categoryId;
        }
      }

      // Update fields
      if (title !== undefined) {
        post.title = title.trim();
        // Regenerate slug if title changed
        const baseSlug = generateSlug(post.title);
        post.slug = await generateUniqueSlug(baseSlug, checkSlugExists, post._id.toString());
      }

      if (content !== undefined) {
        // Validate and sanitize content blocks
        if (Array.isArray(content) && content.length > 0) {
          const validationResult = validateBlocks(content);
          if (!validationResult.valid) {
            return sendError(res, `Content validation failed: ${validationResult.errors.join(', ')}`, 400);
          }
          post.content = sanitizeBlocks(content);
        } else {
          post.content = [];
        }
      }

      if (excerpt !== undefined) {
        post.excerpt = excerpt.trim();
      }

      if (status !== undefined) {
        post.status = status;
      }

      if (tags !== undefined) {
        // Normalize tags (trim, lowercase, remove duplicates)
        const normalizedTags = Array.isArray(tags)
          ? [...new Set(tags.map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '').filter(tag => tag.length > 0))]
          : [];
        post.tags = normalizedTags;
      }

      if (featuredImage !== undefined) {
        post.featuredImage = featuredImage || null;
      }

      if (featured !== undefined) {
        post.featured = featured === true;
      }

      await post.save();

      // Populate references
      await post.populate('authorId', 'name email avatar bio');
      await post.populate('categoryId', 'name slug');

      sendSuccess(res, { post }, 'Post updated successfully', 200);
    } catch (error) {
      console.error('Update post error:', error);
      
      if (error.name === 'ValidationError') {
        return sendError(res, Object.values(error.errors)[0].message, 400);
      }
      
      if (error.code === 11000) {
        return sendError(res, 'A post with this slug already exists', 400);
      }
      
      sendError(res, 'Failed to update post', 500);
    }
  }
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private (Author only - can delete own posts)
 */
router.delete('/:id', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Check if user owns this post
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this post', 403);
    }

    await Post.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, 'Post deleted successfully', 200);
  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid post ID', 400);
    }
    
    sendError(res, 'Failed to delete post', 500);
  }
});

/**
 * @route   PATCH /api/posts/:id/publish
 * @desc    Publish a post
 * @access  Private (Author only - can publish own posts)
 */
router.patch('/:id/publish', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Check if user owns this post
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to publish this post', 403);
    }

    post.status = 'published';
    if (!post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();

    // Populate references
    await post.populate('authorId', 'name email avatar bio');
    await post.populate('categoryId', 'name slug');

    sendSuccess(res, { post }, 'Post published successfully', 200);
  } catch (error) {
    console.error('Publish post error:', error);
    sendError(res, 'Failed to publish post', 500);
  }
});

/**
 * @route   PATCH /api/posts/:id/unpublish
 * @desc    Unpublish a post
 * @access  Private (Author only - can unpublish own posts)
 */
router.patch('/:id/unpublish', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendError(res, 'Post not found', 404);
    }

    // Check if user owns this post
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to unpublish this post', 403);
    }

    post.status = 'draft';
    post.publishedAt = null;

    await post.save();

    // Populate references
    await post.populate('authorId', 'name email avatar bio');
    await post.populate('categoryId', 'name slug');

    sendSuccess(res, { post }, 'Post unpublished successfully', 200);
  } catch (error) {
    console.error('Unpublish post error:', error);
    sendError(res, 'Failed to unpublish post', 500);
  }
});

export default router;
