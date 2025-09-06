const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    expectCt: true,
    hidePoweredBy: true,
    hsts: true,
    noSniff: true,
    referrerPolicy: true,
    xssFilter: true
}));

// CORS configuration for mobile clients
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 600 // 10 minutes
}));

// General middleware
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API versioning and rate limiting
const API_VERSION = 'v1';
app.use(`/api/${API_VERSION}`, apiLimiter);

// Logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        version: API_VERSION,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Routes with versioning
app.use(`/api/${API_VERSION}/auth`, require('./routes/auth.routes'));
app.use(`/api/${API_VERSION}/admin`, require('./routes/admin.routes'));

// API Documentation redirect
app.get('/docs', (req, res) => {
    res.redirect(process.env.API_DOCS_URL || '/api-docs');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
        path: req.originalUrl
    });
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Export app
module.exports = app;
