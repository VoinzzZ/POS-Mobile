const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller.js');
const { verifyToken } = require('../middlewares/verifyToken.js');

router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/profile', verifyToken, AuthController.getProfile);
router.put('/profile', verifyToken, AuthController.updateProfile);
router.get('/tenant-info', verifyToken, AuthController.getTenantInfo);
router.post('/send-email-change-otp', verifyToken, AuthController.sendEmailChangeOTP);
router.post('/verify-email-change-otp', verifyToken, AuthController.verifyEmailChangeOTP);
router.post('/change-password', verifyToken, AuthController.changePassword);
router.post('/verify-password', verifyToken, AuthController.verifyCurrentPassword);
router.post('/forgot-password/send-otp', AuthController.sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', AuthController.verifyForgotPasswordOTP);
router.post('/forgot-password/reset', AuthController.resetPassword);

module.exports = router;