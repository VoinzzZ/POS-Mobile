const RegistrationService = require('../services/registration.service');
const { checkValidate } = require('../utils/checkValidate.js');
const {
  createTenantSchema,
  sendEmailVerificationSchema,
  confirmEmailVerificationSchema,
  completeRegistrationSchema,
  registerEmployeeWithPinSchema
} = require('../validation/auth.validation.js');
const prisma = require('../config/mysql.db.js');

class RegistrationController {

  // Step 1: Create Tenant Registration
  static async createTenant(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(createTenantSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      // Call existing service method
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
      console.error('Create tenant error:', error);

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

  // Employee Registration with PIN
  static async registerEmployeeWithPin(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(registerEmployeeWithPinSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const result = await RegistrationService.employeeRegisterStep1({
        registration_pin_code: value.pin_registration,
        user_name: value.user_name,
        user_email: value.user_email,
        user_full_name: value.user_full_name,
        user_phone: value.user_phone
      });

      res.status(201).json({
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
      });
    } catch (error) {
      console.error('Register employee with PIN error:', error);

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

  // Step 2: Send Email Verification (for owner and employee)
  static async sendEmailVerification(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(sendEmailVerificationSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      // Determine registration type based on registration_id
      const registration = await prisma.s_registration_tenant.findUnique({
        where: { id: value.registration_id },
        include: { m_user: true }
      });

      if (!registration) {
        // Check if it's employee registration
        const employeeReg = await prisma.s_registration_user.findUnique({
          where: { id: value.registration_id },
          include: { m_user: true }
        });

        if (!employeeReg) {
          return res.status(404).json({
            success: false,
            message: 'Registration not found'
          });
        }

        // Handle employee email verification
        const result = await RegistrationService.employeeRegisterStep1({
          registration_pin_code: employeeReg.registration_pin_id,
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

      // Handle owner email verification
      const result = await RegistrationService.ownerRegisterStep2({
        registration_tenant_id: value.registration_id,
        user_name: value.user_name || registration.m_user?.user_name,
        user_email: value.user_email,
        user_full_name: value.user_full_name,
        user_phone: value.user_phone
      });

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        data: {
          registration_id: result.user_id,
          email: value.user_email,
          current_step: result.current_step,
          next_step: result.next_step
        }
      });
    } catch (error) {
      console.error('Send email verification error:', error);

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

  // Step 3: Confirm Email Verification (for both owner and employee)
  static async confirmEmailVerification(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(confirmEmailVerificationSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      // Try owner verification first
      try {
        const result = await RegistrationService.ownerRegisterStep3({
          user_id: value.registration_id,
          otp_code: value.otp_code
        });

        return res.status(200).json({
          success: true,
          message: 'Email verified successfully',
          data: {
            registration_id: result.user_id,
            current_step: result.current_step,
            next_step: result.next_step
          }
        });
      } catch (ownerError) {
        // If owner verification fails, try employee verification
        try {
          const result = await RegistrationService.employeeRegisterStep2({
            user_id: value.registration_id,
            otp_code: value.otp_code
          });

          return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
              registration_id: result.user_id,
              current_step: result.current_step,
              next_step: result.next_step
            }
          });
        } catch (employeeError) {
          throw employeeError; // Throw the employee error if both fail
        }
      }
    } catch (error) {
      console.error('Confirm email verification error:', error);

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

  // Step 4: Complete Registration (Set Password) - for both owner and employee
  static async completeRegistration(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(completeRegistrationSchema, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      // Try owner completion first
      try {
        const result = await RegistrationService.ownerRegisterStep4({
          user_id: value.registration_id,
          password: value.user_password
        });

        return res.status(200).json({
          success: true,
          message: result.message || 'Registration completed successfully',
          data: {
            user_id: result.user_id,
            tenant_id: result.tenant_id,
            tenant_name: result.tenant_name,
            registration_completed: result.registration_completed,
            next_step: 'WAITING_SA_APPROVAL',
            status: 'PENDING'
          }
        });
      } catch (ownerError) {
        // If owner completion fails, try employee completion
        try {
          const result = await RegistrationService.employeeRegisterStep3({
            user_id: value.registration_id,
            password: value.user_password
          });

          return res.status(200).json({
            success: true,
            message: result.message || 'Registration completed successfully',
            data: {
              user_id: result.user_id,
              tenant_id: result.tenant_id,
              tenant_name: result.tenant_name,
              registration_completed: result.registration_completed,
              next_step: 'WAITING_OWNER_APPROVAL',
              status: 'PENDING'
            }
          });
        } catch (employeeError) {
          throw employeeError; // Throw the employee error if both fail
        }
      }
    } catch (error) {
      console.error('Complete registration error:', error);

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
