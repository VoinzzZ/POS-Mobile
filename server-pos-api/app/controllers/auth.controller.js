const prisma = require('../config/mysql.db.js');
const AuthService = require('../services/auth.service');

class AuthController {
  // ==================== AUTHENTICATION ====================

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
      console.error('Login error:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Login gagal'
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token berhasil diperbarui',
        data: result
      });
    } catch (error) {
      console.error('Refresh token error:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Refresh token gagal'
      });
    }
  }

  static async logout(req, res) {
    try {
      // For now, just return success
      // In production, you might want to invalidate tokens
      res.status(200).json({
        success: true,
        message: 'Logout berhasil'
      });
    } catch (error) {
      console.error('Logout error:', error);

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
      console.error('Get profile error:', error);

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
      console.error('Get tenant info error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil tenant info'
      });
    }
  }
}

module.exports = AuthController;
