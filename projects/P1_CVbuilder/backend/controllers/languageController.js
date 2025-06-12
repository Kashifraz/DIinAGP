const { Language } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get user languages
// @route   GET /api/languages
// @access  Private
const getLanguages = asyncHandler(async (req, res) => {
  console.log('Backend: Getting languages for user:', req.user.id);
  const languages = await Language.find({ user: req.user.id, isActive: true })
    .sort({ order: 1, createdAt: -1 });
  console.log('Backend: Found languages:', languages);
  
  res.status(200).json({
    success: true,
    count: languages.length,
    data: languages
  });
});

// @desc    Get single language
// @route   GET /api/languages/:id
// @access  Private
const getLanguageById = asyncHandler(async (req, res) => {
  const language = await Language.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!language) {
    return res.status(404).json({
      success: false,
      message: 'Language not found'
    });
  }

  res.status(200).json({
    success: true,
    data: language
  });
});

// @desc    Create new language
// @route   POST /api/languages
// @access  Private
const createLanguage = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const languageData = {
    ...req.body,
    user: req.user.id
  };

  const language = await Language.create(languageData);

  res.status(201).json({
    success: true,
    data: language
  });
});

// @desc    Update language
// @route   PUT /api/languages/:id
// @access  Private
const updateLanguage = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let language = await Language.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!language) {
    return res.status(404).json({
      success: false,
      message: 'Language not found'
    });
  }

  language = await Language.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: language
  });
});

// @desc    Delete language
// @route   DELETE /api/languages/:id
// @access  Private
const deleteLanguage = asyncHandler(async (req, res) => {
  const language = await Language.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!language) {
    return res.status(404).json({
      success: false,
      message: 'Language not found'
    });
  }

  // Soft delete
  await Language.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Language deleted successfully'
  });
});

// @desc    Reorder languages
// @route   PUT /api/languages/reorder
// @access  Private
const reorderLanguages = asyncHandler(async (req, res) => {
  const { languageIds } = req.body;

  if (!languageIds || !Array.isArray(languageIds)) {
    return res.status(400).json({
      success: false,
      message: 'Language IDs array is required'
    });
  }

  await Language.reorderLanguages(req.user.id, languageIds);

  const languages = await Language.getUserLanguages(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Languages reordered successfully',
    data: languages
  });
});

// @desc    Move language up
// @route   PUT /api/languages/:id/move-up
// @access  Private
const moveLanguageUp = asyncHandler(async (req, res) => {
  const languages = await Language.getUserLanguages(req.user.id);
  const currentIndex = languages.findIndex(lang => lang._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Language not found'
    });
  }

  if (currentIndex === 0) {
    return res.status(400).json({
      success: false,
      message: 'Language is already at the top'
    });
  }

  // Swap with previous language
  const languageIds = languages.map(lang => lang._id.toString());
  [languageIds[currentIndex], languageIds[currentIndex - 1]] = 
  [languageIds[currentIndex - 1], languageIds[currentIndex]];

  await Language.reorderLanguages(req.user.id, languageIds);

  const updatedLanguages = await Language.getUserLanguages(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Language moved up successfully',
    data: updatedLanguages
  });
});

// @desc    Move language down
// @route   PUT /api/languages/:id/move-down
// @access  Private
const moveLanguageDown = asyncHandler(async (req, res) => {
  const languages = await Language.getUserLanguages(req.user.id);
  const currentIndex = languages.findIndex(lang => lang._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Language not found'
    });
  }

  if (currentIndex === languages.length - 1) {
    return res.status(400).json({
      success: false,
      message: 'Language is already at the bottom'
    });
  }

  // Swap with next language
  const languageIds = languages.map(lang => lang._id.toString());
  [languageIds[currentIndex], languageIds[currentIndex + 1]] = 
  [languageIds[currentIndex + 1], languageIds[currentIndex]];

  await Language.reorderLanguages(req.user.id, languageIds);

  const updatedLanguages = await Language.getUserLanguages(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Language moved down successfully',
    data: updatedLanguages
  });
});

// @desc    Get languages statistics
// @route   GET /api/languages/stats
// @access  Private
const getLanguagesStats = asyncHandler(async (req, res) => {
  const languages = await Language.getUserLanguages(req.user.id);

  const stats = {
    totalLanguages: languages.length,
    proficiencyLevels: {},
    totalCertifications: 0,
    languagesWithCertifications: 0
  };

  languages.forEach(language => {
    // Count proficiency levels
    stats.proficiencyLevels[language.proficiency] = 
      (stats.proficiencyLevels[language.proficiency] || 0) + 1;
    
    // Count certifications
    if (language.certifications && language.certifications.length > 0) {
      stats.totalCertifications += language.certifications.length;
      stats.languagesWithCertifications++;
    }
  });

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export languages
// @route   GET /api/languages/export
// @access  Private
const exportLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.getUserLanguages(req.user.id);

  const exportData = languages.map(language => ({
    name: language.name,
    proficiency: language.proficiency,
    proficiencyLevel: language.proficiencyLevel,
    certifications: language.certifications.map(cert => ({
      name: cert.name,
      issuer: cert.issuer,
      dateObtained: cert.dateObtained,
      credentialId: cert.credentialId
    })),
    createdAt: language.createdAt
  }));

  res.status(200).json({
    success: true,
    data: exportData,
    filename: `languages_${new Date().toISOString().split('T')[0]}.json`
  });
});

module.exports = {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  reorderLanguages,
  moveLanguageUp,
  moveLanguageDown,
  getLanguagesStats,
  exportLanguages
};
