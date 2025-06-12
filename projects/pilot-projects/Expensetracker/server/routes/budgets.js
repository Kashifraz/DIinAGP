const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all budgets for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching budgets for user:', req.user.userId);
    const budgets = await Budget.find({ user: req.user.userId })
      .populate('category', 'name type color');
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Error fetching budgets' });
  }
});

// Create new budget
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new budget for user:', req.user.userId);
    const { amount, category, period } = req.body;

    if (!amount || !category || !period) {
      return res.status(400).json({ message: 'Amount, category, and period are required' });
    }

    const budget = new Budget({
      amount,
      category,
      period,
      user: req.user.userId
    });

    const savedBudget = await budget.save();
    console.log('Budget created successfully:', savedBudget._id);

    // Populate category details
    await savedBudget.populate('category', 'name type color');
    
    res.status(201).json(savedBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Error creating budget' });
  }
});

// Update budget
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating budget:', req.params.id);
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    ).populate('category', 'name type color');

    if (!budget) {
      console.log('Budget not found or unauthorized');
      return res.status(404).json({ message: 'Budget not found' });
    }

    console.log('Budget updated successfully');
    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Error updating budget' });
  }
});

// Delete budget
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting budget:', req.params.id);
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!budget) {
      console.log('Budget not found or unauthorized');
      return res.status(404).json({ message: 'Budget not found' });
    }

    console.log('Budget deleted successfully');
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget' });
  }
});

// Get budget overview
router.get('/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id, isActive: true };

    if (startDate && endDate) {
      query.startDate = { $lte: new Date(endDate) };
      query.$or = [
        { endDate: { $gte: new Date(startDate) } },
        { endDate: null }
      ];
    }

    const budgets = await Budget.find(query)
      .populate('category', 'name icon color');

    const overview = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.startDate);
        const endDate = budget.endDate ? new Date(budget.endDate) : new Date();

        const spending = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              category: budget.category._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const currentSpending = spending[0]?.total || 0;
        const percentage = (currentSpending / budget.amount) * 100;

        return {
          ...budget.toObject(),
          currentSpending,
          percentage,
          remaining: budget.amount - currentSpending
        };
      })
    );

    res.json(overview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 