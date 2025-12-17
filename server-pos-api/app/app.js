const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { requestLogger, errorLogger } = require('./middlewares/logger')
const routes = require('./routes/index.routes');

const app = express();

// Trust proxy for ngrok/reverse proxy support
app.set('trust proxy', 1);

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

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 600
}));

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const API_VERSION = 'v1';
app.use(`/api/${API_VERSION}`, apiLimiter);
app.use(requestLogger);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        version: API_VERSION,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

app.use(`/api/${API_VERSION}`, routes);

app.get('/docs', (req, res) => {
    res.redirect(process.env.API_DOCS_URL || '/api-docs');
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
        path: req.originalUrl
    });
});

app.use(errorLogger);

module.exports = app;
