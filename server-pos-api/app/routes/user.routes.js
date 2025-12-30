const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');


// Generate PIN registration untuk employee (hanya owner tenant)
router.post(
  '/generate-employee-pin',
  verifyToken,
  requireRole(['OWNER']),
  UserController.generateEmployeePin
);

// Get all employees untuk tenant
router.get(
  '/employees',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  UserController.getEmployees
);

// Update employee status (activate/deactivate)
router.patch(
  '/employees/:employeeId/status',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  UserController.updateEmployeeStatus
);

// Delete employee
router.delete(
  '/employees/:employeeId',
  verifyToken,
  requireRole(['OWNER']),
  UserController.deleteEmployee
);

// Get employee statistics
router.get(
  '/employees/stats',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  UserController.getEmployeeStats
);

// Get available roles
router.get(
  '/roles/all',
  verifyToken,
  UserController.getRoles
);

// Get users by role
router.get(
  '/roles/:roleName/users',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  UserController.getUsersByRole
);

// Change user role
router.patch(
  '/:userId/role',
  verifyToken,
  requireRole(['OWNER']),
  UserController.changeUserRole
);

// Clean up expired PINs (system maintenance)
router.delete(
  '/pins/cleanup',
  verifyToken,
  requireRole(['OWNER']),
  UserController.cleanupExpiredPins
);

// Get PIN history
router.get(
  '/pins/history',
  verifyToken,
  requireRole(['OWNER']),
  UserController.getPinHistory
);

// Revoke PIN
router.patch(
  '/pins/:pinId/revoke',
  verifyToken,
  requireRole(['OWNER']),
  UserController.revokePin
);

module.exports = router;