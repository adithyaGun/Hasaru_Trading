const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/helpers');

/**
 * Middleware to verify JWT token and authenticate user
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('No token provided. Authorization denied.'));
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(errorResponse('Token has expired. Please login again.'));
      }
      return res.status(401).json(errorResponse('Invalid token. Authorization denied.'));
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json(errorResponse('Server error in authentication'));
  }
};

/**
 * Optional auth - doesn't fail if no token, but attaches user if valid token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {
        // Token invalid but we don't fail, just continue without user
        req.user = null;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, optionalAuth };
