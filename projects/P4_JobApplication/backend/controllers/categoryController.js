const Category = require('../models/Category');
const JobPosting = require('../models/JobPosting');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all categories (public)
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const { level, parent, hierarchy } = req.query;
  
  let query = { isActive: true };
  
  if (level !== undefined) {
    query.level = parseInt(level);
  }
  
  if (parent !== undefined) {
    if (parent === 'null' || parent === '') {
      query.parentCategory = null;
    } else {
      query.parentCategory = parent;
    }
  }

  let categories;
  
  if (hierarchy === 'true') {
    categories = await Category.getCategoryHierarchy();
  } else {
    categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
  }

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Populate subcategories
  const subcategories = await Category.findSubcategories(category._id);
  
  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      subcategories
    }
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if category has subcategories
  const subcategories = await Category.findSubcategories(category._id);
  if (subcategories.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with subcategories'
    });
  }

  // Check if category has jobs
  const jobCount = await JobPosting.countDocuments({ category: category._id });
  if (jobCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category with ${jobCount} job(s). Please reassign jobs first.`
    });
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Public
exports.getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await Category.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'jobpostings',
        localField: '_id',
        foreignField: 'category',
        as: 'jobs'
      }
    },
    {
      $project: {
        name: 1,
        level: 1,
        jobCount: { $size: '$jobs' },
        activeJobs: {
          $size: {
            $filter: {
              input: '$jobs',
              cond: { $eq: ['$$this.status', 'active'] }
            }
          }
        }
      }
    },
    { $sort: { jobCount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
exports.reorderCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body;
  
  if (!Array.isArray(categories)) {
    return res.status(400).json({
      success: false,
      message: 'Categories must be an array'
    });
  }

  const updatePromises = categories.map((cat, index) => 
    Category.findByIdAndUpdate(cat.id, { sortOrder: index })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully'
  });
});
