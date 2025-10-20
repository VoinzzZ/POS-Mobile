const UserService = require('../services/user.service');

class UserController {
  /**
   * Generate PIN registration untuk employee
   * Hanya owner tenant yang bisa generate PIN
   */
  static async generateEmployeePin(req, res) {
    try {
      const { tenantId, userId } = req.user;

      const result = await UserService.generateEmployeePin(tenantId, userId);

      res.status(201).json({
        success: true,
        message: 'PIN registration employee berhasil digenerate',
        data: result
      });
    } catch (error) {
      console.error('Generate employee PIN error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all employees for tenant
   */
  static async getEmployees(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        page = 1,
        limit = 10,
        search,
        isActive,
        role
      } = req.query;

      const result = await UserService.getEmployeesByTenant(tenantId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        role
      });

      res.status(200).json({
        success: true,
        message: 'Employees retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update employee status
   */
  static async updateEmployeeStatus(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { employeeId } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'isActive field is required'
        });
      }

      const result = await UserService.updateEmployeeStatus(
        parseInt(employeeId),
        tenantId,
        isActive,
        userId
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.employee
      });
    } catch (error) {
      console.error('Update employee status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { employeeId } = req.params;

      const result = await UserService.deleteEmployee(
        parseInt(employeeId),
        tenantId,
        userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get employee statistics
   */
  static async getEmployeeStats(req, res) {
    try {
      const { tenantId } = req.user;

      const result = await UserService.getEmployeeStats(tenantId);

      res.status(200).json({
        success: true,
        message: 'Employee statistics retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get employee stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Clean up expired PINs
   */
  static async cleanupExpiredPins(req, res) {
    try {
      const result = await UserService.cleanupExpiredPins();

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          cleanedCount: result.cleanedCount
        }
      });
    } catch (error) {
      console.error('Cleanup expired PINs error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Legacy methods converted to static
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const result = await UserService.getUsersByTenant(req.user.tenantId, {
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        search
      });

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const result = await UserService.getUserById(parseInt(userId));

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get user error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const result = await UserService.updateUser(
        parseInt(userId),
        updateData,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user
      });
    } catch (error) {
      console.error('Update user error:', error);

      if (error.message === 'User not found' || error.message.includes('already exists') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const result = await UserService.deleteUser(
        parseInt(userId),
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete user error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getRoles(req, res) {
    try {
      const result = await UserService.getAvailableRoles();

      res.status(200).json({
        success: true,
        message: 'Roles retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUsersByRole(req, res) {
    try {
      const { roleName } = req.params;
      const result = await UserService.getUsersByRole(req.user.tenantId, roleName);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async changeUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: 'roleId is required'
        });
      }

      const result = await UserService.changeUserRole(
        parseInt(userId),
        roleId,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user
      });
    } catch (error) {
      console.error('Change user role error:', error);

      if (error.message === 'User not found' || error.message === 'Role not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
}

module.exports = UserController;
