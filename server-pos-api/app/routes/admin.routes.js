const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const AdminController = require('../controllers/admin.controller');

const router = express.Router();
const adminController = new AdminController();

router.post('/generate-pin', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.generatePin);
router.get('/pins', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.listPins);
router.delete('/pins/:pinId', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.revokePin);
router.get('/pins/stats', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, adminController.getPinStats)

module.exports = router;