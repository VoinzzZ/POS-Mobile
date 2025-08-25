const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (multi-step register)
router.post('/register', AuthController.register);             
router.post('/send-email-code', AuthController.sendEmailCode); 
router.post('/verify-email-code', AuthController.verifyEmailCode); 
router.post('/set-password', AuthController.setPassword);

// Auth routes
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Email verification 
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

// Protected routes
router.post('/logout', AuthMiddleware.verifyToken, AuthController.logout);
router.post('/refresh-token', AuthMiddleware.verifyRefreshToken, AuthController.refreshToken);
router.get('/profile', AuthMiddleware.verifyToken, AuthController.getProfile);
router.post('/change-password', AuthMiddleware.verifyToken, AuthController.changePassword);

module.exports = router;
