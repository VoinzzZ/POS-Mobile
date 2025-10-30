const Joi = require('joi');

const createBrandValidation = Joi.object({
  brand_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Nama brand tidak boleh kosong',
      'string.min': 'Nama brand minimal 1 karakter',
      'string.max': 'Nama brand maksimal 100 karakter',
      'any.required': 'Nama brand wajib diisi'
    }),

  brand_description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Deskripsi brand maksimal 500 karakter'
    }),

  brand_logo_url: Joi.string()
    .uri()
    .allow('')
    .optional()
    .messages({
      'string.uri': 'URL logo brand tidak valid'
    }),

  tenant_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tenant ID harus berupa angka',
      'number.integer': 'Tenant ID harus berupa angka bulat',
      'number.positive': 'Tenant ID harus berupa angka positif',
      'any.required': 'Tenant ID wajib diisi'
    }),

  is_active: Joi.boolean()
    .optional()
    .default(true)
});

const updateBrandValidation = Joi.object({
  brand_name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Nama brand tidak boleh kosong',
      'string.min': 'Nama brand minimal 1 karakter',
      'string.max': 'Nama brand maksimal 100 karakter'
    }),

  brand_description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Deskripsi brand maksimal 500 karakter'
    }),

  brand_logo_url: Joi.string()
    .uri()
    .allow('')
    .optional()
    .messages({
      'string.uri': 'URL logo brand tidak valid'
    }),

  is_active: Joi.boolean()
    .optional()
});

module.exports = {
  createBrandValidation,
  updateBrandValidation
};