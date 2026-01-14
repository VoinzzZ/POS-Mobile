const prisma = require('../config/mysql.db.js');

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

      if (user.is_sa) return next();

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

      let isUserApproved = fullUser.is_sa;

      if (!isUserApproved) {
        isUserApproved = !!fullUser.approved_at;
      }

      if (!isUserApproved) {
        return res.status(403).json({
          success: false,
          message: 'Account not approved',
          error: 'ACCOUNT_NOT_APPROVED'
        });
      }

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

      req.fullUser = fullUser;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role verification failed',
        error: 'ROLE_VERIFICATION_ERROR'
      });
    }
  };
};

const requireSuperAdmin = () => {
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

      if (!user.is_sa) {
        return res.status(403).json({
          success: false,
          message: 'Super Admin access required',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
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
