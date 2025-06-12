const { Project } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.getUserProjects(req.user.id);
  
  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const projectData = {
    ...req.body,
    user: req.user.id
  };

  const project = await Project.create(projectData);

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let project = await Project.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user.id,
    isActive: true
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Soft delete
  await Project.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// @desc    Reorder projects
// @route   PUT /api/projects/reorder
// @access  Private
const reorderProjects = asyncHandler(async (req, res) => {
  const { projectIds } = req.body;

  if (!projectIds || !Array.isArray(projectIds)) {
    return res.status(400).json({
      success: false,
      message: 'Project IDs array is required'
    });
  }

  await Project.reorderProjects(req.user.id, projectIds);

  const projects = await Project.getUserProjects(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Projects reordered successfully',
    data: projects
  });
});

// @desc    Move project up
// @route   PUT /api/projects/:id/move-up
// @access  Private
const moveProjectUp = asyncHandler(async (req, res) => {
  const projects = await Project.getUserProjects(req.user.id);
  const currentIndex = projects.findIndex(proj => proj._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  if (currentIndex === 0) {
    return res.status(400).json({
      success: false,
      message: 'Project is already at the top'
    });
  }

  // Swap with previous project
  const projectIds = projects.map(proj => proj._id.toString());
  [projectIds[currentIndex], projectIds[currentIndex - 1]] = 
  [projectIds[currentIndex - 1], projectIds[currentIndex]];

  await Project.reorderProjects(req.user.id, projectIds);

  const updatedProjects = await Project.getUserProjects(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Project moved up successfully',
    data: updatedProjects
  });
});

// @desc    Move project down
// @route   PUT /api/projects/:id/move-down
// @access  Private
const moveProjectDown = asyncHandler(async (req, res) => {
  const projects = await Project.getUserProjects(req.user.id);
  const currentIndex = projects.findIndex(proj => proj._id.toString() === req.params.id);

  if (currentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  if (currentIndex === projects.length - 1) {
    return res.status(400).json({
      success: false,
      message: 'Project is already at the bottom'
    });
  }

  // Swap with next project
  const projectIds = projects.map(proj => proj._id.toString());
  [projectIds[currentIndex], projectIds[currentIndex + 1]] = 
  [projectIds[currentIndex + 1], projectIds[currentIndex]];

  await Project.reorderProjects(req.user.id, projectIds);

  const updatedProjects = await Project.getUserProjects(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Project moved down successfully',
    data: updatedProjects
  });
});

// @desc    Get projects statistics
// @route   GET /api/projects/stats
// @access  Private
const getProjectsStats = asyncHandler(async (req, res) => {
  const projects = await Project.getUserProjects(req.user.id);

  const stats = {
    totalProjects: projects.length,
    projectTypes: {},
    projectStatuses: {},
    totalTechnologies: 0,
    uniqueTechnologies: new Set(),
    activeProjects: 0
  };

  projects.forEach(project => {
    // Count project types
    stats.projectTypes[project.type] = 
      (stats.projectTypes[project.type] || 0) + 1;
    
    // Count project statuses
    stats.projectStatuses[project.status] = 
      (stats.projectStatuses[project.status] || 0) + 1;
    
    // Count technologies
    if (project.technologies && project.technologies.length > 0) {
      stats.totalTechnologies += project.technologies.length;
      project.technologies.forEach(tech => stats.uniqueTechnologies.add(tech));
    }
    
    // Count active projects
    if (project.status === 'in_progress' || project.status === 'planning') {
      stats.activeProjects++;
    }
  });

  stats.uniqueTechnologiesCount = stats.uniqueTechnologies.size;
  delete stats.uniqueTechnologies; // Remove Set from response

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export projects
// @route   GET /api/projects/export
// @access  Private
const exportProjects = asyncHandler(async (req, res) => {
  const projects = await Project.getUserProjects(req.user.id);

  const exportData = projects.map(project => ({
    name: project.name,
    description: project.description,
    type: project.type,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    technologies: project.technologies,
    teamMembers: project.teamMembers.map(member => ({
      name: member.name,
      role: member.role,
      email: member.email
    })),
    url: project.url,
    repository: project.repository,
    achievements: project.achievements
  }));

  res.status(200).json({
    success: true,
    data: exportData,
    filename: `projects_${new Date().toISOString().split('T')[0]}.json`
  });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  moveProjectUp,
  moveProjectDown,
  getProjectsStats,
  exportProjects
};
