const { Award } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get user awards
// @route   GET /api/awards
// @access  Private
const getAwards = asyncHandler(async (req, res) => {
  const awards = await Award.getUserAwards(req.user.id);
  
  res.status(200).json({
    success: true,
    count: awards.length,
    data: awards
  });
});

// @desc    Get single award
// @route   GET /api/awards/:id
// @access  Private
const getAwardById = asyncHandler(async (req, res) => {
  const award = await Award.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!award) {
    return res.status(404).json({
      success: false,
      message: 'Award not found'
    });
  }

  res.status(200).json({
    success: true,
    data: award
  });
});

// @desc    Create new award
// @route   POST /api/awards
// @access  Private
const createAward = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const awardData = {
    ...req.body,
    user: req.user.id
  };

  const award = await Award.create(awardData);

  res.status(201).json({
    success: true,
    data: award
  });
});

// @desc    Update award
// @route   PUT /api/awards/:id
// @access  Private
const updateAward = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let award = await Award.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!award) {
    return res.status(404).json({
      success: false,
      message: 'Award not found'
    });
  }

  award = await Award.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: award
  });
});

// @desc    Delete award
// @route   DELETE /api/awards/:id
// @access  Private
const deleteAward = asyncHandler(async (req, res) => {
  const award = await Award.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!award) {
    return res.status(404).json({
      success: false,
      message: 'Award not found'
    });
  }

  // Soft delete
  await Award.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Award deleted successfully'
  });
});

// @desc    Reorder awards
// @route   PUT /api/awards/reorder
// @access  Private
const reorderAwards = asyncHandler(async (req, res) => {
  const { awardIds } = req.body;

  if (!awardIds || !Array.isArray(awardIds)) {
    return res.status(400).json({
      success: false,
      message: 'Award IDs array is required'
    });
  }

  await Award.reorderAwards(req.user.id, awardIds);

  const awards = await Award.getUserAwards(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Awards reordered successfully',
    data: awards
  });
});

// @desc    Move award up
// @route   PUT /api/awards/:id/move-up
// @access  Private
const moveAwardUp = asyncHandler(async (req, res) => {
  const awards = await Award.getUserAwards(req.user.id);
  const currentIndex = awards.findIndex(award => award._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Award not found'
    });
  }

  if (currentIndex === 0) {
    return res.status(400).json({
      success: false,
      message: 'Award is already at the top'
    });
  }

  // Swap with previous award
  const awardIds = awards.map(award => award._id.toString());
  [awardIds[currentIndex], awardIds[currentIndex - 1]] = 
  [awardIds[currentIndex - 1], awardIds[currentIndex]];

  await Award.reorderAwards(req.user.id, awardIds);

  const updatedAwards = await Award.getUserAwards(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Award moved up successfully',
    data: updatedAwards
  });
});

// @desc    Move award down
// @route   PUT /api/awards/:id/move-down
// @access  Private
const moveAwardDown = asyncHandler(async (req, res) => {
  const awards = await Award.getUserAwards(req.user.id);
  const currentIndex = awards.findIndex(award => award._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Award not found'
    });
  }

  if (currentIndex === awards.length - 1) {
    return res.status(400).json({
      success: false,
      message: 'Award is already at the bottom'
    });
  }

  // Swap with next award
  const awardIds = awards.map(award => award._id.toString());
  [awardIds[currentIndex], awardIds[currentIndex + 1]] = 
  [awardIds[currentIndex + 1], awardIds[currentIndex]];

  await Award.reorderAwards(req.user.id, awardIds);

  const updatedAwards = await Award.getUserAwards(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Award moved down successfully',
    data: updatedAwards
  });
});

// @desc    Get awards statistics
// @route   GET /api/awards/stats
// @access  Private
const getAwardsStats = asyncHandler(async (req, res) => {
  const awards = await Award.getUserAwards(req.user.id);

  const stats = {
    totalAwards: awards.length,
    awardCategories: {},
    totalValue: 0,
    averageValue: 0,
    recentAwards: 0
  };

  const currentYear = new Date().getFullYear();
  const oneYearAgo = new Date(currentYear - 1, 0, 1);

  awards.forEach(award => {
    // Count award categories
    stats.awardCategories[award.category] = 
      (stats.awardCategories[award.category] || 0) + 1;
    
    // Sum award values
    if (award.value && award.value.amount) {
      stats.totalValue += award.value.amount;
    }
    
    // Count recent awards
    if (award.dateReceived >= oneYearAgo) {
      stats.recentAwards++;
    }
  });

  stats.averageValue = stats.totalAwards > 0 
    ? Math.round(stats.totalValue / stats.totalAwards * 100) / 100 
    : 0;

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export awards
// @route   GET /api/awards/export
// @access  Private
const exportAwards = asyncHandler(async (req, res) => {
  const awards = await Award.getUserAwards(req.user.id);

  const exportData = awards.map(award => ({
    title: award.title,
    description: award.description,
    issuer: award.issuer,
    category: award.category,
    dateReceived: award.dateReceived,
    location: award.location,
    value: award.value,
    url: award.url,
    certificateUrl: award.certificateUrl
  }));

  res.status(200).json({
    success: true,
    data: exportData,
    filename: `awards_${new Date().toISOString().split('T')[0]}.json`
  });
});

module.exports = {
  getAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward,
  reorderAwards,
  moveAwardUp,
  moveAwardDown,
  getAwardsStats,
  exportAwards
};
