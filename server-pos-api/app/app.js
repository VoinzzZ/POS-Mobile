const express = require('express');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authroutes = require('./routes/auth.routes');

const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieparser(process.env.COOKIES_SECRET));

// const limiter = rateLimit({
//     windowMS: 15 * 60 * 1000, // 15 minutes
//     max: 100,
//     message: {
//         error: "Too many request from this IP",
//         retryAfter: '15 minutes'
//     }
// });
// app.use('/api', limiter);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'POS API IS RUNNING',
        timestamp: new Date().toISOString()
    });
});

// routes
app.use('/api/auth', authroutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.log('Error: ', error.message);
    res.status(400).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

module.exports = app;
