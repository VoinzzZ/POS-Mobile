const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const AdminController = require('../controllers/admin.controller');

const router = express.Router();

// instance
const adminController = new AdminController();

router.post('/generate-pin', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin,  adminController.generatePin)

module.exports = router;