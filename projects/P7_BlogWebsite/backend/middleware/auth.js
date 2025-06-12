import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware to protect routes - requires authentication
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from httpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback: Get token from Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return sendError(res, 'Not authorized to access this route. Please login.', 401);
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from token (exclude password)
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return sendError(res, error.message || 'Not authorized, token failed', 401);
    }
  } catch (error) {
    return sendError(res, 'Authentication error', 500);
  }
};

/**
 * Middleware to check user role
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authorized to access this route', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, `User role '${req.user.role}' is not authorized to access this route`, 403);
    }

    next();
  };
};

