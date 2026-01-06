const Joi = require('joi');
// ==================== LOGIN VALIDATION ====================

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email wajib diisi',
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password wajib diisi',
    'any.required': 'Password wajib diisi'
  })
});

// ==================== APPROVAL VALIDATION ====================

const approveUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID harus berupa angka',
    'any.required': 'User ID wajib diisi'
  }),
  role_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Role ID harus berupa angka'
  }),
  notes: Joi.string().allow('', null)
});

const rejectUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID harus berupa angka',
    'any.required': 'User ID wajib diisi'
  }),
  rejection_reason: Joi.string().required().messages({
    'string.empty': 'Alasan penolakan wajib diisi',
    'any.required': 'Alasan penolakan wajib diisi'
  })
});

// ==================== REGISTRATION SCHEMAS ====================

// Step 1: Create Tenant Registration
const createTenantSchema = Joi.object({
  tenant_name: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Nama toko harus berupa teks',
    'string.empty': 'Nama toko tidak boleh kosong',
    'string.min': 'Nama toko minimal harus memiliki {#limit} karakter',
    'string.max': 'Nama toko maksimal boleh memiliki {#limit} karakter',
    'any.required': 'Nama toko wajib diisi'
  }),
  tenant_phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('', null).messages({
    'string.pattern.base': 'Format nomor telepon tidak valid (hanya boleh angka, +, -, spasi, dan kurung)'
  }),
  tenant_email: Joi.string().email().allow('', null).messages({
    'string.email': 'Format email toko tidak valid'
  }),
  tenant_address: Joi.string().allow('', null).messages({
    'string.base': 'Alamat harus berupa teks'
  }),
  tenant_description: Joi.string().allow('', null).messages({
    'string.base': 'Deskripsi harus berupa teks'
  })
});

// Step 2: Send Email Verification
const sendEmailVerificationSchema = Joi.object({
  registration_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^[0-9]+$/).custom((value, helpers) => parseInt(value, 10))
  ).required().messages({
    'alternatives.match': 'Registration ID harus berupa angka',
    'any.required': 'Registration ID wajib diisi'
  }),
  user_email: Joi.string().email().required().messages({
    'string.empty': 'Email wajib diisi',
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  user_name: Joi.string().min(3).max(50).optional().messages({
    'string.base': 'Username harus berupa teks',
    'string.min': 'Username minimal harus memiliki {#limit} karakter',
    'string.max': 'Username maksimal boleh memiliki {#limit} karakter'
  }),
  user_full_name: Joi.string().min(3).max(100).optional().messages({
    'string.base': 'Nama lengkap harus berupa teks',
    'string.min': 'Nama lengkap minimal harus memiliki {#limit} karakter',
    'string.max': 'Nama lengkap maksimal boleh memiliki {#limit} karakter'
  }),
  user_phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('', null).messages({
    'string.pattern.base': 'Format nomor telepon tidak valid (hanya boleh angka, +, -, spasi, dan kurung)'
  })
});

// Step 3: Confirm Email Verification
const confirmEmailVerificationSchema = Joi.object({
  registration_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^[0-9]+$/).custom((value, helpers) => parseInt(value, 10))
  ).required().messages({
    'alternatives.match': 'Registration ID harus berupa angka',
    'any.required': 'Registration ID wajib diisi'
  }),
  otp_code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.base': 'Kode OTP harus berupa teks',
    'string.empty': 'Kode OTP wajib diisi',
    'string.length': 'Kode OTP harus terdiri dari {#limit} digit',
    'string.pattern.base': 'Kode OTP hanya boleh berisi angka',
    'any.required': 'Kode OTP wajib diisi'
  })
});

// Step 4: Complete Registration (Set Password)
const completeRegistrationSchema = Joi.object({
  registration_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^[0-9]+$/).custom((value, helpers) => parseInt(value, 10))
  ).required().messages({
    'alternatives.match': 'Registration ID harus berupa angka',
    'any.required': 'Registration ID wajib diisi'
  }),
  user_password: Joi.string().min(6).max(100).required().messages({
    'string.base': 'Password harus berupa teks',
    'string.empty': 'Password wajib diisi',
    'string.min': 'Password minimal harus memiliki {#limit} karakter',
    'string.max': 'Password maksimal boleh memiliki {#limit} karakter',
    'any.required': 'Password wajib diisi'
  }),
});

// Employee Registration with PIN
const registerEmployeeWithPinSchema = Joi.object({
  pin_registration: Joi.string().required().messages({
    'string.base': 'PIN registrasi harus berupa teks',
    'string.empty': 'PIN registrasi wajib diisi',
    'any.required': 'PIN registrasi wajib diisi'
  }),
  user_email: Joi.string().email().required().messages({
    'string.empty': 'Email wajib diisi',
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  user_name: Joi.string().min(3).max(50).pattern(/^[a-zA-Z0-9_]+$/).required().messages({
    'string.base': 'Username harus berupa teks',
    'string.empty': 'Username wajib diisi',
    'string.min': 'Username minimal harus memiliki {#limit} karakter',
    'string.max': 'Username maksimal boleh memiliki {#limit} karakter',
    'string.pattern.base': 'Username hanya boleh mengandung huruf, angka, dan underscore',
    'any.required': 'Username wajib diisi'
  }),
  user_full_name: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Nama lengkap harus berupa teks',
    'string.empty': 'Nama lengkap wajib diisi',
    'string.min': 'Nama lengkap minimal harus memiliki {#limit} karakter',
    'string.max': 'Nama lengkap maksimal boleh memiliki {#limit} karakter',
    'any.required': 'Nama lengkap wajib diisi'
  }),
  user_phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('', null).messages({
    'string.pattern.base': 'Format nomor telepon tidak valid (hanya boleh angka, +, -, spasi, dan kurung)'
  })
});

const validatePinSchema = Joi.object({
  pin: Joi.string().required().messages({
    'string.base': 'PIN harus berupa teks',
    'string.empty': 'PIN wajib diisi',
    'any.required': 'PIN wajib diisi'
  })
});

module.exports = {

  createTenantSchema,
  sendEmailVerificationSchema,
  confirmEmailVerificationSchema,
  completeRegistrationSchema,
  registerEmployeeWithPinSchema,
  validatePinSchema,

  loginSchema,
  approveUserSchema,
  rejectUserSchema,

};