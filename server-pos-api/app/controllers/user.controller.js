const UserService = require('../services/user.service');

class UserController {
  static async generateEmployeePin(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { expires_in_hours = 24 } = req.body; // Get expiry time from request body

      const result = await UserService.generateEmployeePin(tenantId, userId, expires_in_hours);

      res.status(201).json({
        success: true,
        message: 'PIN registration employee berhasil digenerate',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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

  static async getPinHistory(req, res) {
    try {
      const { tenantId } = req.user;
      const { page = 1, limit = 10, status } = req.query;

      const result = await UserService.getPinHistory(tenantId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.status(200).json({
        success: true,
        message: 'PIN history retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async revokePin(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { pinId } = req.params;

      const result = await UserService.revokePin(parseInt(pinId), tenantId, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = UserController;
