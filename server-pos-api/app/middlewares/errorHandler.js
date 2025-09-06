// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let error = err.errorCode || "INTERNAL_SERVER_ERROR";
    let details = process.env.NODE_ENV === "development" ? err.stack : undefined;

    // Handle Prisma errors
    if (err.code && err.code.startsWith("P")) {
        switch (err.code) {
            case "P2002": // Unique constraint violation
                status = 409;
                message = "Resource already exists";
                error = "UNIQUE_CONSTRAINT_VIOLATION";
                break;
            case "P2025": // Record not found
                status = 404;
                message = "Resource not found";
                error = "RECORD_NOT_FOUND";
                break;
            default:
                status = 500;
                message = "Database error";
                error = "DATABASE_ERROR";
        }
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        status = 401;
        message = "Invalid token";
        error = "INVALID_TOKEN";
    } else if (err.name === "TokenExpiredError") {
        status = 401;
        message = "Token expired";
        error = "TOKEN_EXPIRED";
    }

    // Handle validation errors (custom class)
    if (err.name === "ValidationError") {
        status = 400;
        message = err.message || "Validation failed";
        error = "VALIDATION_ERROR";
        details = err.details;
    }

    res.status(status).json({
        success: false,
        status: err.statusText || (String(status).startsWith("4") ? "fail" : "error"), // readable for client
        message,
        error,
        ...(details && { details })
    });
};

module.exports = errorHandler;
