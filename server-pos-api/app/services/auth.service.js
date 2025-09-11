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

}

module.exports = AuthService;
