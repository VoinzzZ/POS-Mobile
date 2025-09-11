const prisma = require('../config/mysql.db');
const { ValidationError, NotFoundError } = require('../utils/errors');
const validator = require('validator');
const EmailService = require('./email.service');
const PasswordService = require('../utils/passwordService');
const JWTService = require('../utils/jwtService');

class AuthService {
    constructor() {
        this.prisma = prisma;
        this.emailService = new EmailService();
    }

    async findUserById(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    async findUserByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    validateEmail(email) {
        if (!validator.isEmail(email)) {
            throw new ValidationError('Invalid email format');
        }
        return email.toLowerCase();
    }

    async register({ name, pin, role }) {
        return await this.prisma.$transaction(async (tx) => {
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
    }

    async sendEmailOTP({ userId, email }) {
        const validatedEmail = this.validateEmail(email);
        await this.findUserById(userId);

        const otpCode = this.generateOTP();
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

        return { message: 'OTP sent to email. Code valid for 5 minutes.' };
    }

    async verifyEmailOTP({ userId, email, otpCode }) {
        const validatedEmail = this.validateEmail(email);

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

        return { message: 'Email verified successfully' };
    }

    async setPassword({ userId, newPassword, confirmPassword }) {
        const passwordValidation = PasswordService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new ValidationError('Password validation failed', 400, 'WEAK_PASSWORD', passwordValidation.errors);
        }

        if (newPassword !== confirmPassword) {
            throw new ValidationError('Passwords do not match', 400, 'PASSWORD_MISMATCH');
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

        return { message: 'Password set successfully. Registration completed.' };
    }

    async login({ email, password }) {
        if (!validator.isEmail(email)) {
            throw new ValidationError('Invalid email format', 400, 'INVALID_EMAIL');
        }

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        const isPasswordValid = await PasswordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        if (!user.isVerified) {
            throw new ValidationError('Please verify your email before logging in', 403, 'EMAIL_NOT_VERIFIED');
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload);

        return {
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
                    expiresIn: 900,       // 15 minutes
                    refreshExpiresIn: 604800 // 7 days
                }
            }
        };
    }

    async sendForgotPasswordOtp(email) {
        const validatedEmail = this.validateEmail(email);

        const user = await this.findUserByEmail(validatedEmail);
        if (!user) throw new NotFoundError('No account found with this email address');
        if (!user.isVerified) throw new ValidationError('Please complete your registration first');

        const otpCode = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.$transaction(async (tx) => {
            await tx.passwordReset.deleteMany({
                where: { userId: user.id, used: false }
            });

            await tx.passwordReset.create({
                data: { userId: user.id, code: otpCode, expiresAt, used: false }
            });
        });

        const result = await this.emailService.sendForgotPasswordOtp(validatedEmail, otpCode, user.name);
        if (!result.success) throw new Error('Failed to send reset code to email');

        return { email: validatedEmail, message: 'Password reset code sent. Valid for 10 minutes.' };
    }

    async verifyForgotPasswordOTP(email, otpCode) {
    const validatedEmail = this.validateEmail(email);

    const user = await this.findUserByEmail(validatedEmail);
    if (!user) throw new NotFoundError('No account found with this email address');

    const passwordReset = await this.prisma.passwordReset.findFirst({
        where: {
            userId: user.id,
            code: otpCode,
            expiresAt: { gt: new Date() },
            used: false
        }
    });

    if (!passwordReset) throw new ValidationError('Invalid or expired verification code');

    const resetToken = JWTService.generateResetToken({
        userId: user.id,
        email: user.email,
        resetId: passwordReset.id
    });

    return { resetToken, email: user.email, message: 'Verification code confirmed. You can now set your new password.' };
}

}

module.exports = AuthService;