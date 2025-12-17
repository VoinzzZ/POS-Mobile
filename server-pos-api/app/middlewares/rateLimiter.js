const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many attempts. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    }
});

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 3,
    delayMs: (hits) => hits * 1000
});
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    speedLimiter,
    apiLimiter
};
