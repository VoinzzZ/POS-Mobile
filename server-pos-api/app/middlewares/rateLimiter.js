const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth routes
    message: {
        success: false,
        message: 'Too many attempts. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    }
});

// Speed limiter for repeated failed attempts
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 3, // start delaying after 3 requests
    delayMs: (hits) => hits * 1000 // add 1 second delay per hit
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    }
});

module.exports = {
    authLimiter,
    speedLimiter,
    apiLimiter
};
