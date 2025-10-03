const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// PIN Management
router.post('/generate-pin', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.generatePin);
router.get('/pins', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.listPins);
router.delete('/pins/:pinId', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.revokePin);
router.get('/pins/stats', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.getPinStats);

// User Management
router.get('/users', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.getAllUsers);
router.get('/users/stats', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.getUserStats);

module.exports = router;
