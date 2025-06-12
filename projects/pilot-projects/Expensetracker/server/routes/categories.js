const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching categories for user:', req.user.userId);
    const categories = await Category.find({ user: req.user.userId });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create new category
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new category for user:', req.user.userId);
    const { name, type, color } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const category = new Category({
      name,
      type,
      color: color || '#000000',
      user: req.user.userId
    });

    const savedCategory = await category.save();
    console.log('Category created successfully:', savedCategory._id);
    
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating category:', req.params.id);
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );

    if (!category) {
      console.log('Category not found or unauthorized');
      return res.status(404).json({ message: 'Category not found' });
    }

    console.log('Category updated successfully');
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting category:', req.params.id);
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!category) {
      console.log('Category not found or unauthorized');
      return res.status(404).json({ message: 'Category not found' });
    }

    console.log('Category deleted successfully');
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Create default categories for new user
router.post('/defaults', auth, async (req, res) => {
  try {
    console.log('Creating default categories for user:', req.user.userId);
    
    const defaultCategories = [
      { name: 'Food & Dining', type: 'expense', color: '#FF6B6B' },
      { name: 'Transportation', type: 'expense', color: '#4ECDC4' },
      { name: 'Housing', type: 'expense', color: '#45B7D1' },
      { name: 'Utilities', type: 'expense', color: '#96CEB4' },
      { name: 'Entertainment', type: 'expense', color: '#FFEEAD' },
      { name: 'Shopping', type: 'expense', color: '#D4A5A5' },
      { name: 'Healthcare', type: 'expense', color: '#9B59B6' },
      { name: 'Education', type: 'expense', color: '#3498DB' },
      { name: 'Salary', type: 'income', color: '#2ECC71' },
      { name: 'Investments', type: 'income', color: '#F1C40F' },
      { name: 'Gifts', type: 'income', color: '#E67E22' }
    ];

    // Check if user already has categories
    const existingCategories = await Category.find({ user: req.user.userId });
    if (existingCategories.length > 0) {
      console.log('User already has categories, skipping defaults');
      return res.status(400).json({ message: 'Categories already exist for this user' });
    }

    // Create categories with user ID
    const categories = defaultCategories.map(category => ({
      ...category,
      user: req.user.userId
    }));

    const savedCategories = await Category.insertMany(categories);
    console.log('Default categories created successfully');
    
    res.status(201).json(savedCategories);
  } catch (error) {
    console.error('Error creating default categories:', error);
    res.status(500).json({ message: 'Error creating default categories' });
  }
});

module.exports = router; 