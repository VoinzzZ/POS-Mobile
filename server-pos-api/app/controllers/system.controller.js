const SystemService = require('../services/system.service');

class SystemController {
  static async getSystemOverview(req, res) {
    try {
      const result = await SystemService.getSystemOverview();

      res.status(200).json({
        success: true,
        message: 'System overview retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAllTenants(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        isActive,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const result = await SystemService.getAllTenants({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        message: 'Tenants retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async suspendTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { suspensionReason } = req.body;
      const { suspendedBy } = req.user;

      if (!suspensionReason) {
        return res.status(400).json({
          success: false,
          message: 'Suspension reason is required'
        });
      }

      const result = await SystemService.suspendTenant(
        parseInt(tenantId),
        suspensionReason,
        suspendedBy
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.tenant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async reactivateTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { reactivatedBy } = req.user;

      const result = await SystemService.reactivateTenant(
        parseInt(tenantId),
        reactivatedBy
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.tenant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getTenantDetails(req, res) {
    try {
      const { tenantId } = req.params;

      const result = await SystemService.getTenantDetails(parseInt(tenantId));

      res.status(200).json({
        success: true,
        message: 'Tenant details retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        tenantStatus,
        isActive,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const result = await SystemService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        tenantStatus,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        message: 'All users retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getActivityLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        userId,
        tenantId,
        startDate,
        endDate
      } = req.query;

      const result = await SystemService.getActivityLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        userId: userId ? parseInt(userId) : undefined,
        tenantId: tenantId ? parseInt(tenantId) : undefined,
        startDate,
        endDate
      });

      res.status(200).json({
        success: true,
        message: 'Activity logs retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = SystemController;