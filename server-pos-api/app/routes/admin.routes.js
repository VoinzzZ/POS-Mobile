const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const AdminController = require('../controllers/admin.controller');

const router = express.Router();

router.post('/generate-pin', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, AdminController.generatePin)

module.exports = router;