import express from 'express';
import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/test
 * @desc    Test API endpoint to verify server is running
 * @access  Public
 */
router.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }, 'Test endpoint successful');
});

/**
 * @route   GET /api/test/db
 * @desc    Test database connection
 * @access  Public
 */
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Test query to verify database is accessible
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      sendSuccess(res, {
        status: 'connected',
        state: states[dbState],
        database: mongoose.connection.db.databaseName,
        collections: collections.map(c => c.name),
        host: mongoose.connection.host
      }, 'Database connection successful');
    } else {
      sendError(res, `Database is ${states[dbState] || 'unknown'}`, 503);
    }
  } catch (error) {
    sendError(res, `Database connection error: ${error.message}`, 503);
  }
});

export default router;

