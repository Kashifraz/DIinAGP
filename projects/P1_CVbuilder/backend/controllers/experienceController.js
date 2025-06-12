const Experience = require('../models/Experience');
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

/**
 * Get all experience entries for the current user
 */
const getExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.getUserExperience(req.user.id);
  
  logger.info('Experience retrieved', { 
    userId: req.user.id, 
    count: experience.length 
  });
  
  successResponse(res, 200, 'Experience retrieved successfully', experience);
});

/**
 * Get a specific experience entry
 */
const getExperienceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const experience = await Experience.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });
  
  if (!experience) {
    return errorResponse(res, 404, 'Experience entry not found');
  }
  
  logger.info('Experience entry retrieved', { 
    experienceId: id, 
    userId: req.user.id 
  });
  
  successResponse(res, 200, 'Experience entry retrieved successfully', experience);
});

/**
 * Create a new experience entry
 */
const createExperience = asyncHandler(async (req, res) => {
  const {
    company,
    position,
    location,
    startDate,
    endDate,
    isCurrent,
    description,
    achievements,
    skills,
    employmentType
  } = req.body;

  const experience = new Experience({
    user: req.user.id,
    company,
    position,
    location,
    startDate,
    endDate,
    isCurrent,
    description,
    achievements: achievements || [],
    skills: skills || [],
    employmentType
  });

  await experience.save();
  
  logger.info('Experience entry created', { 
    experienceId: experience._id, 
    userId: req.user.id 
  });
  
  successResponse(res, 201, 'Experience entry created successfully', experience);
});

/**
 * Update an existing experience entry
 */
const updateExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    company,
    position,
    location,
    startDate,
    endDate,
    isCurrent,
    description,
    achievements,
    skills,
    employmentType
  } = req.body;

  const experience = await Experience.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });

  if (!experience) {
    return errorResponse(res, 404, 'Experience entry not found');
  }

  // Update fields
  experience.company = company !== undefined ? company : experience.company;
  experience.position = position !== undefined ? position : experience.position;
  experience.location = location !== undefined ? location : experience.location;
  experience.startDate = startDate !== undefined ? startDate : experience.startDate;
  experience.endDate = endDate !== undefined ? endDate : experience.endDate;
  experience.isCurrent = isCurrent !== undefined ? isCurrent : experience.isCurrent;
  experience.description = description !== undefined ? description : experience.description;
  experience.achievements = achievements !== undefined ? achievements : experience.achievements;
  experience.skills = skills !== undefined ? skills : experience.skills;
  experience.employmentType = employmentType !== undefined ? employmentType : experience.employmentType;

  await experience.save();
  
  logger.info('Experience entry updated', { 
    experienceId: id, 
    userId: req.user.id 
  });
  
  successResponse(res, 200, 'Experience entry updated successfully', experience);
});

/**
 * Delete an experience entry
 */
const deleteExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const experience = await Experience.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });

  if (!experience) {
    return errorResponse(res, 404, 'Experience entry not found');
  }

  // Soft delete by setting isActive to false
  experience.isActive = false;
  await experience.save();
  
  logger.info('Experience entry deleted', { 
    experienceId: id, 
    userId: req.user.id 
  });
  
  successResponse(res, 200, 'Experience entry deleted successfully');
});

/**
 * Reorder experience entries
 */
const reorderExperience = asyncHandler(async (req, res) => {
  const { experienceIds } = req.body;

  if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
    return errorResponse(res, 400, 'Experience IDs array is required');
  }

  await Experience.reorderExperience(req.user.id, experienceIds);
  
  // Get updated experience list
  const experience = await Experience.getUserExperience(req.user.id);
  
  logger.info('Experience entries reordered', { 
    userId: req.user.id, 
    count: experienceIds.length 
  });
  
  successResponse(res, 200, 'Experience entries reordered successfully', experience);
});

/**
 * Move experience entry up
 */
const moveExperienceUp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const experience = await Experience.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });

  if (!experience) {
    return errorResponse(res, 404, 'Experience entry not found');
  }

  await experience.moveUp();
  
  // Get updated experience list
  const updatedExperience = await Experience.getUserExperience(req.user.id);
  
  logger.info('Experience entry moved up', { 
    experienceId: id, 
    userId: req.user.id 
  });
  
  successResponse(res, 200, 'Experience entry moved up successfully', updatedExperience);
});

/**
 * Move experience entry down
 */
const moveExperienceDown = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const experience = await Experience.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });

  if (!experience) {
    return errorResponse(res, 404, 'Experience entry not found');
  }

  await experience.moveDown();
  
  // Get updated experience list
  const updatedExperience = await Experience.getUserExperience(req.user.id);
  
  logger.info('Experience entry moved down', { 
    experienceId: id, 
    userId: req.user.id 
  });
  
  successResponse(res, 200, 'Experience entry moved down successfully', updatedExperience);
});

/**
 * Get experience statistics
 */
const getExperienceStats = asyncHandler(async (req, res) => {
  const stats = await Experience.aggregate([
    {
      $match: {
        user: req.user._id,
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        currentExperience: {
          $sum: { $cond: [{ $eq: ['$isCurrent', true] }, 1, 0] }
        },
        completedExperience: {
          $sum: { $cond: [{ $eq: ['$isCurrent', false] }, 1, 0] }
        },
        uniqueCompanies: { $addToSet: '$company' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        currentExperience: 1,
        completedExperience: 1,
        uniqueCompanies: { $size: '$uniqueCompanies' }
      }
    }
  ]);

  const result = stats.length > 0 ? stats[0] : {
    totalEntries: 0,
    currentExperience: 0,
    completedExperience: 0,
    uniqueCompanies: 0
  };

  logger.info('Experience statistics retrieved', { 
    userId: req.user.id, 
    stats: result 
  });
  
  successResponse(res, 200, 'Experience statistics retrieved successfully', result);
});

/**
 * Export experience data
 */
const exportExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.getUserExperience(req.user.id);
  
  const exportData = {
    data: experience,
    exportedAt: new Date().toISOString(),
    totalEntries: experience.length
  };
  
  logger.info('Experience data exported', { 
    userId: req.user.id, 
    count: experience.length 
  });
  
  successResponse(res, 200, 'Experience data exported successfully', exportData);
});

module.exports = {
  getExperience,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperience,
  moveExperienceUp,
  moveExperienceDown,
  getExperienceStats,
  exportExperience
};
