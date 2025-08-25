const prisma = require('../config/mysql.db');
const PasswordService = require('../utils/passwordService');
const JWTService = require('../utils/jwtService');
const EmailService = require('../services/email.service');
const validator = require('validator');
const crypto = require('crypto');

class AuthController {
    // Register new user
    static async register(req, res) {
    try {
        const { name, pin, role } = req.body;

        // Input validation
        if (!name || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Name and PIN are required',
                error: 'MISSING_FIELDS'
            });
        }

        // Cek PIN valid & belum expired
        const regPin = await prisma.registrationPin.findFirst({
            where: {
                code: pin,
                used: false,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!regPin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired registration PIN',
                error: 'INVALID_PIN'
            });
        }

        // Buat user baru (tanpa email & password dulu)
        const newUser = await prisma.user.create({
            data: {
                name,
                role: role || 'Cashier',
                isVerified: false, // nanti berubah setelah email OTP valid
            }
        });

        // Tandai PIN sudah dipakai
        await prisma.registrationPin.update({
            where: { id: regPin.id },
            data: {
                used: true,
                usedAt: new Date()
            }
        });

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
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: 'REGISTRATION_ERROR',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
    }

    // Kirim kode verifikasi email
    static async sendEmailCode(req, res) {
        try {
            const { userId, email } = req.body;

            if (!userId || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and email are required',
                    error: 'MISSING_FIELDS'
                });
            }

            // Cek user ada
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            // Generate OTP (6 digit)
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

            // Simpan di table EmailVerification
            await prisma.emailVerification.create({
                data: {
                    email,
                    code,
                    expiresAt
                }
            });

            // Kirim email
            const emailService = new EmailService();
            await emailService.sendOTPEmail(email, code);

            res.status(200).json({
                success: true,
                message: 'Verification code sent to email. Code valid for 5 minutes.'
            });

        } catch (error) {
            console.error('Send email code error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send email code',
                error: 'SEND_EMAIL_CODE_ERROR'
            });
        }
    }

    // Verifikasi kode email
    static async verifyEmailCode(req, res) {
        try {
            const { userId, email, code } = req.body;

            if (!userId || !email || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, email, and code are required',
                    error: 'MISSING_FIELDS'
                });
            }

            // Cari OTP
            const verification = await prisma.emailVerification.findFirst({
                where: {
                    email,
                    code,
                    expiresAt: { gt: new Date() },
                    verified: false
                }
            });

            if (!verification) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification code',
                    error: 'INVALID_CODE'
                });
            }

            // Update user dengan email
            await prisma.user.update({
                where: { id: userId },
                data: { email }
            });

            // Tandai OTP sudah diverifikasi
            await prisma.emailVerification.update({
                where: { id: verification.id },
                data: {
                    verified: true,
                    verifiedAt: new Date()
                }
            });

            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });

        } catch (error) {
            console.error('Verify email code error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify email code',
                error: 'VERIFY_EMAIL_CODE_ERROR'
            });
        }
    }

    // Set password (final step)
    static async setPassword(req, res) {
        try {
            const { userId, newPassword, confirmPassword } = req.body;

            if (!userId || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                    error: 'MISSING_FIELDS'
                });
            }

            // Validate password
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

            // Hash password
            const hashedPassword = await PasswordService.hashPassword(newPassword);

            // Update user
            await prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                    isVerified: true,
                    emailVerifiedAt: new Date()
                }
            });

            res.status(200).json({
                success: true,
                message: 'Password set successfully. Registration completed.'
            });

        } catch (error) {
            console.error('Set password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to set password',
                error: 'SET_PASSWORD_ERROR'
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                    error: 'MISSING_CREDENTIALS'
                });
            }

            // Validate email format
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    error: 'INVALID_EMAIL'
                });
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    error: 'INVALID_CREDENTIALS'
                });
            }

            // Check password
            const isPasswordValid = await PasswordService.comparePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    error: 'INVALID_CREDENTIALS'
                });
            }

            // Check if email is verified
            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please verify your email before logging in',
                    error: 'EMAIL_NOT_VERIFIED'
                });
            }

            // Generate tokens
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            };

            const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload);

            // Set cookies
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            };

            res.cookie('accessToken', accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({
                success: true,
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
                        refreshToken
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: 'LOGIN_ERROR',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }

    // Logout user
    static async logout(req, res) {
        try {
            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed',
                error: 'LOGOUT_ERROR'
            });
        }
    }

    // Refresh token
    static async refreshToken(req, res) {
        try {
            // User data is set by verifyRefreshToken middleware
            const { userId, email, role, name } = req.user;

            // Generate new access token
            const tokenPayload = { userId, email, role, name };
            const accessToken = JWTService.generateAccessToken(tokenPayload);

            // Set new access token cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken
                }
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'Token refresh failed',
                error: 'TOKEN_REFRESH_ERROR'
            });
        }
    }

    // Verify email
    static async verifyEmail(req, res) {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification token is required',
                    error: 'MISSING_TOKEN'
                });
            }

            // Find user with verification token
            const user = await prisma.user.findFirst({
                where: {
                    verificationToken: token,
                    verificationExpires: {
                        gt: new Date()
                    }
                }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token',
                    error: 'INVALID_TOKEN'
                });
            }

            // Update user verification status
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                    verificationToken: null,
                    verificationExpires: null
                }
            });

            // Send welcome email
            const emailService = new EmailService();
            await emailService.sendWelcomeEmail(user.email, user.name, user.role);

            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                data: {
                    isVerified: true,
                    verifiedAt: new Date()
                }
            });

        } catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Email verification failed',
                error: 'VERIFICATION_ERROR',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }

    // Resend verification email
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required',
                    error: 'MISSING_EMAIL'
                });
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            if (user.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified',
                    error: 'ALREADY_VERIFIED'
                });
            }

            // Generate new verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Update user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationToken,
                    verificationExpires
                }
            });

            // Send verification email
            const emailService = new EmailService();
            const verificationURL = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
            
            await emailService.sendVerificationEmail(email, user.name, verificationURL);

            res.status(200).json({
                success: true,
                message: 'Verification email sent successfully'
            });

        } catch (error) {
            console.error('Resend verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to resend verification email',
                error: 'RESEND_VERIFICATION_ERROR'
            });
        }
    }

    // Forgot password
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required',
                    error: 'MISSING_EMAIL'
                });
            }

            // Validate email format
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    error: 'INVALID_EMAIL'
                });
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                // Don't reveal if user exists or not for security
                return res.status(200).json({
                    success: true,
                    message: 'If the email exists, a reset password link will be sent'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Update user with reset token
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: resetExpires
                }
            });

            // Send reset password email
            const emailService = new EmailService();
            const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
            
            await emailService.sendResetPasswordEmail(email, user.name, resetURL);

            res.status(200).json({
                success: true,
                message: 'If the email exists, a reset password link will be sent'
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process forgot password request',
                error: 'FORGOT_PASSWORD_ERROR'
            });
        }
    }

    // Reset password
    static async resetPassword(req, res) {
        try {
            const { token, newPassword, confirmPassword } = req.body;

            if (!token || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                    error: 'MISSING_FIELDS'
                });
            }

            // Validate password strength
            const passwordValidation = PasswordService.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Password validation failed',
                    error: 'WEAK_PASSWORD',
                    details: passwordValidation.errors
                });
            }

            // Validate confirm password
            const confirmPasswordValidation = PasswordService.validateConfrimPassword(newPassword, confirmPassword);
            if (!confirmPasswordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: confirmPasswordValidation.error,
                    error: 'PASSWORD_MISMATCH'
                });
            }

            // Find user with reset token
            const user = await prisma.user.findFirst({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        gt: new Date()
                    }
                }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token',
                    error: 'INVALID_RESET_TOKEN'
                });
            }

            // Hash new password
            const hashedPassword = await PasswordService.hashPassword(newPassword);

            // Update user password and clear reset token
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                }
            });

            res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Password reset failed',
                error: 'RESET_PASSWORD_ERROR',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            // User data is set by verifyToken middleware
            const { userId } = req.user;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isVerified: true,
                    emailVerifiedAt: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: user
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
                error: 'GET_PROFILE_ERROR'
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const { userId } = req.user;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                    error: 'MISSING_FIELDS'
                });
            }

            // Get user
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await PasswordService.comparePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect',
                    error: 'INVALID_CURRENT_PASSWORD'
                });
            }

            // Validate new password strength
            const passwordValidation = PasswordService.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Password validation failed',
                    error: 'WEAK_PASSWORD',
                    details: passwordValidation.errors
                });
            }

            // Validate confirm password
            const confirmPasswordValidation = PasswordService.validateConfrimPassword(newPassword, confirmPassword);
            if (!confirmPasswordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: confirmPasswordValidation.error,
                    error: 'PASSWORD_MISMATCH'
                });
            }

            // Hash new password
            const hashedPassword = await PasswordService.hashPassword(newPassword);

            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                error: 'CHANGE_PASSWORD_ERROR'
            });
        }
    }
}

module.exports = AuthController;