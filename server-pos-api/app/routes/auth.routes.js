const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (multi-step register)
router.post('/register', AuthController.register);             
router.post('/send-email-code', AuthController.sendEmailOTP); 
router.post('/verify-email-code', AuthController.verifyEmailOTP); 
router.post('/set-password', AuthController.setPassword);

// Auth routes
router.post('/login', AuthController.login);

// Protected routes
router.post('/logout', AuthMiddleware.verifyToken, AuthController.logout);
router.post('/refresh-token', AuthMiddleware.verifyRefreshToken, AuthController.refreshToken);
router.get('/profile', AuthMiddleware.verifyToken, AuthController.getProfile);
router.post('/change-password', AuthMiddleware.verifyToken, AuthController.changePassword);

module.exports = router;
