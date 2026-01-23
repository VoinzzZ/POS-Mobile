const prisma = require('../config/mysql.db.js');
const AuthService = require('../services/auth.service');

class AuthController {

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser({
        email,
        password
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login gagal'
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      console.log('🔄 Refresh token request:', {
        hasRefreshToken: !!refreshToken,
        tokenLength: refreshToken ? refreshToken.length : 0,
        tokenStart: refreshToken ? refreshToken.substring(0, 20) + '...' : 'none'
      });

      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token berhasil diperbarui',
        data: result
      });
    } catch (error) {
      console.log('❌ Refresh token error:', {
        message: error.message,
        stack: error.stack
      });

      res.status(401).json({
        success: false,
        message: error.message || 'Refresh token gagal'
      });
    }
  }

  static async logout(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout berhasil'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Logout gagal'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const { userId } = req.user;

      const result = await AuthService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile berhasil diambil',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil profile'
      });
    }
  }

  static async getTenantInfo(req, res) {
    try {
      const { tenantId } = req.user;

      const tenant = await prisma.m_tenant.findFirst({
        where: {
          tenant_id: tenantId,
          deleted_at: null
        },
        select: {
          tenant_id: true,
          tenant_name: true,
          tenant_status: true,
          tenant_phone: true,
          tenant_email: true,
          tenant_description: true,
          tenant_address: true,
          is_active: true,
          max_users: true,
          created_at: true,
          approved_at: true
        }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Tenant info berhasil diambil',
        data: tenant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil tenant info'
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { userId } = req.user;
      const updateData = req.body;

      const result = await AuthService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memperbarui profil'
      });
    }
  }

  static async sendEmailChangeOTP(req, res) {
    try {
      const { userId } = req.user;
      const { newEmail, currentPassword } = req.body;

      if (!newEmail || !currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email baru dan password saat ini wajib diisi'
        });
      }

      const result = await AuthService.sendEmailChangeOTP(userId, newEmail, currentPassword);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          newEmail: result.newEmail,
          expiresAt: result.expiresAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengirim kode OTP'
      });
    }
  }

  static async verifyEmailChangeOTP(req, res) {
    try {
      const { userId } = req.user;
      const { otpCode } = req.body;

      if (!otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Kode OTP wajib diisi'
        });
      }

      const result = await AuthService.verifyEmailChangeOTP(userId, otpCode);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          newEmail: result.newEmail
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memverifikasi kode OTP'
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const { userId } = req.user;
      const { current_password, new_password, confirm_password } = req.body;

      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      const result = await AuthService.changePassword(userId, current_password, new_password, confirm_password);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengubah password'
      });
    }
  }

  static async verifyCurrentPassword(req, res) {
    try {
      const { userId } = req.user;
      const { currentPassword } = req.body;

      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password saat ini wajib diisi'
        });
      }

      const result = await AuthService.verifyCurrentPassword(userId, currentPassword);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memverifikasi password'
      });
    }
  }

  static async sendForgotPasswordOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email wajib diisi'
        });
      }

      const result = await AuthService.sendForgotPasswordOTP(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email: result.email,
          expiresAt: result.expiresAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengirim kode OTP'
      });
    }
  }

  static async verifyForgotPasswordOTP(req, res) {
    try {
      const { email, otpCode } = req.body;

      if (!email || !otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Email dan kode OTP wajib diisi'
        });
      }

      const result = await AuthService.verifyForgotPasswordOTP(email, otpCode);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email: result.email
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memverifikasi kode OTP'
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email, otpCode, new_password, confirm_password } = req.body;

      if (!email || !otpCode || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      const result = await AuthService.resetPassword(email, otpCode, new_password, confirm_password);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mereset password'
      });
    }
  }
}

module.exports = AuthController;
