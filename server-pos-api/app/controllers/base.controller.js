const { AppError } = require('../utils/errors');
const { logger } = require('../middlewares/logger');

class BaseController {
    constructor() {
        // Bind all methods to this instance
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        methods.forEach(method => {
            if (method !== 'constructor' && typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // Success response helper
    sendSuccess(res, { statusCode = 200, message = 'Success', data = null }) {
        const response = {
            success: true,
            message,
            ...(data && { data })
        };
        return res.status(statusCode).json(response);
    }

    // Error response helper
    sendError(res, { statusCode = 500, message = 'Internal Server Error', error = 'INTERNAL_SERVER_ERROR', details = null }) {
        const response = {
            success: false,
            message,
            error,
            ...(details && { details })
        };
        return res.status(statusCode).json(response);
    }

    // Async handler wrapper to catch errors
    asyncHandler(handler) {
        return async (req, res, next) => {
            try {
                await handler(req, res, next);
            } catch (error) {
                logger.error({
                    message: error.message,
                    stack: error.stack,
                    path: req.path,
                    method: req.method
                });
                next(error);
            }
        };
    }

    // Validate required fields
    validateRequiredFields(data, fields) {
        const missingFields = fields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new AppError(
                `Missing required fields: ${missingFields.join(', ')}`,
                400,
                'MISSING_FIELDS'
            );
        }
    }
}

module.exports = BaseController;
