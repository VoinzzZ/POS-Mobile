const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole, requireSuperAdmin } = require('../middlewares/verifyRole');
const ApprovalController = require('../controllers/approval.controller');

// ==================== SUPER ADMIN APPROVAL ====================

// Get pending owner approvals (SA only)
router.get(
  '/owners/pending',
  verifyToken,
  requireSuperAdmin(),
  ApprovalController.getPendingOwners
);

// Super Admin approve owner
router.post(
  '/owners/approve',
  verifyToken,
  requireSuperAdmin(),
  ApprovalController.saApproveOwner
);

// Super Admin reject owner
router.post(
  '/owners/reject',
  verifyToken,
  requireSuperAdmin(),
  ApprovalController.saRejectOwner
);

// ==================== OWNER APPROVAL FOR EMPLOYEES ====================

// Get pending employee approvals (Owner only)
router.get(
  '/employees/pending',
  verifyToken,
  requireRole(['OWNER']),
  ApprovalController.getPendingEmployees
);

// Owner approve employee
router.post(
  '/employees/approve',
  verifyToken,
  requireRole(['OWNER']),
  ApprovalController.ownerApproveEmployee
);

// Owner reject employee
router.post(
  '/employees/reject',
  verifyToken,
  requireRole(['OWNER']),
  ApprovalController.ownerRejectEmployee
);

module.exports = router;