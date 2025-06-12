const Template = require('../models/Template');
const { validationResult } = require('express-validator');

// Get all templates
const getTemplates = async (req, res) => {
  try {
    const { category, active } = req.query;
    
    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const templates = await Template.find(query)
      .select('-html -css') // Exclude large fields for list view
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: 'Templates retrieved successfully',
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

// Get single template by ID
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template retrieved successfully',
      data: template.getTemplateData()
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};

// Get full template (including HTML/CSS) by ID
const getFullTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Full template retrieved successfully',
      data: template.getFullTemplate()
    });
  } catch (error) {
    console.error('Error fetching full template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch full template',
      error: error.message
    });
  }
};

// Get templates by category
const getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const templates = await Template.find({ 
      category: category,
      isActive: true 
    })
      .select('-html -css')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: `Templates for category '${category}' retrieved successfully`,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates by category',
      error: error.message
    });
  }
};

// Get template categories
const getTemplateCategories = async (req, res) => {
  try {
    const categories = await Template.distinct('category', { isActive: true });
    
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const count = await Template.countDocuments({ 
          category: category, 
          isActive: true 
        });
        return {
          name: category,
          count: count,
          displayName: category.charAt(0).toUpperCase() + category.slice(1)
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Template categories retrieved successfully',
      data: categoryData
    });
  } catch (error) {
    console.error('Error fetching template categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template categories',
      error: error.message
    });
  }
};

// Create template (Admin only)
const createTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const templateData = {
      ...req.body,
      createdBy: req.user.id
    };

    const template = new Template(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template.getTemplateData()
    });
  } catch (error) {
    console.error('Error creating template:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
};

// Update template (Admin only)
const updateTemplate = async (req, res) => {
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
    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    Object.assign(template, req.body);
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template.getTemplateData()
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
};

// Delete template (Admin only)
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await Template.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
};

// Toggle template active status (Admin only)
const toggleTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.status(200).json({
      success: true,
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: template._id,
        name: template.name,
        isActive: template.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle template status',
      error: error.message
    });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  getFullTemplate,
  getTemplatesByCategory,
  getTemplateCategories,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus
};
