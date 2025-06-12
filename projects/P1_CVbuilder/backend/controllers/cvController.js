const CV = require('../models/CV');
const Template = require('../models/Template');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all CVs for a user
const getCVs = async (req, res) => {
  try {
    const { status } = req.query;
    const cvs = await CV.findByUser(req.user.id, status);
    
    res.json({
      success: true,
      message: 'CVs retrieved successfully',
      data: cvs,
      count: cvs.length
    });
  } catch (error) {
    console.error('Get CVs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving CVs',
      error: error.message
    });
  }
};

// Get a single CV by ID
const getCVById = async (req, res) => {
  try {
    const { id } = req.params;
    const cv = await CV.findById(id)
      .populate('template', 'name description html css')
      .populate('user', 'name email');
    
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check if user owns the CV or if it's public
    if (cv.user._id.toString() !== req.user.id && !cv.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      message: 'CV retrieved successfully',
      data: cv
    });
  } catch (error) {
    console.error('Get CV by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving CV',
      error: error.message
    });
  }
};

// Create a new CV
const createCV = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, templateId, sections } = req.body;
    
    // Verify template exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Get user's profile data for auto-population
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Auto-populate sections with user data
    const populateSections = async (userId) => {
      // Get user's profile data
      const profile = await User.findById(userId);
      
      // Get user's professional data (you'll need to import these models)
      // For now, we'll create empty arrays - you can populate these later
      const experience = []; // await Experience.find({ user: userId });
      const education = []; // await Education.find({ user: userId });
      const skills = []; // await Skill.find({ user: userId });
      const languages = []; // await Language.find({ user: userId });
      const projects = []; // await Project.find({ user: userId });
      const publications = []; // await Publication.find({ user: userId });
      const awards = []; // await Award.find({ user: userId });
      const references = []; // await Reference.find({ user: userId });

      return [
        { 
          name: 'Profile', 
          order: 0, 
          visible: true, 
          data: {
            fullName: profile?.fullName || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            location: profile?.location || '',
            summary: profile?.bio || '',
            professionalTitle: profile?.professionalTitle || ''
          }
        },
        { 
          name: 'Experience', 
          order: 1, 
          visible: true, 
          data: { experiences: experience }
        },
        { 
          name: 'Education', 
          order: 2, 
          visible: true, 
          data: { educations: education }
        },
        { 
          name: 'Skills', 
          order: 3, 
          visible: true, 
          data: { 
            technical: skills.filter(s => s.category === 'technical').map(s => s.name),
            soft: skills.filter(s => s.category === 'soft').map(s => s.name)
          }
        },
        { 
          name: 'Languages', 
          order: 4, 
          visible: false, 
          data: { languages: languages }
        },
        { 
          name: 'Projects', 
          order: 5, 
          visible: false, 
          data: { projects: projects }
        },
        { 
          name: 'Publications', 
          order: 6, 
          visible: false, 
          data: { publications: publications }
        },
        { 
          name: 'Awards', 
          order: 7, 
          visible: false, 
          data: { awards: awards }
        },
        { 
          name: 'References', 
          order: 8, 
          visible: false, 
          data: { references: references }
        }
      ];
    };

    const populatedSections = await populateSections(req.user.id);
    
    const cvData = {
      user: req.user.id,
      name,
      template: templateId,
      templateName: template.name,
      sections: sections || populatedSections,
      settings: {
        colorScheme: {
          name: 'Professional Blue',
          primary: '#1e40af',
          secondary: '#64748b',
          accent: '#3b82f6',
          text: '#ffffff',
          background: '#ffffff'
        },
        font: {
          name: 'Inter',
          family: 'Inter, sans-serif'
        }
      }
    };
    
    const cv = new CV(cvData);
    await cv.save();
    
    // Populate the created CV
    const populatedCV = await CV.findById(cv._id)
      .populate('template', 'name description')
      .populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'CV created successfully',
      data: populatedCV
    });
  } catch (error) {
    console.error('Create CV error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error creating CV',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update CV
const updateCV = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update CV
    Object.keys(updates).forEach(key => {
      if (key !== 'user' && key !== '_id' && key !== 'createdAt') {
        cv[key] = updates[key];
      }
    });
    
    cv.lastModified = new Date();
    await cv.save();
    
    const updatedCV = await CV.findById(id)
      .populate('template', 'name description')
      .populate('user', 'name email');
    
    res.json({
      success: true,
      message: 'CV updated successfully',
      data: updatedCV
    });
  } catch (error) {
    console.error('Update CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating CV',
      error: error.message
    });
  }
};

// Delete CV
const deleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await CV.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting CV',
      error: error.message
    });
  }
};

// Reorder sections
const reorderSections = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionOrders } = req.body;
    
    if (!Array.isArray(sectionOrders)) {
      return res.status(400).json({
        success: false,
        message: 'sectionOrders must be an array'
      });
    }
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await cv.reorderSections(sectionOrders);
    
    const updatedCV = await CV.findById(id)
      .populate('template', 'name description')
      .populate('user', 'name email');
    
    res.json({
      success: true,
      message: 'Sections reordered successfully',
      data: updatedCV
    });
  } catch (error) {
    console.error('Reorder sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering sections',
      error: error.message
    });
  }
};

// Toggle section visibility
const toggleSectionVisibility = async (req, res) => {
  try {
    const { id, sectionName } = req.params;
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await cv.toggleSectionVisibility(sectionName);
    
    const updatedCV = await CV.findById(id)
      .populate('template', 'name description')
      .populate('user', 'name email');
    
    res.json({
      success: true,
      message: 'Section visibility toggled successfully',
      data: updatedCV
    });
  } catch (error) {
    console.error('Toggle section visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling section visibility',
      error: error.message
    });
  }
};

// Update section data
const updateSectionData = async (req, res) => {
  try {
    const { id, sectionName } = req.params;
    const { data } = req.body;
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await cv.updateSectionData(sectionName, data);
    
    const updatedCV = await CV.findById(id)
      .populate('template', 'name description')
      .populate('user', 'name email');
    
    res.json({
      success: true,
      message: 'Section data updated successfully',
      data: updatedCV
    });
  } catch (error) {
    console.error('Update section data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating section data',
      error: error.message
    });
  }
};

// Generate share token
const generateShareToken = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await cv.generateShareToken();
    
    res.json({
      success: true,
      message: 'Share token generated successfully',
      data: {
        shareToken: cv.shareToken,
        shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/cv/shared/${cv.shareToken}`
      }
    });
  } catch (error) {
    console.error('Generate share token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating share token',
      error: error.message
    });
  }
};

// Revoke sharing
const revokeSharing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }
    
    // Check ownership
    if (cv.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await cv.revokeSharing();
    
    res.json({
      success: true,
      message: 'Sharing revoked successfully'
    });
  } catch (error) {
    console.error('Revoke sharing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking sharing',
      error: error.message
    });
  }
};

// Get CV by share token (public access)
const getCVByShareToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const cv = await CV.findByShareToken(token);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found or not publicly shared'
      });
    }
    
    const populatedCV = await CV.findById(cv._id)
      .populate('template', 'name description html css')
      .populate('user', 'name email');
    
    res.json({
      success: true,
      message: 'CV retrieved successfully',
      data: populatedCV
    });
  } catch (error) {
    console.error('Get CV by share token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving shared CV',
      error: error.message
    });
  }
};

module.exports = {
  getCVs,
  getCVById,
  createCV,
  updateCV,
  deleteCV,
  reorderSections,
  toggleSectionVisibility,
  updateSectionData,
  generateShareToken,
  revokeSharing,
  getCVByShareToken
};
