const ApprovalService = require('../services/approval.service');

class ApprovalController {
  // ==================== SA APPROVAL ====================

  static async saApproveOwner(req, res) {
    try {
      const { user_id, notes } = req.body;
      const approved_by = req.user.userId; // From auth middleware

      const result = await ApprovalService.saApproveOwner({
        user_id,
        approved_by,
        notes
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user_id: result.user_id,
          tenant_id: result.tenant_id,
          user_status: result.user_status,
          tenant_status: result.tenant_status
        }
      });
    } catch (error) {
      console.error('SA approve owner error:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Approval gagal'
      });
    }
  }

  static async saRejectOwner(req, res) {
    try {
      const { user_id, rejection_reason } = req.body;
      const rejected_by = req.user.userId;

      const result = await ApprovalService.saRejectOwner({
        user_id,
        rejected_by,
        rejection_reason
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user_id: result.user_id,
          tenant_id: result.tenant_id,
          user_status: result.user_status,
          tenant_status: result.tenant_status
        }
      });
    } catch (error) {
      console.error('SA reject owner error:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Rejection gagal'
      });
    }
  }

  static async getPendingOwners(req, res) {
    try {
      const result = await ApprovalService.getPendingOwnerApprovals();

      res.status(200).json({
        success: true,
        message: 'Pending owner approvals berhasil diambil',
        data: result
      });
    } catch (error) {
      console.error('Get pending owners error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil pending owners'
      });
    }
  }

  // ==================== OWNER APPROVAL ====================

  static async ownerApproveEmployee(req, res) {
    try {
      const { user_id, role_id, notes } = req.body;
      const approved_by = req.user.userId;

      const result = await ApprovalService.ownerApproveEmployee({
        user_id,
        role_id,
        approved_by,
        notes
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user_id: result.user_id,
          user_status: result.user_status,
          role_id: result.role_id,
          role_name: result.role_name,
          tenant_name: result.tenant_name
        }
      });
    } catch (error) {
      console.error('Owner approve employee error:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Approval employee gagal'
      });
    }
  }

  static async ownerRejectEmployee(req, res) {
    try {
      const { user_id, rejection_reason } = req.body;
      const rejected_by = req.user.userId;

      const result = await ApprovalService.ownerRejectEmployee({
        user_id,
        rejected_by,
        rejection_reason
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user_id: result.user_id,
          user_status: result.user_status,
          tenant_name: result.tenant_name
        }
      });
    } catch (error) {
      console.error('Owner reject employee error:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Rejection employee gagal'
      });
    }
  }

  static async getPendingEmployees(req, res) {
    try {
      const tenant_id = req.user.tenantId; // From auth middleware

      const result = await ApprovalService.getPendingEmployeeApprovals(tenant_id);

      res.status(200).json({
        success: true,
        message: 'Pending employee approvals berhasil diambil',
        data: result
      });
    } catch (error) {
      console.error('Get pending employees error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil pending employees'
      });
    }
  }
}

module.exports = ApprovalController;
