const express = require('express');
const router = express.Router();
const SystemController = require('../controllers/system.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

// All system routes require authentication and Super Admin role
router.use(verifyToken);
router.use(requireRole()); // Only SA can access system routes

// System overview
router.get('/overview', SystemController.getSystemOverview);

// Tenant management
router.get('/tenants', SystemController.getAllTenants);
router.get('/tenants/:tenantId', SystemController.getTenantDetails);
router.put('/tenants/:tenantId/suspend', SystemController.suspendTenant);
router.put('/tenants/:tenantId/reactivate', SystemController.reactivateTenant);

// User management across all tenants
router.get('/users', SystemController.getAllUsers);

// Activity logs
router.get('/activity-logs', SystemController.getActivityLogs);


module.exports = router;
