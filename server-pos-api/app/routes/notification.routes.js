const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.get(
    '/low-stock',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    NotificationController.getLowStockNotifications
);

router.post(
    '/register-token',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    NotificationController.registerPushToken
);

module.exports = router;
