const prisma = require('../config/mysql.db.js');
const PasswordService = require('../utils/passwordService.js');
const JWTService = require('../utils/jwtService.js');

class AuthService {
  static async loginUser({ email, password }) {
    if (!email || !password) {
      throw new Error("Email dan password wajib diisi");
    }

    return await prisma.$transaction(async (tx) => {
    // Find user with relations
    const user = await tx.m_user.findFirst({
      where: {
        user_email: email,
        deleted_at: null
      },
      include: {
        m_role: true,
        m_tenant: true
      }
    });

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Check if user is locked
    if (user.user_locked_until && user.user_locked_until > new Date()) {
      throw new Error("Akun dikunci sementara. Silakan coba lagi nanti");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error("Akun tidak aktif. Hubungi administrator");
    }

    // Check if email is verified
    if (!user.user_is_verified) {
      throw new Error("Email belum diverifikasi. Silakan periksa email Anda");
    }

    // Check tenant status for non-SA users
    if (!user.is_sa && user.m_tenant) {
      if (user.m_tenant.tenant_status !== 'APPROVED') {
        throw new Error("Toko belum disetujui oleh administrator. Mohon menunggu persetujuan");
      }

      if (!user.m_tenant.is_active) {
        throw new Error("Toko tidak aktif. Hubungi administrator");
      }
    }

    // Verify password
    const isPasswordValid = await PasswordService.comparePassword(password, user.user_password);
    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.user_login_attempts + 1;
      const maxAttempts = 5;

      await tx.m_user.update({
        where: { user_id: user.user_id },
        data: {
          user_login_attempts: newAttempts,
          user_locked_until: newAttempts >= maxAttempts
            ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
            : null
        }
      });

      throw new Error("Email atau password salah");
    }

    // Reset login attempts on successful login
    await tx.m_user.update({
      where: { user_id: user.user_id },
      data: {
        user_last_login: new Date(),
        user_login_attempts: 0,
        user_locked_until: null
      }
    });

  
    // Generate tokens using generateTokenPair for complete structure
    const tokenPayload = {
      userId: user.user_id,
      email: user.user_email,
      role: user.m_role?.role_name || 'SA',
      name: user.user_full_name || user.user_name,
      tenantId: user.tenant_id,
      is_sa: user.is_sa
    };

    const rawTokens = JWTService.generateTokenPair(tokenPayload);

    // Transform to snake_case for frontend compatibility
    const tokens = {
      access_token: rawTokens.accessToken,
      refresh_token: rawTokens.refreshToken,
      expires_in: rawTokens.expiresIn,
      refresh_expires_in: rawTokens.refreshExpiresIn,
      tokenType: rawTokens.tokenType
    };

      return {
        user: {
          id: user.user_id,
          name: user.user_full_name || user.user_name,
          email: user.user_email,
          role: user.m_role?.role_name || 'SA',
          roleId: user.role_id,
          tenantId: user.tenant_id,
          tenantName: user.m_tenant?.tenant_name,
          isSA: user.is_sa,
          isVerified: user.user_is_verified,
          lastLogin: user.user_last_login
        },
        tokens: tokens,
        message: "Login berhasil"
      };
    });
  }

    static async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("Refresh token diperlukan");
    }

    try {
      console.log('🔍 Verifying refresh token...');
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      console.log('✅ Refresh token verified:', {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type
      });

    const user = await prisma.m_user.findFirst({
      where: {
        user_id: decoded.userId,
        user_email: decoded.email,
        deleted_at: null,
        user_is_active: true
      },
      include: {
        m_role: true,
        m_tenant: true
      }
    });

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const tokenPayload = {
      userId: user.user_id,
      email: user.user_email,
      role: user.m_role?.role_name || 'SA',
      name: user.user_full_name || user.user_name,
      tenantId: user.tenant_id
    };

    const rawTokens = JWTService.generateTokenPair(tokenPayload);

    // Transform to snake_case for frontend compatibility
    const tokens = {
      access_token: rawTokens.accessToken,
      refresh_token: rawTokens.refreshToken,
      expires_in: rawTokens.expiresIn,
      refresh_expires_in: rawTokens.refreshExpiresIn,
      tokenType: rawTokens.tokenType
    };

      return {
        tokens: tokens,
        user: {
          id: user.user_id,
          name: user.user_full_name || user.user_name,
          email: user.user_email,
          role: user.m_role?.role_name || 'SA',
          tenantId: user.tenant_id,
          tenantName: user.m_tenant?.tenant_name
        }
      };
    } catch (error) {
      throw new Error("Refresh token tidak valid atau sudah kadaluarsa");
    }
  }

    static async getUserProfile(userId) {
    const user = await prisma.m_user.findFirst({
    where: {
      user_id: userId,
      deleted_at: null
    },
    include: {
      m_role: {
        select: {
          role_id: true,
          role_name: true,
          role_description: true
        }
      },
      m_tenant: {
        select: {
          tenant_id: true,
          tenant_name: true,
          tenant_status: true,
          is_active: true
        }
      }
    }
  });

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    return {
      id: user.user_id,
      name: user.user_full_name || user.user_name,
      email: user.user_email,
      phone: user.user_phone,
      role: user.m_role,
      tenant: user.m_tenant,
      isSA: user.is_sa,
      isVerified: user.user_is_verified,
      lastLogin: user.user_last_login
    };
  }
}

module.exports = AuthService;