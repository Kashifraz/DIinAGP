import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} JWT token
 */
export const generateToken = (userId, email, role) => {
  const payload = {
    userId,
    email,
    role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'blog-platform',
    audience: 'blog-platform-users'
  };

  try {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'blog-platform',
      audience: 'blog-platform-users'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Token decoding failed');
  }
};

