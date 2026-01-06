const Joi = require('joi');

const createPurchaseOrderValidation = Joi.object({
    supplier_name: Joi.string()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Nama supplier tidak boleh kosong',
            'string.min': 'Nama supplier minimal 1 karakter',
            'string.max': 'Nama supplier maksimal 200 karakter',
            'any.required': 'Nama supplier wajib diisi'
        }),

    po_date: Joi.date()
        .required()
        .messages({
            'date.base': 'Tanggal PO harus berupa tanggal yang valid',
            'any.required': 'Tanggal PO wajib diisi'
        }),

    items: Joi.array()
        .items(
            Joi.object({
                product_id: Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'number.base': 'Product ID harus berupa angka',
                        'number.integer': 'Product ID harus berupa angka bulat',
                        'number.positive': 'Product ID harus berupa angka positif',
                        'any.required': 'Product ID wajib diisi'
                    }),

                quantity: Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'number.base': 'Quantity harus berupa angka',
                        'number.integer': 'Quantity harus berupa angka bulat',
                        'number.positive': 'Quantity harus berupa angka positif',
                        'any.required': 'Quantity wajib diisi'
                    }),

                cost_per_unit: Joi.number()
                    .precision(2)
                    .positive()
                    .required()
                    .messages({
                        'number.base': 'Cost per unit harus berupa angka',
                        'number.positive': 'Cost per unit harus lebih dari 0',
                        'any.required': 'Cost per unit wajib diisi'
                    })
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'Minimal harus ada 1 item',
            'any.required': 'Items wajib diisi'
        }),

    notes: Joi.string()
        .max(1000)
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'Notes maksimal 1000 karakter'
        })
});

const updatePurchaseOrderValidation = Joi.object({
    supplier_name: Joi.string()
        .min(1)
        .max(200)
        .optional()
        .messages({
            'string.empty': 'Nama supplier tidak boleh kosong',
            'string.min': 'Nama supplier minimal 1 karakter',
            'string.max': 'Nama supplier maksimal 200 karakter'
        }),

    po_date: Joi.date()
        .optional()
        .messages({
            'date.base': 'Tanggal PO harus berupa tanggal yang valid'
        }),

    notes: Joi.string()
        .max(1000)
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'Notes maksimal 1000 karakter'
        })
});

const purchaseOrderFiltersValidation = Joi.object({
    po_status: Joi.string()
        .valid('DRAFT', 'PENDING', 'RECEIVED', 'CANCELLED')
        .optional(),

    start_date: Joi.date()
        .optional(),

    end_date: Joi.date()
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .optional(),

    sort_order: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .optional()
});

module.exports = {
    createPurchaseOrderValidation,
    updatePurchaseOrderValidation,
    purchaseOrderFiltersValidation
};
