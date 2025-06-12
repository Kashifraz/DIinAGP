const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching transactions for user:', req.user.userId);
    const transactions = await Transaction.find({ user: req.user.userId })
      .populate('category', 'name type color')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Create new transaction
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new transaction for user:', req.user.userId);
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ message: 'Amount, type, and category are required' });
    }

    const transaction = new Transaction({
      amount,
      type,
      category,
      description: description || '',
      date: date || new Date(),
      user: req.user.userId
    });

    const savedTransaction = await transaction.save();
    console.log('Transaction created successfully:', savedTransaction._id);

    // Populate category details
    await savedTransaction.populate('category', 'name type color');
    
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction' });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating transaction:', req.params.id);
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    ).populate('category', 'name type color');

    if (!transaction) {
      console.log('Transaction not found or unauthorized');
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('Transaction updated successfully');
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting transaction:', req.params.id);
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!transaction) {
      console.log('Transaction not found or unauthorized');
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('Transaction deleted successfully');
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
});

// Get transaction statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 