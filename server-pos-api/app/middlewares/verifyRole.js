const prisma = require('../config/mysql.db.js');


// Alternative function to check by role codes instead of levels
const requireRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      // Super Admin bypass semua
      if (user.is_sa) return next();

      // Get full user data with role from database
      const fullUser = await prisma.m_user.findFirst({
        where: {
          user_id: user.userId,
          deleted_at: null
        },
        include: {
          m_role: true
        }
      });

      if (!fullUser) {
        return res.status(403).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Check if user is approved based on new schema design
      let isUserApproved = fullUser.is_sa; // Super Admin auto-approved

      if (!isUserApproved) {
        // Owner users: check if approved by admin (approved_at)
        if (fullUser.m_role?.role_code === 'OWNER') {
          isUserApproved = !!fullUser.approved_at;
        }
        // Employee users (ADMIN, CASHIER, INVENTORY): check if approved by owner (approved_at_owner)
        else {
          isUserApproved = !!fullUser.approved_at_owner;
        }
      }

      if (!isUserApproved) {
        return res.status(403).json({
          success: false,
          message: 'Account not approved',
          error: 'ACCOUNT_NOT_APPROVED'
        });
      }

      // Check role code
      const userRoleCode = fullUser.m_role?.role_code;
      if (!allowedRoles.includes(userRoleCode)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role permissions',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: userRoleCode
        });
      }

      // Add full user data to request
      req.fullUser = fullUser;
      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role verification failed',
        error: 'ROLE_VERIFICATION_ERROR'
      });
    }
  };
};

// Middleware specifically for Super Admin only
const requireSuperAdmin = () => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Debug logging
      // console.log(' requireSuperAdmin Debug - User data:', {
      //   userId: user?.userId,
      //   email: user?.email,
      //   role: user?.role,
      //   is_sa: user?.is_sa,
      //   hasIsSaField: user?.hasOwnProperty('is_sa')
      // });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      // Check if user is Super Admin
      if (!user.is_sa) {
        console.log('Super Admin check failed - is_sa:', user.is_sa);
        return res.status(403).json({
          success: false,
          message: 'Super Admin access required',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // console.log('Super Admin access granted');
      next();
    } catch (error) {
      console.error('Super Admin verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Super Admin verification failed',
        error: 'SUPER_ADMIN_VERIFICATION_ERROR'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireSuperAdmin
};
