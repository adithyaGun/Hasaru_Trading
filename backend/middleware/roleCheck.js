const { ROLES } = require('../config/constants');
const { errorResponse } = require('../utils/helpers');

/**
 * Check if user has required role(s)
 * Usage: roleCheck(['admin', 'sales_staff'])
 */
const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(errorResponse('Authentication required'));
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json(
          errorResponse('Access denied. Insufficient permissions.')
        );
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json(errorResponse('Server error in authorization'));
    }
  };
};

/**
 * Admin only middleware
 */
const adminOnly = roleCheck([ROLES.ADMIN]);

/**
 * Admin and Sales Staff middleware
 */
const staffOnly = roleCheck([ROLES.ADMIN, ROLES.SALES_STAFF]);

/**
 * Customer only middleware
 */
const customerOnly = roleCheck([ROLES.CUSTOMER]);

module.exports = {
  roleCheck,
  adminOnly,
  staffOnly,
  customerOnly
};
