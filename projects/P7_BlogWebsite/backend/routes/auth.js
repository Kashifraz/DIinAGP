import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const { email, password } = req.body;

      // Find user by email (include password for comparison)
      const user = await User.findByEmail(email);

      if (!user) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Check if password matches
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Generate JWT token
      const token = generateToken(user._id, user.email, user.role);

      // Set httpOnly cookie
      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict' // CSRF protection
      };

      res.cookie('token', token, cookieOptions);

      // Return user data (without password) and success message
      sendSuccess(
        res,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token // Also return token in response for flexibility (though cookie is preferred)
        },
        'Login successful',
        200
      );
    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 'Login failed. Please try again.', 500);
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear token cookie)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    sendSuccess(res, null, 'Logout successful', 200);
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Logout failed', 500);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    sendSuccess(res, { user: req.user }, 'User retrieved successfully', 200);
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 'Failed to retrieve user', 500);
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (for initial admin setup)
 * @access  Public (should be restricted in production)
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('role')
      .optional()
      .isIn(['author', 'admin'])
      .withMessage('Role must be either author or admin')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, errors.array()[0].msg, 400);
      }

      const { email, password, name, role = 'author' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return sendError(res, 'User with this email already exists', 409);
      }

      // Create new user (password will be hashed by pre-save hook)
      const user = await User.create({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        role
      });

      // Generate JWT token
      const token = generateToken(user._id, user.email, user.role);

      // Set httpOnly cookie
      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      };

      res.cookie('token', token, cookieOptions);

      // Return user data (without password)
      sendSuccess(
        res,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        },
        'User registered successfully',
        201
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return sendError(res, 'User with this email already exists', 409);
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return sendError(res, messages.join(', '), 400);
      }

      sendError(res, 'Registration failed. Please try again.', 500);
    }
  }
);

/**
 * @route   GET /api/auth/authors/:id
 * @desc    Get author profile by ID (public endpoint for author box blocks)
 * @access  Public
 */
router.get('/authors/:id', async (req, res) => {
  try {
    const author = await User.findById(req.params.id).select('name email avatar bio');

    if (!author) {
      return sendError(res, 'Author not found', 404);
    }

    // Return public author profile (name, avatar, bio)
    sendSuccess(
      res,
      {
        author: {
          _id: author._id,
          name: author.name,
          avatar: author.avatar,
          bio: author.bio
        }
      },
      'Author profile retrieved successfully',
      200
    );
  } catch (error) {
    console.error('Get author profile error:', error);
    
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid author ID', 400);
    }
    
    sendError(res, 'Failed to retrieve author profile', 500);
  }
});

export default router;

