const Education = require('../models/Education');
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

/**
 * Get all education entries for the current user
 */
const getEducation = asyncHandler(async (req, res) => {
  const education = await Education.getUserEducation(req.user.id);
  
  logger.info('Education retrieved', { 
    userId: req.user.id, 
    count: education.length 
  });
  
  successResponse(res, 200, 'Education retrieved successfully', education);
});

/**
 * Get a specific education entry
 */
const getEducationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const education = await Education.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });
  
  if (!education) {
    return errorResponse(res, 404, 'Education entry not found');
  }
  
  logger.info('Education entry retrieved', { 
    userId: req.user.id, 
    educationId: id 
  });
  
  successResponse(res, 200, 'Education entry retrieved successfully', education);
});

/**
 * Create a new education entry
 */
const createEducation = asyncHandler(async (req, res) => {
  const educationData = {
    ...req.body,
    user: req.user.id
  };
  
  const education = new Education(educationData);
  await education.save();
  
  logger.info('Education entry created', { 
    userId: req.user.id, 
    educationId: education._id 
  });
  
  successResponse(res, 201, 'Education entry created successfully', education);
});

/**
 * Update an education entry
 */
const updateEducation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const education = await Education.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });
  
  if (!education) {
    return errorResponse(res, 404, 'Education entry not found');
  }
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      education[key] = req.body[key];
    }
  });
  
  await education.save();
  
  logger.info('Education entry updated', { 
    userId: req.user.id, 
    educationId: id 
  });
  
  successResponse(res, 200, 'Education entry updated successfully', education);
});

/**
 * Delete an education entry (soft delete)
 */
const deleteEducation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const education = await Education.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });
  
  if (!education) {
    return errorResponse(res, 404, 'Education entry not found');
  }
  
  // Soft delete
  education.isActive = false;
  await education.save();
  
  logger.info('Education entry deleted', { 
    userId: req.user.id, 
    educationId: id 
  });
  
  successResponse(res, 200, 'Education entry deleted successfully');
});

/**
 * Reorder education entries
 */
const reorderEducation = asyncHandler(async (req, res) => {
  const { educationIds } = req.body;
  
  if (!Array.isArray(educationIds) || educationIds.length === 0) {
    return errorResponse(res, 400, 'Education IDs array is required');
  }
  
  // Verify all education entries belong to the user
  const educationCount = await Education.countDocuments({
    _id: { $in: educationIds },
    user: req.user.id,
    isActive: true
  });
  
  if (educationCount !== educationIds.length) {
    return errorResponse(res, 400, 'Some education entries not found or don\'t belong to user');
  }
  
  await Education.reorderEducation(req.user.id, educationIds);
  
  // Get updated education list
  const education = await Education.getUserEducation(req.user.id);
  
  logger.info('Education reordered', { 
    userId: req.user.id, 
    count: educationIds.length 
  });
  
  successResponse(res, 200, 'Education reordered successfully', education);
});

/**
 * Move education entry up
 */
const moveEducationUp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const education = await Education.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });
  
  if (!education) {
    return errorResponse(res, 404, 'Education entry not found');
  }
  
  await education.moveUp();
  
  // Get updated education list
  const educationList = await Education.getUserEducation(req.user.id);
  
  logger.info('Education moved up', { 
    userId: req.user.id, 
    educationId: id 
  });
  
  successResponse(res, 200, 'Education moved up successfully', educationList);
});

/**
 * Move education entry down
 */
const moveEducationDown = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const education = await Education.findOne({
    _id: id,
    user: req.user.id,
    isActive: true
  });
  
  if (!education) {
    return errorResponse(res, 404, 'Education entry not found');
  }
  
  await education.moveDown();
  
  // Get updated education list
  const educationList = await Education.getUserEducation(req.user.id);
  
  logger.info('Education moved down', { 
    userId: req.user.id, 
    educationId: id 
  });
  
  successResponse(res, 200, 'Education moved down successfully', educationList);
});

/**
 * Get education statistics
 */
const getEducationStats = asyncHandler(async (req, res) => {
  const stats = await Education.aggregate([
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
        currentEducation: {
          $sum: { $cond: ['$isCurrent', 1, 0] }
        },
        completedEducation: {
          $sum: { $cond: ['$isCurrent', 0, 1] }
        },
        averageGPA: { $avg: '$gpa' },
        institutions: { $addToSet: '$institution' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        currentEducation: 1,
        completedEducation: 1,
        averageGPA: { $round: ['$averageGPA', 2] },
        uniqueInstitutions: { $size: '$institutions' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalEntries: 0,
    currentEducation: 0,
    completedEducation: 0,
    averageGPA: null,
    uniqueInstitutions: 0
  };
  
  logger.info('Education statistics retrieved', { 
    userId: req.user.id, 
    stats: result 
  });
  
  successResponse(res, 200, 'Education statistics retrieved successfully', result);
});

/**
 * Export education data
 */
const exportEducation = asyncHandler(async (req, res) => {
  const education = await Education.getUserEducation(req.user.id);
  
  const exportData = education.map(edu => ({
    institution: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy,
    startDate: edu.startDate,
    endDate: edu.endDate,
    isCurrent: edu.isCurrent,
    gpa: edu.gpa,
    description: edu.description,
    location: edu.location,
    duration: edu.duration,
    dateRange: edu.dateRange
  }));
  
  logger.info('Education data exported', { 
    userId: req.user.id, 
    count: exportData.length 
  });
  
  successResponse(res, 200, 'Education data exported successfully', {
    data: exportData,
    exportedAt: new Date(),
    totalEntries: exportData.length
  });
});

module.exports = {
  getEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation,
  moveEducationUp,
  moveEducationDown,
  getEducationStats,
  exportEducation
};
