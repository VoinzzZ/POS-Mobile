const JWTService = require('../utils/jwtService');
const EmailService = require('../services/email.service');
const AuthService = require('../services/auth.service');
const { AppError } = require('../utils/errors');

class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.emailService = new EmailService();
    }

    register = async (req, res, next) => {
        try {
            const { name, pin, role = 'Cashier' } = req.body;
            if (!name || !pin) {
                throw new AppError('name and pin are required', 400, 'MISSING_FIELDS');
            }

            const newUser = await this.authService.register({ name, pin, role });

            res.status(201).json({
                success: true,
                message: 'User created. Please continue with email verification.',
                data: {
                userId: newUser.id,
                name: newUser.name,
                role: newUser.role,
                isVerified: newUser.isVerified
                }
            });
        } catch (error) {
            next(error);
        }
    };

    sendEmailOTP = async (req, res, next) => {
        try {
            const { userId, email } = req.body;
            if (!userId || !email) {
                throw new AppError('userId and email are required', 400, 'MISSING_FIELDS');
            }

            const result = await this.authService.sendEmailOTP(req.body);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data || null
            });
        } catch (error) {
        next(error);
        }
    };

    verifyEmailOTP = async (req, res, next) => {
        try {
            const { userId, email, otpCode } = req.body;
            if (!userId || !email || !otpCode) {
                throw new AppError('userId, email, and otpCode are required', 400, 'MISSING_FIELDS');
            }

            const result = await this.authService.verifyEmailOTP(req.body);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data || null
            });
        } catch (error) {
            next(error);
        }
    };

    setPassword = async (req, res) => {
        try {
            const { userId, newPassword, confirmPassword } = req.body;

            if (!userId || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    status: 'fail',
                    message: 'userId, newPassword, and confirmPassword are required',
                    error: 'MISSING_FIELDS',
                    details: []
                });
            }

            const result = await this.authService.setPassword({ userId, newPassword, confirmPassword });

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    status: 'fail',
                    message: result.message,
                    error: result.error,
                    details: result.details
                });
            }

            return res.status(200).json({
                success: true,
                status: 'success',
                message: result.message
            });

        } catch (error) {
            // fallback error tak terduga
            return res.status(500).json({
                success: false,
                status: 'error',
                message: error.message || 'Internal Server Error',
                error: 'INTERNAL_SERVER_ERROR',
                details: []
            });
        }
    };

    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new AppError('email and password are required', 400, 'MISSING_FIELDS');
            }

            const result = await this.authService.login(req.body);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    };

    refreshToken = async (req, res, next) => {
        try {
            const { userId, email, role, name } = req.user;
            const tokenPayload = { userId, email, role, name };
            const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload);

            res.status(200).json({
                success: true,
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
        } catch (error) {
            next(error);
        }
    };

    sendForgotPasswordOtp = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) throw new AppError('email is required', 400, 'MISSING_FIELDS');

            const result = await this.authService.sendForgotPasswordOtp(email);
            res.json({
                success: true,
                message: result.message,
                data: { email: result.email }
            });
        } catch (error) {
            next(error);
        }
    };

    verifyForgotPasswordOTP = async (req, res, next) => {
        try {
            const { email, otpCode } = req.body;
            if (!email || !otpCode) {
                throw new AppError('email and otpCode are required', 400, 'MISSING_FIELDS');
            }

            const result = await this.authService.verifyForgotPasswordOTP(email, otpCode);
            res.json({
                success: true,
                message: result.message,
                data: { resetToken: result.resetToken, email: result.email }
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req, res, next) => {
        try {
            const { resetToken, newPassword, confirmPassword } = req.body;
            if (!resetToken || !newPassword || !confirmPassword) {
                throw new AppError('resetToken, newPassword, and confirmPassword are required', 400, 'MISSING_FIELDS');
            }

            const result = await this.authService.resetPassword(resetToken, newPassword, confirmPassword);
            res.json({
                success: true,
                message: result.message,
                data: { email: result.email }
            });
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req, res, next) => {
        try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new AppError('currentPassword, newPassword, and confirmPassword are required', 400, 'MISSING_FIELDS');
        }

        const { userId } = req.user;
        const result = await this.authService.changePassword(userId, currentPassword, newPassword, confirmPassword);
        res.json({
            success: true,
            message: result.message
        });
        } catch (error) {
            next(error);
        }
    };

    getProfile = async (req, res, next) => {
        try {
        const { userId } = req.user;
        const profile = await this.authService.getProfile(userId);

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: profile
        });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = AuthController;