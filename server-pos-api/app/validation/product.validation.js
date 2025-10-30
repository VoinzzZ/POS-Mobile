const Joi = require('joi');

const createProductValidation = Joi.object({
  product_name: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Nama produk tidak boleh kosong',
      'string.min': 'Nama produk minimal 1 karakter',
      'string.max': 'Nama produk maksimal 200 karakter',
      'any.required': 'Nama produk wajib diisi'
    }),

  product_description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Deskripsi produk maksimal 1000 karakter'
    }),

  product_sku: Joi.string()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'SKU produk maksimal 50 karakter'
    }),

  brand_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Brand ID harus berupa angka',
      'number.integer': 'Brand ID harus berupa angka bulat',
      'number.positive': 'Brand ID harus berupa angka positif',
      'any.required': 'Brand ID wajib diisi'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Category ID harus berupa angka',
      'number.integer': 'Category ID harus berupa angka bulat',
      'number.positive': 'Category ID harus berupa angka positif',
      'any.required': 'Category ID wajib diisi'
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

  product_price: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      'number.base': 'Harga produk harus berupa angka',
      'number.positive': 'Harga produk harus lebih dari 0',
      'any.required': 'Harga produk wajib diisi'
    }),

  product_cost: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Harga beli produk harus berupa angka',
      'number.min': 'Harga beli produk tidak boleh negatif'
    }),

  product_stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Stok produk harus berupa angka',
      'number.integer': 'Stok produk harus berupa angka bulat',
      'number.min': 'Stok produk tidak boleh negatif'
    }),

  product_min_stock: Joi.number()
    .integer()
    .min(0)
    .default(5)
    .messages({
      'number.base': 'Stok minimum produk harus berupa angka',
      'number.integer': 'Stok minimum produk harus berupa angka bulat',
      'number.min': 'Stok minimum produk tidak boleh negatif'
    }),

  is_active: Joi.boolean()
    .default(true),

  is_track_stock: Joi.boolean()
    .default(true),

  is_sellable: Joi.boolean()
    .default(true)
});

const updateProductValidation = Joi.object({
  product_name: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': 'Nama produk tidak boleh kosong',
      'string.min': 'Nama produk minimal 1 karakter',
      'string.max': 'Nama produk maksimal 200 karakter'
    }),

  product_description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Deskripsi produk maksimal 1000 karakter'
    }),

  product_sku: Joi.string()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'SKU produk maksimal 50 karakter'
    }),

  brand_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Brand ID harus berupa angka',
      'number.integer': 'Brand ID harus berupa angka bulat',
      'number.positive': 'Brand ID harus berupa angka positif'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID harus berupa angka',
      'number.integer': 'Category ID harus berupa angka bulat',
      'number.positive': 'Category ID harus berupa angka positif'
    }),

  product_price: Joi.number()
    .precision(2)
    .positive()
    .optional()
    .messages({
      'number.base': 'Harga produk harus berupa angka',
      'number.positive': 'Harga produk harus lebih dari 0'
    }),

  product_cost: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Harga beli produk harus berupa angka',
      'number.min': 'Harga beli produk tidak boleh negatif'
    }),

  product_stock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Stok produk harus berupa angka',
      'number.integer': 'Stok produk harus berupa angka bulat',
      'number.min': 'Stok produk tidak boleh negatif'
    }),

  product_min_stock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Stok minimum produk harus berupa angka',
      'number.integer': 'Stok minimum produk harus berupa angka bulat',
      'number.min': 'Stok minimum produk tidak boleh negatif'
    }),

  is_active: Joi.boolean()
    .optional(),

  is_track_stock: Joi.boolean()
    .optional(),

  is_sellable: Joi.boolean()
    .optional()
});

// Pagination validation schemas
const paginationValidation = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page harus berupa angka',
      'number.integer': 'Page harus berupa angka bulat',
      'number.min': 'Page minimal 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit harus berupa angka',
      'number.integer': 'Limit harus berupa angka bulat',
      'number.min': 'Limit minimal 1',
      'number.max': 'Limit maksimal 100'
    }),

  sort_by: Joi.string()
    .valid('created_at', 'product_name', 'product_price', 'product_stock')
    .default('created_at')
    .messages({
      'any.only': 'Sort field tidak valid. Pilihan: created_at, product_name, product_price, product_stock'
    }),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order tidak valid. Pilihan: asc, desc'
    }),

  cursor: Joi.any()
    .optional()
    .messages({
      'any.custom': 'Cursor tidak valid'
    }),

  cursor_direction: Joi.string()
    .valid('forward', 'backward')
    .default('forward')
    .messages({
      'any.only': 'Cursor direction tidak valid. Pilihan: forward, backward'
    })
});

// Infinite scroll validation
const infiniteScrollValidation = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit harus berupa angka',
      'number.integer': 'Limit harus berupa angka bulat',
      'number.min': 'Limit minimal 1',
      'number.max': 'Limit maksimal 100'
    }),

  sort_by: Joi.string()
    .valid('created_at', 'product_name', 'product_price', 'product_stock')
    .default('created_at')
    .messages({
      'any.only': 'Sort field tidak valid. Pilihan: created_at, product_name, product_price, product_stock'
    }),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order tidak valid. Pilihan: asc, desc'
    }),

  cursor: Joi.any()
    .optional()
    .messages({
      'any.custom': 'Cursor tidak valid'
    })
});

// Product filters validation
const productFiltersValidation = Joi.object({
  brand_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Brand ID harus berupa angka',
      'number.integer': 'Brand ID harus berupa angka bulat',
      'number.positive': 'Brand ID harus berupa angka positif'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID harus berupa angka',
      'number.integer': 'Category ID harus berupa angka bulat',
      'number.positive': 'Category ID harus berupa angka positif'
    }),

  is_active: Joi.boolean()
    .optional(),

  is_sellable: Joi.boolean()
    .optional(),

  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term maksimal 100 karakter'
    }),

  min_price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Min price harus berupa angka',
      'number.min': 'Min price tidak boleh negatif'
    }),

  max_price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Max price harus berupa angka',
      'number.min': 'Max price tidak boleh negatif'
    }),

  low_stock: Joi.boolean()
    .optional()
});

module.exports = {
  createProductValidation,
  updateProductValidation,
  paginationValidation,
  infiniteScrollValidation,
  productFiltersValidation
};