const prisma = require('../config/mysql.db.js');
const validator = require('validator');
const EmailService = require('./email.service.js');
const PasswordService = require('../utils/passwordService.js');
const JWTService = require('../utils/jwtService.js');

const emailService = new EmailService();

async function register({ name, pin, role }) {
  return await prisma.$transaction(async (tx) => {
    const regPin = await tx.registrationPin.findFirst({
      where: { code: pin, used: false, expiresAt: { gt: new Date() } }
    });

    if (!regPin) throw new Error('Invalid or expired registration PIN');

    const newUser = await tx.user.create({ data: { name, role, isVerified: false } });

    await tx.registrationPin.update({
      where: { id: regPin.id },
      data: { used: true, usedAt: new Date() }
    });

    return newUser;
  });
}

async function sendEmailOTP({ userId, email }) {
  if (!validator.isEmail(email)) throw new Error('Invalid email format');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.emailVerification.deleteMany({ where: { userId, email, verified: false } });
    await tx.emailVerification.create({
      data: { userId, email, code: otpCode, expiresAt, verified: false }
    });
  });

  const result = await emailService.sendOtpEmail(email, otpCode);
  if (!result.success) throw new Error('Failed to send OTP email');

  return { message: 'OTP sent to email. Code valid for 5 minutes.' };
}

async function verifyEmailOTP({ userId, email, otpCode }) {
  if (!validator.isEmail(email)) throw new Error('Invalid email format');

  await prisma.$transaction(async (tx) => {
    const verification = await tx.emailVerification.findFirst({
      where: { userId, email, code: otpCode, expiresAt: { gt: new Date() }, verified: false }
    });

    if (!verification) throw new Error('Invalid or expired OTP');

    await Promise.all([
      tx.user.update({ where: { id: userId }, data: { email } }),
      tx.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true, verifiedAt: new Date() }
      })
    ]);
  });

  return { message: 'Email verified successfully' };
}

async function setPassword({ userId, newPassword, confirmPassword }) {
  const passwordValidation = PasswordService.validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return { success: false, message: 'Password validation failed', details: passwordValidation.errors };
  }

  const confirmValidation = PasswordService.validateConfirmPassword(newPassword, confirmPassword);
  if (!confirmValidation.isValid) {
    return { success: false, message: 'Passwords do not match', details: confirmValidation.errors };
  }

  const hashedPassword = await PasswordService.hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, isVerified: true, emailVerifiedAt: new Date() }
  });

  return { success: true, message: 'Password set successfully. Registration completed.' };
}

async function login({ email, password }) {
  if (!validator.isEmail(email)) throw new Error('Invalid email format');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isPasswordValid = await PasswordService.comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid email or password');

  if (!user.isVerified) throw new Error('Please verify your email before logging in');

  const payload = { userId: user.id, email: user.email, role: user.role, name: user.name };
  const { accessToken, refreshToken } = JWTService.generateTokenPair(payload);

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
        expiresIn: 900,
        refreshExpiresIn: 604800
      }
    }
  };
}

async function sendForgotPasswordOtp(email) {
  if (!validator.isEmail(email)) throw new Error('Invalid email format');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found with this email address');
  if (!user.isVerified) throw new Error('Please complete your registration first');

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.passwordReset.deleteMany({ where: { userId: user.id, used: false } });
    await tx.passwordReset.create({ data: { userId: user.id, code: otpCode, expiresAt, used: false } });
  });

  const result = await emailService.sendForgotPasswordOtp(email, otpCode, user.name);
  if (!result.success) throw new Error('Failed to send reset code to email');

  return { email, message: 'Password reset code sent. Valid for 10 minutes.' };
}

async function verifyForgotPasswordOTP(email, otpCode) {
  if (!validator.isEmail(email)) throw new Error('Invalid email format');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found with this email address');

  const passwordReset = await prisma.passwordReset.findFirst({
    where: { userId: user.id, code: otpCode, expiresAt: { gt: new Date() }, used: false }
  });

  if (!passwordReset) throw new Error('Invalid or expired verification code');

  const resetToken = JWTService.generateResetToken({
    userId: user.id,
    email: user.email,
    resetId: passwordReset.id
  });

  return {
    resetToken,
    email: user.email,
    message: 'Verification code confirmed. You can now set your new password.'
  };
}

async function resetPassword(resetToken, newPassword, confirmPassword) {
  let tokenData;
  try {
    tokenData = JWTService.verifyResetToken(resetToken);
  } catch {
    throw new Error('Invalid or expired reset token');
  }

  const passwordValidation = PasswordService.validatePassword(newPassword);
  if (!passwordValidation.isValid) throw new Error('Password validation failed');

  if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

  const passwordReset = await prisma.passwordReset.findFirst({
    where: {
      id: tokenData.resetId,
      userId: tokenData.userId,
      expiresAt: { gt: new Date() },
      used: false
    }
  });

  if (!passwordReset) throw new Error('Reset session has expired. Please request a new reset code.');

  const hashedPassword = await PasswordService.hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tokenData.userId },
      data: { password: hashedPassword, updatedAt: new Date() }
    });

    await tx.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true, updatedAt: new Date() }
    });

    await tx.passwordReset.deleteMany({
      where: { userId: tokenData.userId, used: false, id: { not: passwordReset.id } }
    });
  });

  return {
    message: 'Password has been reset successfully. You can now login with your new password.',
    email: tokenData.email
  };
}

async function changePassword(userId, currentPassword, newPassword, confirmPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isCurrentPasswordValid = await PasswordService.comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) throw new Error('Current password is incorrect');

  const passwordValidation = PasswordService.validatePassword(newPassword);
  if (!passwordValidation.isValid) throw new Error('Password validation failed');

  if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

  const hashedPassword = await PasswordService.hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

  return { message: 'Password changed successfully' };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

module.exports = {
  register,
  sendEmailOTP,
  verifyEmailOTP,
  setPassword,
  login,
  sendForgotPasswordOtp,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword,
  getProfile
};