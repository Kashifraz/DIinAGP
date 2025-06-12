import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Category from '../models/Category.js';
import Post from '../models/Post.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { generateSlug, generateUniqueSlug } from '../utils/slugGenerator.js';

const router = express.Router();

/**
 * Helper function to check if slug exists
 */
const checkSlugExists = async (slug, excludeId = null) => {
  const query = { slug: slug.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const category = await Category.findOne(query);
  return !!category;
};

/**
 * Helper function to check if name exists
 */
const checkNameExists = async (name, excludeId = null) => {
  const query = { name: name.trim() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const category = await Category.findOne(query);
  return !!category;
};

/**
 * @route   GET /api/categories/public
 * @desc    Get all categories (public endpoint)
 * @access  Public
 */
router.get('/public', async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .select('name slug description');

    sendSuccess(res, { categories }, 'Categories retrieved successfully', 200);
  } catch (error) {
    console.error('Get public categories error:', error);
    sendError(res, 'Failed to retrieve categories', 500);
  }
});

/**
 * @route   GET /api/categories
 * @desc    Get all categories (with optional filters)
 * @access  Private (Author only)
 */
router.get(
  '/',
  protect,
  authorize('author', 'admin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const { page = 1, limit = 100, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const categories = await Category.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Category.countDocuments(query);

      // Get post counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const postCount = await Post.countDocuments({ categoryId: category._id });
          return {
            ...category.toObject(),
            postCount
          };
        })
      );

      sendSuccess(
        res,
        {
          categories: categoriesWithCounts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        },
        'Categories retrieved successfully',
        200
      );
    } catch (error) {
      console.error('Get categories error:', error);
      sendError(res, 'Failed to retrieve categories', 500);
    }
  }
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Private (Author only)
 */
router.get('/:id', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    // Get post count for this category
    const postCount = await Post.countDocuments({ categoryId: category._id });

    sendSuccess(
      res,
      { category: { ...category.toObject(), postCount } },
      'Category retrieved successfully',
      200
    );
  } catch (error) {
    console.error('Get category error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid category ID', 400);
    }
    
    sendError(res, 'Failed to retrieve category', 500);
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Author only)
 */
router.post(
  '/',
  protect,
  authorize('author', 'admin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 100 })
      .withMessage('Category name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('slug')
      .optional()
      .trim()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage('Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const { name, description = '', slug } = req.body;

      // Check if name already exists
      const nameExists = await checkNameExists(name);
      if (nameExists) {
        return sendError(res, 'A category with this name already exists', 409);
      }

      // Generate slug from name if not provided
      let categorySlug = slug;
      if (!categorySlug) {
        const baseSlug = generateSlug(name);
        categorySlug = await generateUniqueSlug(baseSlug, checkSlugExists);
      } else {
        // Check if slug already exists
        const slugExists = await checkSlugExists(categorySlug);
        if (slugExists) {
          return sendError(res, 'A category with this slug already exists', 409);
        }
      }

      // Create category
      const category = await Category.create({
        name: name.trim(),
        slug: categorySlug.toLowerCase(),
        description: description.trim()
      });

      sendSuccess(res, { category }, 'Category created successfully', 201);
    } catch (error) {
      console.error('Create category error:', error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return sendError(res, messages.join(', '), 400);
      }
      
      if (error.code === 11000) {
        // Duplicate key error
        if (error.keyPattern.name) {
          return sendError(res, 'A category with this name already exists', 409);
        }
        if (error.keyPattern.slug) {
          return sendError(res, 'A category with this slug already exists', 409);
        }
      }
      
      sendError(res, 'Failed to create category', 500);
    }
  }
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Author only)
 */
router.put(
  '/:id',
  protect,
  authorize('author', 'admin'),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Category name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('slug')
      .optional()
      .trim()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage('Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const category = await Category.findById(req.params.id);

      if (!category) {
        return sendError(res, 'Category not found', 404);
      }

      const { name, description, slug } = req.body;

      // Update name if provided
      if (name !== undefined) {
        // Check if new name already exists (excluding current category)
        const nameExists = await checkNameExists(name, category._id);
        if (nameExists) {
          return sendError(res, 'A category with this name already exists', 409);
        }
        category.name = name.trim();
        // Auto-generate slug if name changed and slug not provided
        if (!slug) {
          const baseSlug = generateSlug(name);
          category.slug = await generateUniqueSlug(baseSlug, checkSlugExists, category._id);
        }
      }

      // Update slug if provided
      if (slug !== undefined) {
        // Check if new slug already exists (excluding current category)
        const slugExists = await checkSlugExists(slug, category._id);
        if (slugExists) {
          return sendError(res, 'A category with this slug already exists', 409);
        }
        category.slug = slug.toLowerCase();
      }

      // Update description if provided
      if (description !== undefined) {
        category.description = description.trim();
      }

      await category.save();

      sendSuccess(res, { category }, 'Category updated successfully', 200);
    } catch (error) {
      console.error('Update category error:', error);
      
      if (error.name === 'CastError') {
        return sendError(res, 'Invalid category ID', 400);
      }
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return sendError(res, messages.join(', '), 400);
      }
      
      if (error.code === 11000) {
        // Duplicate key error
        if (error.keyPattern.name) {
          return sendError(res, 'A category with this name already exists', 409);
        }
        if (error.keyPattern.slug) {
          return sendError(res, 'A category with this slug already exists', 409);
        }
      }
      
      sendError(res, 'Failed to update category', 500);
    }
  }
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Author only)
 */
router.delete('/:id', protect, authorize('author', 'admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    // Check if category has associated posts
    const postCount = await Post.countDocuments({ categoryId: category._id });
    if (postCount > 0) {
      return sendError(
        res,
        `Cannot delete category. It is associated with ${postCount} post(s). Please remove or reassign posts before deleting.`,
        400
      );
    }

    await Category.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, 'Category deleted successfully', 200);
  } catch (error) {
    console.error('Delete category error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid category ID', 400);
    }
    
    sendError(res, 'Failed to delete category', 500);
  }
});

export default router;

