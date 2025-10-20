const prisma = require('../config/mysql.db.js');
const PasswordService = require('../utils/passwordService.js');
const EmailService = require('./email.service.js');

const emailService = new EmailService();

// Helper function untuk generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class RegistrationService {
  // ==================== OWNER/TENANT REGISTRATION (4 STEPS) ====================
  
  // Step 1: Register Tenant Information
  static async ownerRegisterStep1(data) {
    const { tenant_name, tenant_phone, tenant_email, tenant_address, tenant_description } = data;

    return await prisma.$transaction(async (tx) => {
      // Check if tenant name already exists
      const existingTenant = await tx.m_tenant.findFirst({
        where: {
          tenant_name,
          deleted_at: null
        }
      });

      if (existingTenant) {
        throw new Error('Nama toko sudah digunakan. Silakan pilih nama lain');
      }

      // Create tenant with PENDING status
      const newTenant = await tx.m_tenant.create({
        data: {
          tenant_name,
          tenant_phone,
          tenant_email: tenant_email || null,
          tenant_address,
          tenant_description,
          tenant_status: 'PENDING',
          is_active: false,
          max_users: 7
        }
      });

      // Create temporary user placeholder (will be completed in step 2)
      const tempUser = await tx.m_user.create({
        data: {
          user_name: `temp_${Date.now()}`,
          user_email: `temp_${Date.now()}@placeholder.com`,
          tenant_id: newTenant.tenant_id,
          registration_step: 1,
          registration_type: 'OWNER',
          is_active: false
        }
      });

      // Create registration tracking
      const registration = await tx.s_registration_tenant.create({
        data: {
          user_id: tempUser.user_id,
          tenant_id: newTenant.tenant_id,
          current_step: 1,
          temp_tenant_data: {
            tenant_name,
            tenant_phone,
            tenant_email,
            tenant_address,
            tenant_description
          }
        }
      });

      return {
        registration_tenant_id: registration.id,
        tenant_id: newTenant.tenant_id,
        user_id: tempUser.user_id,
        tenant_name,
        current_step: 1,
        next_step: 2,
        message: 'Informasi toko berhasil disimpan. Silakan lanjut ke Step 2'
      };
    });
  }


  // Step 2: Register Owner User Information + Send OTP
  static async ownerRegisterStep2(data) {
    const { registration_tenant_id, user_name, user_email, user_full_name, user_phone } = data;

    return await prisma.$transaction(async (tx) => {
      console.log('🔄 Starting ownerRegisterStep2 transaction...');
      // Find registration
      const registration = await tx.s_registration_tenant.findUnique({
        where: { id: registration_tenant_id },
        include: { m_tenant: true, m_user: true }
      });

      if (!registration) {
        throw new Error('Registration tidak ditemukan');
      }

      if (registration.current_step !== 1) {
        throw new Error(`Step tidak valid. Current step: ${registration.current_step}`);
      }

      // Check if username already exists
      const existingUsername = await tx.m_user.findFirst({
        where: {
          user_name,
          deleted_at: null,
          user_id: { not: registration.user_id }
        }
      });

      if (existingUsername) {
        throw new Error('Username sudah digunakan. Silakan pilih username lain');
      }

      // Check if email already exists
      const existingEmail = await tx.m_user.findFirst({
        where: {
          user_email,
          deleted_at: null,
          user_id: { not: registration.user_id }
        }
      });

      if (existingEmail) {
        throw new Error('Email sudah terdaftar. Gunakan email lain');
      }

      // Get OWNER role
      const ownerRole = await tx.m_role.findFirst({
        where: {
          role_code: 'OWNER',
          is_active: true,
          deleted_at: null
        }
      });

      if (!ownerRole) {
        throw new Error('Role OWNER tidak ditemukan. Hubungi administrator');
      }

      // Update user with real information
      await tx.m_user.update({
        where: { user_id: registration.user_id },
        data: {
          user_name,
          user_email,
          user_full_name,
          user_phone,
          role_id: ownerRole.role_id,
          registration_step: 2
        }
      });

      // Update registration tracking
      await tx.s_registration_tenant.update({
        where: { id: registration_tenant_id },
        data: {
          current_step: 2,
          temp_user_data: {
            user_name,
            user_email,
            user_full_name,
            user_phone
          }
        }
      });

      // Generate and save OTP
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await tx.s_email_verification.create({
        data: {
          user_id: registration.user_id,
          email: user_email,
          code: otpCode,
          expires_at: otpExpiresAt,
          type: 'REGISTRATION'
        }
      });

      // Send OTP via email
      try {
        console.log('📧 Attempting to send OTP email...');
        await emailService.sendOtpEmail(user_email, otpCode);
        console.log('✅ OTP email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending OTP email:', emailError);
        // Log OTP to console for development
        console.log(`🔢 OTP for ${user_email}: ${otpCode}`);
      }

      return {
        user_id: registration.user_id,
        user_email,
        user_name,
        tenant_name: registration.m_tenant.tenant_name,
        current_step: 2,
        next_step: 3,
        message: 'Kode OTP telah dikirim ke email Anda. Silakan verifikasi'
      };
    });
  }

  // Step 3: Verify OTP
  static async ownerRegisterStep3(data) {
    const { user_id, otp_code } = data;

    return await prisma.$transaction(async (tx) => {
      // Find user
      const user = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'OWNER',
          deleted_at: null
        }
      });

      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      if (user.registration_step !== 2) {
        throw new Error(`Step tidak valid. Current step: ${user.registration_step}`);
      }

      // Find valid OTP
      const emailVerification = await tx.s_email_verification.findFirst({
        where: {
          user_id: user_id,
          code: otp_code,
          verified: false,
          expires_at: { gt: new Date() },
          type: 'REGISTRATION'
        },
        orderBy: { created_at: 'desc' }
      });

      if (!emailVerification) {
        throw new Error('Kode OTP tidak valid atau sudah kadaluarsa');
      }

      // Mark OTP as verified
      await tx.s_email_verification.update({
        where: { id: emailVerification.id },
        data: {
          verified: true,
          verified_at: new Date()
        }
      });

      // Update user
      await tx.m_user.update({
        where: { user_id },
        data: {
          user_is_verified: true,
          registration_step: 3
        }
      });

      // Update registration tracking
      const registration = await tx.s_registration_tenant.findFirst({
        where: { user_id }
      });

      if (registration) {
        await tx.s_registration_tenant.update({
          where: { id: registration.id },
          data: {
            current_step: 3
          }
        });
      }

      return {
        user_id,
        current_step: 3,
        next_step: 4,
        message: 'Email berhasil diverifikasi. Silakan set password Anda'
      };
    });
  }

  // Step 4: Set Password & Complete Registration
  static async ownerRegisterStep4(data) {
    const { user_id, password } = data;

    return await prisma.$transaction(async (tx) => {
      // Find user with tenant
      const user = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'OWNER',
          deleted_at: null
        },
        include: { m_tenant: true }
      });

      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      if (user.registration_step !== 3) {
        throw new Error(`Step tidak valid. Current step: ${user.registration_step}`);
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // Update user with password
      await tx.m_user.update({
        where: { user_id },
        data: {
          user_password: hashedPassword,
          registration_step: 4,
          is_active: false // Waiting for SA approval
        }
      });

      // Update registration tracking
      const registration = await tx.s_registration_tenant.findFirst({
        where: { user_id }
      });

      if (registration) {
        await tx.s_registration_tenant.update({
          where: { id: registration.id },
          data: {
            current_step: 4,
            registration_done: true,
            registration_done_at: new Date()
          }
        });
      }

      return {
        user_id,
        tenant_id: user.tenant_id,
        tenant_name: user.m_tenant?.tenant_name,
        current_step: 4,
        registration_completed: true,
        message: 'Registrasi berhasil! Akun Anda menunggu persetujuan dari Super Admin'
      };
    });
  }

  // ==================== EMPLOYEE REGISTRATION (3 STEPS) ====================

  // Step 1: Register Employee with PIN + Send OTP
  static async employeeRegisterStep1(data) {
    const { pin: registration_pin_code, user_name, user_email, user_full_name, user_phone } = data;

    return await prisma.$transaction(async (tx) => {
      // Validate PIN
      const pin = await tx.s_registration_pin.findFirst({
        where: {
          code: registration_pin_code,
          used: false,
          revoked_at: null
        },
        include: { m_tenant: true, m_role: true }
      });

      if (!pin) {
        throw new Error('PIN registrasi tidak valid atau sudah digunakan');
      }

      // Check PIN expiry
      if (new Date() > pin.expires_at) {
        throw new Error('PIN sudah kadaluarsa. Silakan minta PIN baru dari owner');
      }

      // Check PIN usage limit
      if (pin.current_uses >= pin.max_uses) {
        throw new Error('PIN sudah mencapai batas penggunaan');
      }

      // Check if username exists
      const existingUsername = await tx.m_user.findFirst({
        where: { user_name, deleted_at: null }
      });

      if (existingUsername) {
        throw new Error('Username sudah digunakan. Silakan pilih username lain');
      }

      // Check if email exists
      const existingEmail = await tx.m_user.findFirst({
        where: { user_email, deleted_at: null }
      });

      if (existingEmail) {
        throw new Error('Email sudah terdaftar. Gunakan email lain');
      }

      // Create employee user
      const newEmployee = await tx.m_user.create({
        data: {
          user_name,
          user_email,
          user_full_name,
          user_phone,
          tenant_id: pin.tenant_id,
          role_id: pin.invited_role_id,
          registration_type: 'EMPLOYEE',
          registration_step: 1,
          is_active: false,
          created_by: pin.created_by
        }
      });

      // Create registration tracking
      await tx.s_registration_user.create({
        data: {
          user_id: newEmployee.user_id,
          registration_pin_id: pin.id,
          current_step: 1,
          temp_user_data: {
            user_name,
            user_email,
            user_full_name,
            user_phone
          }
        }
      });

      // Update PIN usage
      await tx.s_registration_pin.update({
        where: { id: pin.id },
        data: {
          used: true,
          used_at: new Date(),
          current_uses: pin.current_uses + 1
        }
      });

      // Generate and save OTP
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await tx.s_email_verification.create({
        data: {
          user_id: newEmployee.user_id,
          email: user_email,
          code: otpCode,
          expires_at: otpExpiresAt,
          type: 'REGISTRATION'
        }
      });

      // Send OTP via email
      try {
        await emailService.sendOtpEmail(user_email, otpCode);
      } catch (emailError) {
        console.error('Error sending OTP email:', emailError);
        console.log(`OTP for ${user_email}: ${otpCode}`);
      }

      return {
        user_id: newEmployee.user_id,
        user_email,
        user_name,
        tenant_name: pin.m_tenant.tenant_name,
        role_name: pin.m_role?.role_name,
        current_step: 1,
        next_step: 2,
        message: 'Kode OTP telah dikirim ke email Anda. Silakan verifikasi'
      };
    });
  }

  // Step 2: Verify OTP for Employee
  static async employeeRegisterStep2(data) {
    const { user_id, otp_code } = data;

    return await prisma.$transaction(async (tx) => {
      // Find user
      const user = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'EMPLOYEE',
          deleted_at: null
        }
      });

      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      if (user.registration_step !== 1) {
        throw new Error(`Step tidak valid. Current step: ${user.registration_step}`);
      }

      // Find valid OTP
      const emailVerification = await tx.s_email_verification.findFirst({
        where: {
          user_id: user_id,
          code: otp_code,
          verified: false,
          expires_at: { gt: new Date() },
          type: 'REGISTRATION'
        },
        orderBy: { created_at: 'desc' }
      });

      if (!emailVerification) {
        throw new Error('Kode OTP tidak valid atau sudah kadaluarsa');
      }

      // Mark OTP as verified
      await tx.s_email_verification.update({
        where: { id: emailVerification.id },
        data: {
          verified: true,
          verified_at: new Date()
        }
      });

      // Update user
      await tx.m_user.update({
        where: { user_id },
        data: {
          user_is_verified: true,
          registration_step: 2
        }
      });

      // Update registration tracking
      const registration = await tx.s_registration_user.findFirst({
        where: { user_id }
      });

      if (registration) {
        await tx.s_registration_user.update({
          where: { id: registration.id },
          data: {
            current_step: 2
          }
        });
      }

      return {
        user_id,
        current_step: 2,
        next_step: 3,
        message: 'Email berhasil diverifikasi. Silakan set password Anda'
      };
    });
  }


  // Step 3: Set Password & Complete Employee Registration
  static async employeeRegisterStep3(data) {
    const { user_id, password } = data;

    return await prisma.$transaction(async (tx) => {
      // Find user with tenant
      const user = await tx.m_user.findFirst({
        where: {
          user_id,
          registration_type: 'EMPLOYEE',
          deleted_at: null
        },
        include: { m_tenant: true }
      });

      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      if (user.registration_step !== 2) {
        throw new Error(`Step tidak valid. Current step: ${user.registration_step}`);
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // Update user with password
      await tx.m_user.update({
        where: { user_id },
        data: {
          user_password: hashedPassword,
          registration_step: 3,
          is_active: false // Waiting for owner approval
        }
      });

      // Update registration tracking
      const registration = await tx.s_registration_user.findFirst({
        where: { user_id }
      });

      if (registration) {
        await tx.s_registration_user.update({
          where: { id: registration.id },
          data: {
            current_step: 3,
            registration_done: true,
            registration_done_at: new Date()
          }
        });
      }

      return {
        user_id,
        tenant_id: user.tenant_id,
        tenant_name: user.m_tenant?.tenant_name,
        current_step: 3,
        registration_completed: true,
        message: 'Registrasi berhasil! Akun Anda menunggu persetujuan dari Owner'
      };
    });
  }
}

module.exports = RegistrationService;