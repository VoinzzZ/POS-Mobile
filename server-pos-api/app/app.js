const express = require('express');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();


app.use(helmet());
const limiter = rateLimit({
    windowMS: 15 * 60 * 1000, // 15minutes
    max: 100,
    message: {
        error: "Too many request from this IP",
        retryAfter: '15 minutes'
    }
});
app.use('/api', limiter);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));
