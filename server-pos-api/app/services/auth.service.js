const prisma = require('../config/mysql.db.js');
const validator = require('validator');
const EmailService = require('./email.service.js');
const PasswordService = require('../utils/passwordService.js');
const JWTService = require('../utils/jwtService.js');

const emailService = new EmailService();

async function register({ userName, email, pin, role = "CASHIER" }) {
  if (!userName || !email || !pin) throw new Error("userName, email, and pin are required");
  if (!validator.isEmail(email)) throw new Error("Invalid email format");

  return await prisma.$transaction(async (tx) => {
    const regPin = await tx.registrationPin.findFirst({
      where: { code: pin, used: false, expiresAt: { gt: new Date() } },
    });
    if (!regPin) throw new Error("Invalid or expired registration PIN");

    const newUser = await tx.user.create({
      data: {
        userName,
        email,
        role,
        isVerified: false,
      },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);

    await tx.emailVerification.deleteMany({
      where: { userId: newUser.id, email, verified: false },
    });

    await tx.emailVerification.create({
      data: { 
        userId: newUser.id, 
        email, 
        code: otpCode, 
        expiresAt: otpExpiredAt, 
        verified: false 
      },
    });

    await tx.registrationPin.update({
      where: { id: regPin.id },
      data: { used: true, usedAt: new Date() },
    });

    return { 
      userId: newUser.id,
      otpCode: otpCode,
      message: "User registered. OTP will be sent to email."
    };
  })
  .then(async (result) => {
    const emailResult = await emailService.sendOtpEmail(email, result.otpCode);
    if (!emailResult.success) {
      console.error("Failed to send OTP email");
    }
    return { userId: result.userId, message: "User registered. OTP sent to email." };
  });
}

async function verifyEmailOTP({ userId, otpCode }) {
  if (!userId || !otpCode) throw new Error('userId and otpCode are required');

  const emailVerification = await prisma.emailVerification.findFirst({
    where: {
      userId,
      code: otpCode,
      verified: false,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!emailVerification) throw new Error('Invalid or expired OTP');
  if (emailVerification.user.isVerified) throw new Error('Email already verified');

  await prisma.$transaction(async (tx) => {
    await tx.emailVerification.update({
      where: { id: emailVerification.id },
      data: { verified: true }
    });

    await tx.user.update({
      where: { id: userId },
      data: { isVerified: false }
    });
  });

  return { message: 'Email verified successfully. Please set your password.' };
}

async function setPassword({ userId, newPassword }) {
  if (!userId || !newPassword) throw new Error('userId and newPassword are required');

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      emailVerifications: {
        where: { verified: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!user) throw new Error('User not found');
  if (user.isVerified) throw new Error('User already verified');
  if (!user.emailVerifications.length) throw new Error('Please verify your email first');

  const passwordValidation = PasswordService.validatePassword(newPassword);
  if (!passwordValidation.isValid) throw new Error('Password validation failed');

  const hashedPassword = await PasswordService.hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { 
      password: hashedPassword, 
      isVerified: true,
    }
  });

  const payload = { 
    userId: updatedUser.id, 
    email: updatedUser.email, 
    role: updatedUser.role, 
    userName: updatedUser.userName 
  };
  
  const { accessToken, refreshToken } = JWTService.generateTokenPair(payload);

  return {
    message: 'Password set successfully. Registration completed.',
    data: {
      user: {
        userId: updatedUser.id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
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


async function login({ email, password }) {
  if (!email || !password) throw new Error('Email and password are required');
  if (!validator.isEmail(email)) throw new Error('Invalid email format');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isPasswordValid = await PasswordService.comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid email or password');

  if (!user.isVerified) throw new Error('Please verify your email before logging in');

  const payload = { userId: user.id, email: user.email, role: user.role, userName: user.userName };
  const { accessToken, refreshToken } = JWTService.generateTokenPair(payload);

  return {
    message: 'Login successful',
    data: {
      user: {
        userId: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      tokens: { accessToken, refreshToken, expiresIn: 900, refreshExpiresIn: 604800 }
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
    userName: user.name,
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
  verifyEmailOTP,
  setPassword,
  login,
  sendForgotPasswordOtp,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword,
  getProfile
};