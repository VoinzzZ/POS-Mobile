const Joi = require('joi');

const createCategoryValidation = Joi.object({
  category_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Nama kategori tidak boleh kosong',
      'string.min': 'Nama kategori minimal 1 karakter',
      'string.max': 'Nama kategori maksimal 100 karakter',
      'any.required': 'Nama kategori wajib diisi'
    }),

  category_description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Deskripsi kategori maksimal 500 karakter'
    }),

  is_active: Joi.boolean()
    .default(true)
});

const updateCategoryValidation = Joi.object({
  category_name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Nama kategori tidak boleh kosong',
      'string.min': 'Nama kategori minimal 1 karakter',
      'string.max': 'Nama kategori maksimal 100 karakter'
    }),

  category_description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Deskripsi kategori maksimal 500 karakter'
    }),

  is_active: Joi.boolean()
    .optional()
});

module.exports = {
  createCategoryValidation,
  updateCategoryValidation
};