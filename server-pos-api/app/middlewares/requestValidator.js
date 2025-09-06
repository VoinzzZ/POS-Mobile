const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

const validateRequest = (schema, type = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = type === 'query' ? req.query : 
                                 type === 'params' ? req.params : 
                                 req.body;

            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.context.key,
                    message: detail.message
                }));
                throw new ValidationError('Validation failed', errors);
            }

            // Replace the validated data
            if (type === 'query') req.query = value;
            else if (type === 'params') req.params = value;
            else req.body = value;

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Password validation schema
const passwordSchema = {
    minLength: 8,
    maxLength: 50,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
};

// Auth Validation Schemas
const authValidation = {
    register: Joi.object({
        name: Joi.string().required().min(3).max(50).trim()
            .pattern(/^[a-zA-Z0-9\s]+$/)
            .message('Name can only contain letters, numbers and spaces'),
        pin: Joi.string().required().length(6).pattern(/^\d+$/)
            .message('PIN must be 6 digits'),
        role: Joi.string().valid('Admin', 'Cashier').default('Cashier')
    }),

    sendEmailOTP: Joi.object({
        userId: Joi.string().required().trim(),
        email: Joi.string().email().required().trim().lowercase()
    }),

    verifyEmailOTP: Joi.object({
        userId: Joi.string().required().trim(),
        email: Joi.string().email().required().trim().lowercase(),
        otpCode: Joi.string().required().length(6).pattern(/^\d+$/)
    }),

    setPassword: Joi.object({
        userId: Joi.string().required().trim(),
        newPassword: Joi.string().required()
            .min(passwordSchema.minLength)
            .max(passwordSchema.maxLength)
            .pattern(passwordSchema.pattern)
            .message('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'),
        confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
            .message('Passwords must match')
    }),

    login: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
        password: Joi.string().required()
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required().trim().lowercase()
    }),

    verifyForgotPasswordOTP: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
        otpCode: Joi.string().required().length(6).pattern(/^\d+$/)
    }),

    resetPassword: Joi.object({
        resetToken: Joi.string().required(),
        newPassword: Joi.string().required()
            .min(passwordSchema.minLength)
            .max(passwordSchema.maxLength)
            .pattern(passwordSchema.pattern)
            .message('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'),
        confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
            .message('Passwords must match')
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required()
            .min(passwordSchema.minLength)
            .max(passwordSchema.maxLength)
            .pattern(passwordSchema.pattern)
            .message('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'),
        confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
            .message('Passwords must match')
    })
};

// Admin Validation Schemas
const adminValidation = {
    generatePin: Joi.object({
        expiresInHours: Joi.number().integer().min(1).max(168).default(24)
    }),

    listPins: Joi.object({
        status: Joi.string().valid('active', 'used', 'expired', 'all').default('all'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string().valid('createdAt', 'expiresAt').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }).unknown(false),

    revokePin: Joi.object({
        pinId: Joi.string().required()
    })
};

module.exports = {
    validateRequest,
    authValidation,
    adminValidation,
    passwordSchema
};
