const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { authLimiter, speedLimiter } = require('../middlewares/rateLimiter')

const router = express.Router();

// instance
const authController = new AuthController();

// Public routes (multi-step register)
router.post('/register', authLimiter, speedLimiter, authController.register);             
router.post('/send-email-code', authLimiter, speedLimiter, authController.sendEmailOTP); 
router.post('/verify-email-code', authLimiter, speedLimiter,    authController.verifyEmailOTP); 
router.post('/set-password', authController.setPassword);

// Auth routes
router.post('/login', authLimiter, speedLimiter, authController.login);

// Protected routes
router.post('/logout', AuthMiddleware.verifyToken, authController.logout);
router.post('/refresh-token', AuthMiddleware.verifyRefreshToken, authController.refreshToken);
router.get('/profile', AuthMiddleware.verifyToken, authController.getProfile);
router.post('/change-password', AuthMiddleware.verifyToken, authController.changePassword);

module.exports = router;
