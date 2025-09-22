const AuthService = require('../services/auth.service');
const JWTService = require('../utils/jwtService');

async function register(req, res) {
  try {
    const { userName, pin, email, role } = req.body;
    if (!userName || !pin || !email) {
      return res.status(400).json({ success: false, message: 'userName, pin, and email are required' });
    }

    const result = await AuthService.register({ userName, pin, email, role });
    res.status(201).json({ success: true, message: result.message, data: { userId: result.userId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function verifyEmailOTP(req, res) {
  try {
    const { userId, otpCode } = req.body;
    if (!userId || !otpCode) {
      return res.status(400).json({ success: false, message: 'userId and otpCode are required' });
    }

    const result = await AuthService.verifyEmailOTP({ userId, otpCode });
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function setPassword(req, res) {
  try {
    const { userId, newPassword} = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'userI and newPassword are required' });
    }

    const result = await AuthService.setPassword({ userId, newPassword });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message, details: result.details });
    }

    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const result = await AuthService.login({ email, password });
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function refreshToken(req, res) {
  try {
    const { userId, email, role, name } = req.user;
    const tokenPayload = { userId, email, role, name };
    const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens: { accessToken, refreshToken, expiresIn: 900, refreshExpiresIn: 604800 } }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function sendForgotPasswordOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'email is required' });
    }

    const result = await AuthService.sendForgotPasswordOtp(email);
    res.json({ success: true, message: result.message, data: { email: result.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function verifyForgotPasswordOTP(req, res) {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'email and otpCode are required' });
    }

    const result = await AuthService.verifyForgotPasswordOTP(email, otpCode);
    res.json({ success: true, message: result.message, data: { resetToken: result.resetToken, email: result.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'resetToken, newPassword, and confirmPassword are required' });
    }

    const result = await AuthService.resetPassword(resetToken, newPassword, confirmPassword);
    res.json({ success: true, message: result.message, data: { email: result.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword, newPassword, and confirmPassword are required' });
    }

    const { userId } = req.user;
    const result = await AuthService.changePassword(userId, currentPassword, newPassword, confirmPassword);
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const { userId } = req.user;
    const profile = await AuthService.getProfile(userId);

    res.json({ success: true, message: 'Profile retrieved successfully', data: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  verifyEmailOTP,
  setPassword,
  login,
  refreshToken,
  sendForgotPasswordOtp,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword,
  getProfile
};