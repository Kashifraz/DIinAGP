const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Check if user has required role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!req.user.hasPermission(requiredRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. ${requiredRole} role required.` 
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole('admin');

// Check if user is team lead or admin
const requireTeamLead = requireRole('team_lead');

// Check if user is member or higher
const requireMember = requireRole('member');

// Check project access
const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID required' 
      });
    }

    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Admin can access all projects
    if (req.user.role === 'admin') {
      req.project = project;
      return next();
    }

    // Check if user is project creator or member
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project access middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Project access verification error' 
    });
  }
};

// Check project permission
const requireProjectPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.project) {
        return res.status(400).json({ 
          success: false, 
          message: 'Project access required' 
        });
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      const hasPermission = req.project.userHasPermission(req.user._id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. ${permission} permission required.` 
        });
      }

      next();
    } catch (error) {
      console.error('Project permission middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Permission verification error' 
      });
    }
  };
};

// Check task access
const requireTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.body.taskId;
    
    if (!taskId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Task ID required' 
      });
    }

    const Task = require('../models/Task');
    const task = await Task.findById(taskId).populate('project');
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Admin can access all tasks
    if (req.user.role === 'admin') {
      req.task = task;
      return next();
    }

    // Check if user is task creator, assignee, or project member
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignees.some(assignee => 
      assignee.toString() === req.user._id.toString()
    );
    const isProjectMember = task.project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isCreator && !isAssignee && !isProjectMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have access to this task.' 
      });
    }

    req.task = task;
    next();
  } catch (error) {
    console.error('Task access middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Task access verification error' 
    });
  }
};

// Optional authentication (for public endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireTeamLead,
  requireMember,
  requireProjectAccess,
  requireProjectPermission,
  requireTaskAccess,
  optionalAuth
}; 