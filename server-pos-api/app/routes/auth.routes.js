const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// instance
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Public routes (multi-step register)
router.post('/register', authController.register);             
router.post('/send-email-code', authController.sendEmailOTP); 
router.post('/verify-email-code', authController.verifyEmailOTP); 
router.post('/set-password', authController.setPassword);

// Auth routes
router.post('/login', authController.login);

// Protected routes
router.post('/logout', AuthMiddleware.verifyToken, authController.logout);
router.post('/refresh-token', AuthMiddleware.verifyRefreshToken, authController.refreshToken);
router.get('/profile', AuthMiddleware.verifyToken, authController.getProfile);
router.post('/change-password', AuthMiddleware.verifyToken, authController.changePassword);

module.exports = router;
