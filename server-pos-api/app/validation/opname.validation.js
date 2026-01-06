const Joi = require('joi');

const createStockOpnameValidation = Joi.object({
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

    actual_qty: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'Actual quantity harus berupa angka',
            'number.integer': 'Actual quantity harus berupa angka bulat',
            'number.min': 'Actual quantity tidak boleh negatif',
            'any.required': 'Actual quantity wajib diisi'
        }),

    notes: Joi.string()
        .max(1000)
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'Notes maksimal 1000 karakter'
        })
});

const bulkCreateStockOpnameValidation = Joi.object({
    opnames: Joi.array()
        .items(
            Joi.object({
                product_id: Joi.number()
                    .integer()
                    .positive()
                    .required(),

                actual_qty: Joi.number()
                    .integer()
                    .min(0)
                    .required(),

                notes: Joi.string()
                    .max(1000)
                    .allow(null, '')
                    .optional()
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'Minimal harus ada 1 opname',
            'any.required': 'Opnames wajib diisi'
        })
});

const stockOpnameFiltersValidation = Joi.object({
    product_id: Joi.number()
        .integer()
        .positive()
        .optional(),

    processed: Joi.boolean()
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
    createStockOpnameValidation,
    bulkCreateStockOpnameValidation,
    stockOpnameFiltersValidation
};
