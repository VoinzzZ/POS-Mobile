const BaseController = require('./base.controller');
const prisma = require('../config/mysql.db');
const PasswordService = require('../utils/passwordService');
const JWTService = require('../utils/jwtService');
const EmailService = require('../services/email.service');
const { ValidationError, NotFoundError } = require('../utils/errors');
const validator = require('validator');

class AuthController extends BaseController {
    constructor() {
        super();
        this.emailService = new EmailService();
        this.prisma = prisma;
    }

    // Helper Methods
    async #findUserById(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    async #findUserByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
    }

    #generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    #validateEmail(email) {
        if (!validator.isEmail(email)) {
            throw new ValidationError('Invalid email format');
        }
        return email.toLowerCase();
    }

    // Registration Flow
    register = this.asyncHandler(async (req, res) => {
        const { name, pin, role = 'Cashier' } = req.body;
        this.validateRequiredFields(req.body, ['name', 'pin']);

        const result = await this.prisma.$transaction(async (tx) => {
            const regPin = await tx.registrationPin.findFirst({
                where: {
                    code: pin,
                    used: false,
                    expiresAt: { gt: new Date() }
                }
            });

            if (!regPin) {
                throw new ValidationError('Invalid or expired registration PIN');
            }

            const newUser = await tx.user.create({
                data: { name, role, isVerified: false }
            });

            await tx.registrationPin.update({
                where: { id: regPin.id },
                data: { used: true, usedAt: new Date() }
            });

            return newUser;
        });

        return this.sendSuccess(res, {
            statusCode: 201,
            message: 'User created. Please continue with email verification.',
            data: {
                userId: result.id,
                name: result.name,
                role: result.role,
                isVerified: result.isVerified
            }
        });
    });

    // Send email OTP
    sendEmailOTP = this.asyncHandler(async (req, res) => {
        const { userId, email } = req.body;
        this.validateRequiredFields(req.body, ['userId', 'email']);

        const validatedEmail = this.#validateEmail(email);
        await this.#findUserById(userId);

        const otpCode = this.#generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.$transaction(async (tx) => {
            await tx.emailVerification.deleteMany({
                where: { userId, email: validatedEmail, verified: false }
            });

            await tx.emailVerification.create({
                data: {
                    userId,
                    email: validatedEmail,
                    code: otpCode,
                    expiresAt,
                    verified: false
                }
            });
        });

        const emailResult = await this.emailService.sendOtpEmail(validatedEmail, otpCode);
        if (!emailResult.success) {
            throw new Error('Failed to send OTP email');
        }

        return this.sendSuccess(res, {
            message: 'OTP sent to email. Code valid for 5 minutes.'
        });
    });

    // Verify email OTP
    verifyEmailOTP = this.asyncHandler(async (req, res) => {
        const { userId, email, otpCode } = req.body;
        this.validateRequiredFields(req.body, ['userId', 'email', 'otpCode']);

        const validatedEmail = this.#validateEmail(email);

        await this.prisma.$transaction(async (tx) => {
            const verification = await tx.emailVerification.findFirst({
                where: {
                    userId,
                    email: validatedEmail,
                    code: otpCode,
                    expiresAt: { gt: new Date() },
                    verified: false
                }
            });

            if (!verification) {
                throw new ValidationError('Invalid or expired OTP');
            }

            await Promise.all([
                tx.user.update({
                    where: { id: userId },
                    data: { email: validatedEmail }
                }),
                tx.emailVerification.update({
                    where: { id: verification.id },
                    data: { verified: true, verifiedAt: new Date() }
                })
            ]);
        });

        return this.sendSuccess(res, {
            message: 'Email verified successfully'
        });
    });

    // Set password and complete registration
    setPassword = this.asyncHandler(async (req, res) => {
        const { userId, newPassword, confirmPassword } = req.body;
        this.validateRequiredFields(req.body, ['userId', 'newPassword', 'confirmPassword']);

        const passwordValidation = PasswordService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                error: 'WEAK_PASSWORD',
                details: passwordValidation.errors
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
                error: 'PASSWORD_MISMATCH'
            });
        }

        const hashedPassword = await PasswordService.hashPassword(newPassword);

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                isVerified: true,
                emailVerifiedAt: new Date()
            }
        });

        return this.sendSuccess(res, {
            message: 'Password set successfully. Registration completed.'
        });
    });

    // Login user
    login = this.asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        this.validateRequiredFields(req.body, ['email', 'password']);
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                error: 'INVALID_EMAIL'
            });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS'
            });
        }
        const isPasswordValid = await PasswordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS'
            });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                error: 'EMAIL_NOT_VERIFIED'
            });
        }
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };
        const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload);
        return this.sendSuccess(res, {
            message: 'Login successful',
            data: {
                user: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                },
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 900,
                    refreshExpiresIn: 604800
                }
            }
        });
    });

    // Logout user - For mobile, this is typically handled client-side
    logout = this.asyncHandler(async (req, res) => {
        // In a mobile API, we don't need server-side logout
        // The client should simply discard the tokens
        return this.sendSuccess(res, {
            message: 'Logout successful'
        });
    });

    // Refresh token
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

    // Send forgot password OTP
    sendForgotPasswordOtp = this.asyncHandler(async (req, res) => {
        const { email } = req.body;
        this.validateRequiredFields(req.body, ['email']);
        const validatedEmail = this.#validateEmail(email);

        const user = await this.#findUserByEmail(validatedEmail);
        if (!user) {
            throw new NotFoundError('No account found with this email address');
        }

        if (!user.isVerified) {
            throw new ValidationError('Please complete your registration first');
        }

        const otpCode = this.#generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.prisma.$transaction(async (tx) => {
            await tx.passwordReset.deleteMany({
                where: {
                    userId: user.id,
                    used: false
                }
            });

            await tx.passwordReset.create({
                data: {
                    userId: user.id,
                    code: otpCode,
                    expiresAt,
                    used: false
                }
            });
        });

        const result = await this.emailService.sendForgotPasswordOtp(validatedEmail, otpCode, user.name);
        if (!result.success) {
            throw new Error('Failed to send reset code to email');
        }

        return this.sendSuccess(res, {
            message: 'Password reset code sent to your email. Code valid for 10 minutes.',
            data: { email: validatedEmail }
        });
    });

    // Verify Forgot Password OTP
    verifyForgotPasswordOTP = this.asyncHandler(async (req, res) => {
        const { email, otpCode } = req.body;
        
        this.validateRequiredFields(req.body, ['email', 'otpCode']);
        const validatedEmail = this.#validateEmail(email);

        const user = await this.#findUserByEmail(validatedEmail);
        if (!user) {
            throw new NotFoundError('No account found with this email address');
        }

        const passwordReset = await this.prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                code: otpCode,
                expiresAt: { gt: new Date() },
                used: false
            }
        });

        if (!passwordReset) {
            throw new ValidationError('Invalid or expired verification code');
        }

        const resetToken = JWTService.generateResetToken({
            userId: user.id,
            email: user.email,
            resetId: passwordReset.id
        });

        return this.sendSuccess(res, {
            message: 'Verification code confirmed. You can now set your new password.',
            data: {
                resetToken,
                email: user.email
            }
        });
    });

    // Reset Password (Set New Password)
    resetPassword = this.asyncHandler(async (req, res) => {
        const { resetToken, newPassword, confirmPassword } = req.body;
        this.validateRequiredFields(req.body, ['resetToken', 'newPassword', 'confirmPassword']);

        let tokenData;
        try {
            tokenData = JWTService.verifyResetToken(resetToken);
        } catch (error) {
            throw new ValidationError('Invalid or expired reset token');
        }

        const passwordValidation = PasswordService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new ValidationError('Password validation failed', passwordValidation.errors);
        }

        if (newPassword !== confirmPassword) {
            throw new ValidationError('Passwords do not match');
        }

        const passwordReset = await this.prisma.passwordReset.findFirst({
            where: {
                id: tokenData.resetId,
                userId: tokenData.userId,
                expiresAt: { gt: new Date() },
                used: false
            }
        });

        if (!passwordReset) {
            throw new ValidationError('Reset session has expired. Please request a new reset code.');
        }

        const hashedPassword = await PasswordService.hashPassword(newPassword);

        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: tokenData.userId },
                data: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            });

            await tx.passwordReset.update({
                where: { id: passwordReset.id },
                data: { 
                    used: true,
                    updatedAt: new Date()
                }
            });

            await tx.passwordReset.deleteMany({
                where: {
                    userId: tokenData.userId,
                    used: false,
                    id: { not: passwordReset.id }
                }
            });
        });

        return this.sendSuccess(res, {
            message: 'Password has been reset successfully. You can now login with your new password.',
            data: { email: tokenData.email }
        });
    });

    // Get profile
    getProfile = this.asyncHandler(async (req, res) => {
        const { userId } = req.user;
        const user = await this.#findUserById(userId);
        
        return this.sendSuccess(res, {
            message: 'Profile retrieved successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                emailVerifiedAt: user.emailVerifiedAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    });

    // Change password
    changePassword = this.asyncHandler(async (req, res) => {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const { userId } = req.user;
        
        this.validateRequiredFields(req.body, ['currentPassword', 'newPassword', 'confirmPassword']);
        
        const user = await this.#findUserById(userId);
        
        // Verify current password
        const isCurrentPasswordValid = await PasswordService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new ValidationError('Current password is incorrect');
        }
        
        // Validate new password
        const passwordValidation = PasswordService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new ValidationError('Password validation failed', passwordValidation.errors);
        }
        
        if (newPassword !== confirmPassword) {
            throw new ValidationError('Passwords do not match');
        }
        
        // Hash and update password
        const hashedPassword = await PasswordService.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        
        return this.sendSuccess(res, {
            message: 'Password changed successfully'
        });
    });
}

module.exports = AuthController;