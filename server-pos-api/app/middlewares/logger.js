const winston = require('winston');
const morgan = require('morgan');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

morgan.token('body', (req) => {
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.password;
    delete sanitizedBody.newPassword;
    delete sanitizedBody.confirmPassword;
    return JSON.stringify(sanitizedBody);
});

const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body';
const requestLogger = morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim())
    },
    skip: (req, res) => {
        return req.url === '/health' || req.url === '/api/v1/health';
    }
});
const errorLogger = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
    });
    next(err);
};

module.exports = {
    logger,
    requestLogger,
    errorLogger
};
