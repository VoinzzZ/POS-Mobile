const RegistrationService = require('../services/registration.service');
const { checkValidate } = require('../utils/checkValidate.js');
const {
  createTenantSchema,
  sendEmailVerificationSchema,
  confirmEmailVerificationSchema,
  completeRegistrationSchema,
  registerEmployeeWithPinSchema,
  validatePinSchema
} = require('../validation/auth.validation.js');
const prisma = require('../config/mysql.db.js');

class RegistrationController {

  static async createTenant(req, res) {
    try {
      const { error, value } = checkValidate(createTenantSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const result = await RegistrationService.ownerRegisterStep1(value);

      res.status(201).json({
        success: true,
        message: 'Tenant registration created successfully',
        data: {
          registration_id: result.registration_tenant_id,
          tenant_id: result.tenant_id,
          tenant_name: result.tenant_name,
          current_step: result.current_step,
          next_step: result.next_step
        }
      });
    } catch (error) {
      let statusCode = 400;
      let message = error.message || 'Failed to create tenant registration';

      if (error.message.includes('sudah digunakan')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: message
      });
    }
  }

  static async validatePin(req, res) {
    try {
      const { error, value } = checkValidate(validatePinSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const result = await RegistrationService.validateEmployeePin(value.pin);

      res.status(200).json({
        success: true,
        message: 'PIN valid',
        data: {
          pin_valid: true,
          tenant_name: result.tenant_name,
          role_name: result.role_name,
          max_uses: result.max_uses,
          current_uses: result.current_uses
        }
      });
    } catch (error) {
      let statusCode = 400;
      let message = error.message || 'PIN tidak valid';

      if (error.message.includes('tidak valid') ||
        error.message.includes('kadaluarsa') ||
        error.message.includes('mencapai batas') ||
        error.message.includes('sudah digunakan') ||
        error.message.includes('dicabut') ||
        error.message.includes('batal')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: message
      });
    }
  }

  static async registerEmployeeWithPin(req, res) {
    try {
      const { error, value } = checkValidate(registerEmployeeWithPinSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const result = await RegistrationService.employeeRegisterStep1({
        pin: value.pin_registration,
        user_name: value.user_name,
        user_email: value.user_email,
        user_full_name: value.user_full_name,
        user_phone: value.user_phone
      });

      const responseData = {
        success: true,
        message: 'Employee registration initiated successfully',
        data: {
          registration_id: result.user_id,
          email: value.user_email,
          username: value.user_name,
          tenant_name: result.tenant_name,
          role_name: result.role_name,
          current_step: result.current_step,
          next_step: result.next_step
        }
      };

      console.log('✅ Employee registration response:', JSON.stringify(responseData, null, 2));

      res.status(201).json(responseData);
    } catch (error) {
      let statusCode = 400;
      let message = error.message || 'Failed to register employee';

      if (error.message.includes('sudah digunakan') ||
        error.message.includes('sudah terdaftar') ||
        error.message.includes('tidak valid') ||
        error.message.includes('kadaluarsa') ||
        error.message.includes('mencapai batas')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: message
      });
    }
  }

  static async sendEmailVerification(req, res) {
    try {
      const { error, value } = checkValidate(sendEmailVerificationSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      // First try to find employee registration by user_id (since registerEmployee returns user_id)
      const employeeReg = await prisma.s_registration_user.findUnique({
        where: { user_id: value.registration_id },
        include: { m_user: true, s_registration_pin: true }
      });

      if (employeeReg && employeeReg.m_user?.user_email === value.user_email) {
        const result = await RegistrationService.employeeRegisterStep1({
          pin: employeeReg.s_registration_pin.code,
          user_name: employeeReg.m_user?.user_name || value.user_name,
          user_email: value.user_email,
          user_full_name: value.user_full_name,
          user_phone: value.user_phone
        });

        return res.status(200).json({
          success: true,
          message: 'Verification email sent successfully',
          data: {
            registration_id: result.user_id,
            email: value.user_email,
            current_step: result.current_step,
            next_step: result.next_step
          }
        });
      }

      // If not employee, check tenant registration by ID
      const registration = await prisma.s_registration_tenant.findUnique({
        where: { id: value.registration_id },
        include: { m_user: true }
      });

      if (registration) {
        const result = await RegistrationService.ownerRegisterStep2({
          registration_tenant_id: value.registration_id,
          user_name: value.user_name || registration.m_user?.user_name,
          user_email: value.user_email,
          user_full_name: value.user_full_name,
          user_phone: value.user_phone
        });

        return res.status(200).json({
          success: true,
          message: 'Verification email sent successfully',
          data: {
            registration_id: result.user_id,
            email: value.user_email,
            current_step: result.current_step,
            next_step: result.next_step
          }
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });

    } catch (error) {
      let statusCode = 400;
      let message = error.message || 'Failed to send verification email';

      if (error.message.includes('sudah digunakan') ||
        error.message.includes('sudah terdaftar')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: message
      });
    }
  }

  static async confirmEmailVerification(req, res) {
    try {
      console.log('🔍 [START] confirmEmailVerification called');
      console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));

      const { error, value } = checkValidate(confirmEmailVerificationSchema, req);

      console.log('🔍 Validation result:', {
        hasError: !!error,
        error: error,
        value: value
      });

      if (error) {
        console.log('❌ Validation failed:', error);
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      console.log('🔍 Debug confirmEmailVerification:', {
        registration_id: value.registration_id,
        registration_id_type: typeof value.registration_id
      });

      const user = await prisma.m_user.findUnique({
        where: { user_id: value.registration_id },
        select: { registration_type: true, user_id: true, user_email: true }
      });

      console.log('🔍 User lookup result:', {
        found: !!user,
        user: user
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      let result;
      if (user.registration_type === 'OWNER') {
        result = await RegistrationService.ownerRegisterStep3({
          user_id: value.registration_id,
          otp_code: value.otp_code
        });
      } else if (user.registration_type === 'EMPLOYEE') {
        result = await RegistrationService.employeeRegisterStep2({
          user_id: value.registration_id,
          otp_code: value.otp_code
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipe registrasi tidak valid'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          registration_id: result.user_id,
          current_step: result.current_step,
          next_step: result.next_step
        }
      });
    } catch (error) {
      let statusCode = 400;
      let message = error.message || 'Failed to verify email';

      if (error.message.includes('tidak valid') ||
        error.message.includes('kadaluarsa')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: message
      });
    }
  }

  static async completeRegistration(req, res) {
    try {
      const { error, value } = checkValidate(completeRegistrationSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const user = await prisma.m_user.findUnique({
        where: { user_id: value.registration_id },
        select: { registration_type: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      let result;
      let nextStep;
      let status;

      if (user.registration_type === 'OWNER') {
        result = await RegistrationService.ownerRegisterStep4({
          user_id: value.registration_id,
          password: value.user_password
        });
        nextStep = 'WAITING_SA_APPROVAL';
      } else if (user.registration_type === 'EMPLOYEE') {
        result = await RegistrationService.employeeRegisterStep3({
          user_id: value.registration_id,
          password: value.user_password
        });
        nextStep = 'WAITING_OWNER_APPROVAL';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipe registrasi tidak valid'
        });
      }

      res.status(200).json({
        success: true,
        message: result.message || 'Registration completed successfully',
        data: {
          user_id: result.user_id,
          tenant_id: result.tenant_id,
          tenant_name: result.tenant_name,
          registration_completed: result.registration_completed,
          next_step: nextStep,
          status: 'PENDING'
        }
      });
    } catch (error) {
      let statusCode = 400;
      let message = error.message || 'Failed to complete registration';

      if (error.message.includes('tidak valid') ||
        error.message.includes('Step tidak valid')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: message
      });
    }
  }
}

module.exports = RegistrationController;
