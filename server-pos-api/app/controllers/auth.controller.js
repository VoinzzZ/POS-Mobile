const BaseController = require('./base.controller');
const JWTService = require('../utils/jwtService');
const EmailService = require('../services/email.service');
const AuthService = require('../services/auth.service');

class AuthController extends BaseController {
    constructor() {
        super();
        this.authService = new AuthService();
        this.emailService = new EmailService();
    }

    register = this.asyncHandler(async (req, res) => {
        const { name, pin, role = 'Cashier' } = req.body;
        this.validateRequiredFields(req.body, ['name', 'pin']);

        const newUser = await this.authService.register({ name, pin, role });

        return this.sendSuccess(res, {
            statusCode: 201,
            message: 'User created. Please continue with email verification.',
            data: {
                userId: newUser.id,
                name: newUser.name,
                role: newUser.role,
                isVerified: newUser.isVerified
            }
        });
    });

    sendEmailOTP = this.asyncHandler(async (req, res) => {
        this.validateRequiredFields(req.body, ['userId', 'email']);
        const result = await this.authService.sendEmailOTP(req.body);
        return this.sendSuccess(res, result);
    });

    verifyEmailOTP = this.asyncHandler(async (req, res) => {
        this.validateRequiredFields(req.body, ['userId', 'email', 'otpCode']);
        const result = await this.authService.verifyEmailOTP(req.body);
        return this.sendSuccess(res, result);
    });

    setPassword = this.asyncHandler(async (req, res) => {
        this.validateRequiredFields(req.body, ['userId', 'newPassword', 'confirmPassword']);
        const result = await this.authService.setPassword(req.body);
        return this.sendSuccess(res, result);
    });

    login = this.asyncHandler(async (req, res) => {
        this.validateRequiredFields(req.body, ['email', 'password']);
        const result = await this.authService.login(req.body);
        return this.sendSuccess(res, result);
    });

    refreshToken = this.asyncHandler(async (req, res) => {
        // User data is set by verifyRefreshToken middleware
        const { userId, email, role, name } = req.user;
        const tokenPayload = { userId, email, role, name };
        const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload);
        return this.sendSuccess(res, {
            message: 'Token refreshed successfully',
            data: {
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 900,
                    refreshExpiresIn: 604800
                }
            }
        });
    });

    sendForgotPasswordOtp = async (req, res, next) => {
        try {
            const { email } = req.body;
            const result = await this.authService.sendForgotPasswordOtp(email);
            res.status(200).json({
                success: true,
                message: result.message,
                data: { email: result.email }
            });
        } catch (err) {
            next(err);
        }
    }

    verifyForgotPasswordOTP = async (req, res, next) => {
        try {
            const { email, otpCode } = req.body;
            const result = await this.authService.verifyForgotPasswordOTP(email, otpCode);
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    resetToken: result.resetToken,
                    email: result.email
                }
            });
        } catch (err) {
            next(err);
        }
    }

    resetPassword = async (req, res, next) => {
        try {
            const { resetToken, newPassword, confirmPassword } = req.body;
            const result = await this.authService.resetPassword(resetToken, newPassword, confirmPassword);
            res.status(200).json({
                success: true,
                message: result.message,
                data: { email: result.email }
            });
        } catch (err) {
            next(err);
        }
    }

    changePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const { userId } = req.user;
            const result = await this.authService.changePassword(userId, currentPassword, newPassword, confirmPassword);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            next(err);
        }
    }

    getProfile = async (req, res, next) => {
        try {
            const { userId } = req.user;
            const profile = await this.authService.getProfile(userId);
            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: profile
            });
        } catch (err) {
            next(err);
        }
    }

}

module.exports = AuthController;