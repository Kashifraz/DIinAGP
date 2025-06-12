const Skill = require('../models/Skill');
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

/**
 * Get all skills for the current user
 */
const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.getUserSkills(req.user.id);
  logger.info('Skills retrieved', { userId: req.user.id, count: skills.length });
  return successResponse(res, 200, 'Skills retrieved successfully', skills);
});

/**
 * Get skills by category
 */
const getSkillsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  // Validate category
  const validCategories = [
    'technical', 'programming', 'framework', 'database', 'cloud', 'devops',
    'design', 'language', 'soft', 'certification', 'tool', 'other'
  ];
  
  if (!validCategories.includes(category)) {
    return errorResponse(res, 400, 'Invalid category');
  }

  const skills = await Skill.getSkillsByCategory(req.user.id, category);
  logger.info('Skills by category retrieved', { userId: req.user.id, category, count: skills.length });
  return successResponse(res, 200, 'Skills by category retrieved successfully', skills);
});

/**
 * Get a single skill by ID
 */
const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id, isActive: true });

  if (!skill) {
    logger.warn('Skill not found', { skillId: req.params.id, userId: req.user.id });
    return errorResponse(res, 404, 'Skill not found');
  }

  logger.info('Skill retrieved', { skillId: req.params.id, userId: req.user.id });
  return successResponse(res, 200, 'Skill retrieved successfully', skill);
});

/**
 * Create a new skill
 */
const createSkill = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    proficiency,
    yearsOfExperience,
    description,
    certifications,
    projects,
    isHighlighted
  } = req.body;

  const skill = new Skill({
    user: req.user.id,
    name,
    category,
    proficiency,
    yearsOfExperience,
    description,
    certifications: certifications || [],
    projects: projects || [],
    isHighlighted: isHighlighted || false,
  });

  await skill.save();
  logger.info('Skill created', { skillId: skill._id, userId: req.user.id });
  return successResponse(res, 201, 'Skill created successfully', skill);
});

/**
 * Update an existing skill
 */
const updateSkill = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    proficiency,
    yearsOfExperience,
    description,
    certifications,
    projects,
    isHighlighted
  } = req.body;

  const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id, isActive: true });

  if (!skill) {
    logger.warn('Skill not found for update', { skillId: req.params.id, userId: req.user.id });
    return errorResponse(res, 404, 'Skill not found');
  }

  // Update fields if provided
  skill.name = name !== undefined ? name : skill.name;
  skill.category = category !== undefined ? category : skill.category;
  skill.proficiency = proficiency !== undefined ? proficiency : skill.proficiency;
  skill.yearsOfExperience = yearsOfExperience !== undefined ? yearsOfExperience : skill.yearsOfExperience;
  skill.description = description !== undefined ? description : skill.description;
  skill.certifications = certifications !== undefined ? certifications : skill.certifications;
  skill.projects = projects !== undefined ? projects : skill.projects;
  skill.isHighlighted = isHighlighted !== undefined ? isHighlighted : skill.isHighlighted;

  await skill.save();
  logger.info('Skill updated', { skillId: skill._id, userId: req.user.id });
  return successResponse(res, 200, 'Skill updated successfully', skill);
});

/**
 * Delete a skill
 */
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id, isActive: true });

  if (!skill) {
    logger.warn('Skill not found for deletion', { skillId: req.params.id, userId: req.user.id });
    return errorResponse(res, 404, 'Skill not found');
  }

  skill.isActive = false; // Soft delete
  await skill.save();
  logger.info('Skill deleted (soft)', { skillId: skill._id, userId: req.user.id });
  return successResponse(res, 200, 'Skill deleted successfully');
});

/**
 * Reorder skills
 */
const reorderSkills = asyncHandler(async (req, res) => {
  const { skillIds } = req.body;

  if (!Array.isArray(skillIds)) {
    return errorResponse(res, 400, 'Invalid skillIds array provided');
  }

  await Skill.reorderSkills(req.user.id, skillIds);
  const updatedSkills = await Skill.getUserSkills(req.user.id);
  logger.info('Skills reordered', { userId: req.user.id, order: skillIds });
  return successResponse(res, 200, 'Skills reordered successfully', updatedSkills);
});

/**
 * Move a skill up in order
 */
const moveSkillUp = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id, isActive: true });

  if (!skill) {
    return errorResponse(res, 404, 'Skill not found');
  }

  await skill.moveUp();
  const updatedSkills = await Skill.getUserSkills(req.user.id);
  logger.info('Skill moved up', { skillId: req.params.id, userId: req.user.id });
  return successResponse(res, 200, 'Skill moved up successfully', updatedSkills);
});

/**
 * Move a skill down in order
 */
const moveSkillDown = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id, isActive: true });

  if (!skill) {
    return errorResponse(res, 404, 'Skill not found');
  }

  await skill.moveDown();
  const updatedSkills = await Skill.getUserSkills(req.user.id);
  logger.info('Skill moved down', { skillId: req.params.id, userId: req.user.id });
  return successResponse(res, 200, 'Skill moved down successfully', updatedSkills);
});

/**
 * Get skills statistics
 */
const getSkillsStats = asyncHandler(async (req, res) => {
  const stats = await Skill.getSkillsStats(req.user.id);
  logger.info('Skills statistics retrieved', { userId: req.user.id, stats });
  return successResponse(res, 200, 'Skills statistics retrieved successfully', stats);
});

/**
 * Toggle skill highlight status
 */
const toggleSkillHighlight = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id, isActive: true });

  if (!skill) {
    return errorResponse(res, 404, 'Skill not found');
  }

  skill.isHighlighted = !skill.isHighlighted;
  await skill.save();
  
  logger.info('Skill highlight toggled', { 
    skillId: skill._id, 
    userId: req.user.id, 
    isHighlighted: skill.isHighlighted 
  });
  
  return successResponse(res, 200, 'Skill highlight status updated successfully', skill);
});

/**
 * Get highlighted skills
 */
const getHighlightedSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ 
    user: req.user.id, 
    isHighlighted: true, 
    isActive: true 
  }).sort('order');
  
  logger.info('Highlighted skills retrieved', { userId: req.user.id, count: skills.length });
  return successResponse(res, 200, 'Highlighted skills retrieved successfully', skills);
});

/**
 * Export skills data
 */
const exportSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.getUserSkills(req.user.id);

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalSkills: skills.length,
    data: skills,
  };

  logger.info('Skills data exported', { userId: req.user.id, count: skills.length });
  return successResponse(res, 200, 'Skills data exported successfully', exportData);
});

/**
 * Bulk update skills
 */
const bulkUpdateSkills = asyncHandler(async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates)) {
    return errorResponse(res, 400, 'Updates must be an array');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedSkills = [];

    for (const update of updates) {
      const { id, ...updateData } = update;
      
      const skill = await Skill.findOneAndUpdate(
        { _id: id, user: req.user.id, isActive: true },
        updateData,
        { new: true, session }
      );

      if (skill) {
        updatedSkills.push(skill);
      }
    }

    await session.commitTransaction();
    logger.info('Skills bulk updated', { userId: req.user.id, count: updatedSkills.length });
    return successResponse(res, 200, 'Skills updated successfully', updatedSkills);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = {
  getSkills,
  getSkillsByCategory,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
  moveSkillUp,
  moveSkillDown,
  getSkillsStats,
  toggleSkillHighlight,
  getHighlightedSkills,
  exportSkills,
  bulkUpdateSkills,
};
