const { Publication } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get user publications
// @route   GET /api/publications
// @access  Private
const getPublications = asyncHandler(async (req, res) => {
  const publications = await Publication.getUserPublications(req.user.id);
  
  res.status(200).json({
    success: true,
    count: publications.length,
    data: publications
  });
});

// @desc    Get single publication
// @route   GET /api/publications/:id
// @access  Private
const getPublicationById = asyncHandler(async (req, res) => {
  const publication = await Publication.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!publication) {
    return res.status(404).json({
      success: false,
      message: 'Publication not found'
    });
  }

  res.status(200).json({
    success: true,
    data: publication
  });
});

// @desc    Create new publication
// @route   POST /api/publications
// @access  Private
const createPublication = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const publicationData = {
    ...req.body,
    user: req.user.id
  };

  const publication = await Publication.create(publicationData);

  res.status(201).json({
    success: true,
    data: publication
  });
});

// @desc    Update publication
// @route   PUT /api/publications/:id
// @access  Private
const updatePublication = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let publication = await Publication.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!publication) {
    return res.status(404).json({
      success: false,
      message: 'Publication not found'
    });
  }

  publication = await Publication.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: publication
  });
});

// @desc    Delete publication
// @route   DELETE /api/publications/:id
// @access  Private
const deletePublication = asyncHandler(async (req, res) => {
  const publication = await Publication.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!publication) {
    return res.status(404).json({
      success: false,
      message: 'Publication not found'
    });
  }

  // Soft delete
  await Publication.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Publication deleted successfully'
  });
});

// @desc    Reorder publications
// @route   PUT /api/publications/reorder
// @access  Private
const reorderPublications = asyncHandler(async (req, res) => {
  const { publicationIds } = req.body;

  if (!publicationIds || !Array.isArray(publicationIds)) {
    return res.status(400).json({
      success: false,
      message: 'Publication IDs array is required'
    });
  }

  await Publication.reorderPublications(req.user.id, publicationIds);

  const publications = await Publication.getUserPublications(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Publications reordered successfully',
    data: publications
  });
});

// @desc    Move publication up
// @route   PUT /api/publications/:id/move-up
// @access  Private
const movePublicationUp = asyncHandler(async (req, res) => {
  const publications = await Publication.getUserPublications(req.user.id);
  const currentIndex = publications.findIndex(pub => pub._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Publication not found'
    });
  }

  if (currentIndex === 0) {
    return res.status(400).json({
      success: false,
      message: 'Publication is already at the top'
    });
  }

  // Swap with previous publication
  const publicationIds = publications.map(pub => pub._id.toString());
  [publicationIds[currentIndex], publicationIds[currentIndex - 1]] = 
  [publicationIds[currentIndex - 1], publicationIds[currentIndex]];

  await Publication.reorderPublications(req.user.id, publicationIds);

  const updatedPublications = await Publication.getUserPublications(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Publication moved up successfully',
    data: updatedPublications
  });
});

// @desc    Move publication down
// @route   PUT /api/publications/:id/move-down
// @access  Private
const movePublicationDown = asyncHandler(async (req, res) => {
  const publications = await Publication.getUserPublications(req.user.id);
  const currentIndex = publications.findIndex(pub => pub._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Publication not found'
    });
  }

  if (currentIndex === publications.length - 1) {
    return res.status(400).json({
      success: false,
      message: 'Publication is already at the bottom'
    });
  }

  // Swap with next publication
  const publicationIds = publications.map(pub => pub._id.toString());
  [publicationIds[currentIndex], publicationIds[currentIndex + 1]] = 
  [publicationIds[currentIndex + 1], publicationIds[currentIndex]];

  await Publication.reorderPublications(req.user.id, publicationIds);

  const updatedPublications = await Publication.getUserPublications(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Publication moved down successfully',
    data: updatedPublications
  });
});

// @desc    Get publications statistics
// @route   GET /api/publications/stats
// @access  Private
const getPublicationsStats = asyncHandler(async (req, res) => {
  const publications = await Publication.getUserPublications(req.user.id);

  const stats = {
    totalPublications: publications.length,
    publicationTypes: {},
    totalCitations: 0,
    averageCitations: 0,
    recentPublications: 0
  };

  const currentYear = new Date().getFullYear();
  const oneYearAgo = new Date(currentYear - 1, 0, 1);

  publications.forEach(publication => {
    // Count publication types
    stats.publicationTypes[publication.type] = 
      (stats.publicationTypes[publication.type] || 0) + 1;
    
    // Count citations
    stats.totalCitations += publication.citationCount || 0;
    
    // Count recent publications
    if (publication.publicationDate >= oneYearAgo) {
      stats.recentPublications++;
    }
  });

  stats.averageCitations = stats.totalPublications > 0 
    ? Math.round(stats.totalCitations / stats.totalPublications * 100) / 100 
    : 0;

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export publications
// @route   GET /api/publications/export
// @access  Private
const exportPublications = asyncHandler(async (req, res) => {
  const publications = await Publication.getUserPublications(req.user.id);

  const exportData = publications.map(publication => ({
    title: publication.title,
    type: publication.type,
    authors: publication.authors.map(author => ({
      name: author.name,
      isPrimary: author.isPrimary,
      affiliation: author.affiliation
    })),
    publisher: publication.publisher,
    publicationDate: publication.publicationDate,
    doi: publication.doi,
    url: publication.url,
    citationCount: publication.citationCount,
    keywords: publication.keywords
  }));

  res.status(200).json({
    success: true,
    data: exportData,
    filename: `publications_${new Date().toISOString().split('T')[0]}.json`
  });
});

module.exports = {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  reorderPublications,
  movePublicationUp,
  movePublicationDown,
  getPublicationsStats,
  exportPublications
};
