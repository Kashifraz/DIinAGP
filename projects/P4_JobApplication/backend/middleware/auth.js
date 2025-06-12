const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    console.log('Authorization header:', req.headers.authorization);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? 'Token exists' : 'No token');
    }

    // Make sure token exists
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log('Token decoded successfully, user ID:', decoded.id);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('User found:', user.role);
      req.user = user;
      next();
    } catch (error) {
      console.log('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorizing route:', {
      userRole: req.user.role,
      requiredRoles: roles,
      allowed: roles.includes(req.user.role)
    });
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to access this feature'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  requireVerification
};

