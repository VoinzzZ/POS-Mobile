const Joi = require('joi');

const createStockMovementValidation = Joi.object({
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

    movement_type: Joi.string()
        .valid('IN', 'OUT', 'ADJUSTMENT', 'RETURN')
        .required()
        .messages({
            'any.only': 'Movement type harus salah satu dari: IN, OUT, ADJUSTMENT, RETURN',
            'any.required': 'Movement type wajib diisi'
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
        .min(0)
        .optional()
        .messages({
            'number.base': 'Cost per unit harus berupa angka',
            'number.min': 'Cost per unit tidak boleh negatif'
        }),

    reference_type: Joi.string()
        .valid('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'OPNAME')
        .required()
        .messages({
            'any.only': 'Reference type harus salah satu dari: PURCHASE, SALE, ADJUSTMENT, RETURN, OPNAME',
            'any.required': 'Reference type wajib diisi'
        }),

    reference_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Reference ID harus berupa angka',
            'number.integer': 'Reference ID harus berupa angka bulat',
            'number.positive': 'Reference ID harus berupa angka positif'
        }),

    notes: Joi.string()
        .max(1000)
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'Notes maksimal 1000 karakter'
        })
});

const stockMovementFiltersValidation = Joi.object({
    product_id: Joi.number()
        .integer()
        .positive()
        .optional(),

    movement_type: Joi.string()
        .valid('IN', 'OUT', 'ADJUSTMENT', 'RETURN')
        .optional(),

    reference_type: Joi.string()
        .valid('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'OPNAME')
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
    createStockMovementValidation,
    stockMovementFiltersValidation
};
