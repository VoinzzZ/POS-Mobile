const prisma = require('../config/mysql.db');
const PasswordService = require('../utils/passwordService');
const JWTService = require('../utils/jwtService');
const EmailService = require('../services/email.service');
const validator = require('validator');

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
                isVerified: false,
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
    static async sendEmailOTP(req, res) {
    try {
        const { userId, email } = req.body;
        if (!userId || !email) {
        return res.status(400).json({
            success: false,
            message: 'User ID and email are required',
            error: 'MISSING_FIELDS'
        });
        }

        // Ambil user dari DB
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
        }

        // Hapus OTP lama biar nggak numpuk
        await prisma.emailVerification.deleteMany({
        where: { userId, email, verified: false }
        });

        // Generate OTP baru
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Simpan OTP baru
        await prisma.emailVerification.create({
        data: {
            userId,
            email,
            code: otpCode,
            expiresAt,
            verified: false
        }
        });

        // Kirim email OTP
        const emailService = new EmailService();
        const result = await emailService.sendOtpEmail(email, otpCode);

        if (!result.success) {
        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP email',
            error: result.error
        });
        }

        res.status(200).json({
        success: true,
        message: 'OTP sent to email. Code valid for 5 minutes.'
        });

    } catch (error) {
        console.error('Send email OTP error:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
        error: 'SEND_EMAIL_OTP_ERROR',
        details: error.message
        });
    }
    }

    // Verifikasi kode email
    static async verifyEmailOTP(req, res) {
        try {
            const { userId, email, otpCode } = req.body;

            if (!userId || !email || !otpCode) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, email, and code are required',
                    error: 'MISSING_FIELDS'
                });
            }

            // Cari OTP valid
            const verification = await prisma.emailVerification.findFirst({
                where: {
                    userId,
                    email: email.toLowerCase(),
                    code: otpCode,
                    expiresAt: { gt: new Date() },
                    verified: false
                }
            });

            console.log("Verification found:", verification);

            if (!verification) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                    error: 'INVALID_OTP'
                });
            }

            // Update user email
            await prisma.user.update({
                where: { id: userId },
                data: { email: email.toLowerCase() }
            });

            // Tandai OTP diverifikasi
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
            console.error('Verify email OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify OTP',
                error: 'VERIFY_EMAIL_OTP_ERROR',
                details: error.message
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

    // Send forgot password otp
    static async sendForgotPasswordOtp(req, res) {
        try {
            const { email } = req.body;

            if ( email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required',
                    error: 'MISSING_EMAIL'
                });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    error: 'INVALID_EMAIL'
                });
            }

            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No account found with this email address',
                    error: 'USER_NOT_FOUND'
                });
            }

            if (!user.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Please complete your regisration first',
                    error: 'USER_NOT_VERIFIED'
                });
            }

            await prisma.passwordReset.deleteMany({
                where: {
                    userId: user.id,
                    used: false
                }
            });

            const otpCode = Math.floor(100000 + Math.random() * 900000).toLocaleString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10menit


            // Simpan otp ke db
            await prisma.passwordReet.create({
                data: {
                    userId: user.id,
                    code: otpCode,
                    expiresAt,
                    used: false
                } 
            });

            const emailService = new EmailService();
            const result = await emailService.sendForgotPasswordOtp(email, otpCode, user.name);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send reset code to email',
                    error: 'EMAIL_SEND_FAILED'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Password reset code sent to your email. Code valid for 10 minutes.',
                data: {
                    email: email
                }
            });

        } catch (error) {
            console.error('Send forgot password OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send reset code',
                error: 'SEND_FORGOT_PASSWORD_OTP_ERROR',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }

    // Verify Forgot Password OTP
    static async verifyForgotPasswordOTP(req, res) {
        try {
            const { email, otpCode } = req.body;

            if (!email || !otpCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and verification code are required',
                    error: 'MISSING_FIELDS'
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

            // Cari user
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No account found with this email address',
                    error: 'USER_NOT_FOUND'
                });
            }

            // Cari OTP yang valid
            const passwordReset = await prisma.passwordReset.findFirst({
                where: {
                    userId: user.id,
                    code: otpCode,
                    expiresAt: { gt: new Date() },
                    used: false
                }
            });

            if (!passwordReset) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification code',
                    error: 'INVALID_OTP'
                });
            }

            // Generate reset token untuk step selanjutnya
            const resetToken = JWTService.generateResetToken({
                userId: user.id,
                email: user.email,
                resetId: passwordReset.id
            });

            res.status(200).json({
                success: true,
                message: 'Verification code confirmed. You can now set your new password.',
                data: {
                    resetToken: resetToken,
                    email: user.email
                }
            });

        } catch (error) {
            console.error('Verify forgot password OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify code',
                error: 'VERIFY_FORGOT_PASSWORD_OTP_ERROR',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
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