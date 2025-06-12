const { Reference } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get user references
// @route   GET /api/references
// @access  Private
const getReferences = asyncHandler(async (req, res) => {
  const references = await Reference.getUserReferences(req.user.id);
  
  res.status(200).json({
    success: true,
    count: references.length,
    data: references
  });
});

// @desc    Get single reference
// @route   GET /api/references/:id
// @access  Private
const getReferenceById = asyncHandler(async (req, res) => {
  const reference = await Reference.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!reference) {
    return res.status(404).json({
      success: false,
      message: 'Reference not found'
    });
  }

  res.status(200).json({
    success: true,
    data: reference
  });
});

// @desc    Create new reference
// @route   POST /api/references
// @access  Private
const createReference = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const referenceData = {
    ...req.body,
    user: req.user.id
  };

  const reference = await Reference.create(referenceData);

  res.status(201).json({
    success: true,
    data: reference
  });
});

// @desc    Update reference
// @route   PUT /api/references/:id
// @access  Private
const updateReference = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let reference = await Reference.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!reference) {
    return res.status(404).json({
      success: false,
      message: 'Reference not found'
    });
  }

  reference = await Reference.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: reference
  });
});

// @desc    Delete reference
// @route   DELETE /api/references/:id
// @access  Private
const deleteReference = asyncHandler(async (req, res) => {
  const reference = await Reference.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!reference) {
    return res.status(404).json({
      success: false,
      message: 'Reference not found'
    });
  }

  // Soft delete
  await Reference.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Reference deleted successfully'
  });
});

// @desc    Reorder references
// @route   PUT /api/references/reorder
// @access  Private
const reorderReferences = asyncHandler(async (req, res) => {
  const { referenceIds } = req.body;

  if (!referenceIds || !Array.isArray(referenceIds)) {
    return res.status(400).json({
      success: false,
      message: 'Reference IDs array is required'
    });
  }

  await Reference.reorderReferences(req.user.id, referenceIds);

  const references = await Reference.getUserReferences(req.user.id);

  res.status(200).json({
    success: true,
    message: 'References reordered successfully',
    data: references
  });
});

// @desc    Move reference up
// @route   PUT /api/references/:id/move-up
// @access  Private
const moveReferenceUp = asyncHandler(async (req, res) => {
  const references = await Reference.getUserReferences(req.user.id);
  const currentIndex = references.findIndex(ref => ref._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reference not found'
    });
  }

  if (currentIndex === 0) {
    return res.status(400).json({
      success: false,
      message: 'Reference is already at the top'
    });
  }

  // Swap with previous reference
  const referenceIds = references.map(ref => ref._id.toString());
  [referenceIds[currentIndex], referenceIds[currentIndex - 1]] = 
  [referenceIds[currentIndex - 1], referenceIds[currentIndex]];

  await Reference.reorderReferences(req.user.id, referenceIds);

  const updatedReferences = await Reference.getUserReferences(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Reference moved up successfully',
    data: updatedReferences
  });
});

// @desc    Move reference down
// @route   PUT /api/references/:id/move-down
// @access  Private
const moveReferenceDown = asyncHandler(async (req, res) => {
  const references = await Reference.getUserReferences(req.user.id);
  const currentIndex = references.findIndex(ref => ref._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reference not found'
    });
  }

  if (currentIndex === references.length - 1) {
    return res.status(400).json({
      success: false,
      message: 'Reference is already at the bottom'
    });
  }

  // Swap with next reference
  const referenceIds = references.map(ref => ref._id.toString());
  [referenceIds[currentIndex], referenceIds[currentIndex + 1]] = 
  [referenceIds[currentIndex + 1], referenceIds[currentIndex]];

  await Reference.reorderReferences(req.user.id, referenceIds);

  const updatedReferences = await Reference.getUserReferences(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Reference moved down successfully',
    data: updatedReferences
  });
});

// @desc    Get references statistics
// @route   GET /api/references/stats
// @access  Private
const getReferencesStats = asyncHandler(async (req, res) => {
  const references = await Reference.getUserReferences(req.user.id);

  const stats = {
    totalReferences: references.length,
    relationshipTypes: {},
    availableReferences: 0,
    averageYearsKnown: 0,
    contactMethods: {}
  };

  let totalYearsKnown = 0;
  let referencesWithYears = 0;

  references.forEach(reference => {
    // Count relationship types
    stats.relationshipTypes[reference.relationship] = 
      (stats.relationshipTypes[reference.relationship] || 0) + 1;
    
    // Count available references
    if (reference.isAvailable) {
      stats.availableReferences++;
    }
    
    // Count contact methods
    stats.contactMethods[reference.preferredContactMethod] = 
      (stats.contactMethods[reference.preferredContactMethod] || 0) + 1;
    
    // Calculate average years known
    if (reference.yearsKnown) {
      totalYearsKnown += reference.yearsKnown;
      referencesWithYears++;
    }
  });

  stats.averageYearsKnown = referencesWithYears > 0 
    ? Math.round(totalYearsKnown / referencesWithYears * 10) / 10 
    : 0;

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export references
// @route   GET /api/references/export
// @access  Private
const exportReferences = asyncHandler(async (req, res) => {
  const references = await Reference.getUserReferences(req.user.id);

  const exportData = references.map(reference => ({
    name: reference.name,
    title: reference.title,
    company: reference.company,
    email: reference.email,
    phone: reference.phone,
    relationship: reference.relationship,
    relationshipDescription: reference.relationshipDescription,
    yearsKnown: reference.yearsKnown,
    isAvailable: reference.isAvailable,
    preferredContactMethod: reference.preferredContactMethod,
    notes: reference.notes
  }));

  res.status(200).json({
    success: true,
    data: exportData,
    filename: `references_${new Date().toISOString().split('T')[0]}.json`
  });
});

module.exports = {
  getReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
  reorderReferences,
  moveReferenceUp,
  moveReferenceDown,
  getReferencesStats,
  exportReferences
};
