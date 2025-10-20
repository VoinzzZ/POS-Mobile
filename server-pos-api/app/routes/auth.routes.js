const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller.js');
const { verifyToken } = require('../middlewares/verifyToken.js');

router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/profile', verifyToken, AuthController.getProfile);
router.get('/tenant-info', verifyToken, AuthController.getTenantInfo);

module.exports = router;