const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { authLimiter, speedLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public routes (multi-step register)
router.post('/register', authLimiter, speedLimiter, AuthController.register);
router.post('/send-email-code', authLimiter, speedLimiter, AuthController.sendEmailOTP);
router.post('/verify-email-code', authLimiter, speedLimiter, AuthController.verifyEmailOTP);
router.post('/set-password', AuthController.setPassword);

// Auth routes
router.post('/login', AuthController.login);

// Protected routes
router.post('/refresh-token', AuthMiddleware.verifyRefreshToken, AuthController.refreshToken);
router.get('/profile', AuthMiddleware.verifyToken, AuthController.getProfile);
router.post('/change-password', AuthMiddleware.verifyToken, AuthController.changePassword);

module.exports = router;
