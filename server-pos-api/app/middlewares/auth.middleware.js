const JWTService = require('../utils/jwtService');

class AuthMiddleware {
    // Set data user request
    static #setUser(req, decoded) {
        req.user = {
            userId: decoded.userId,
            email : decoded.email,
            role: decoded.role,
            name : decoded.name,
        };
    }

    // Verify Access Token from cookies
    static verifyToken(req, res, next) {
        try {
            // Get Access token token from cookies
            let token = req.cookies?.accessToken;

            if(!token) {
                const authHeader = req.headers.authorization;
                if(!authHeader || !authHeader.startsWith('Bearer')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Access Token is Required',
                        error: 'MISSING_TOKEN'
                    });
                }
                token = authHeader.split(' ')[1];
            }

            // Verify Token
            const decoded = JWTService.verifyToken(token);

            AuthMiddleware.#setUser(req, decoded);

            next();
        } catch (error) {
            if(error.name === 'TokenExpiredError' || error.name === 'jsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: error.message,
                    error: 'INVALID_OR_EXPIRED_TOKEN'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'authenticate verification failed',
                error: 'AUTH_ERROR'
            });
        }
    }

    // Role based controll
    static requireRole(allowedRoles) {
        return (req, res, next) => {
            try {
                if(!req.user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authenticate required',
                        error: 'NOT_AUTHENTICATE'
                    });
                }

                const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

                // Check if user role is allowed
                if(!roles.includes(req.user.role)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions',
                        error: 'INSUFFICIENT_PERMISSIONS',
                        required: roles,
                        current: req.user.role
                    });
                }
                next();
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Role verfication failed',
                    error: 'ROLE_CHECK_ERROR'
                });
            }
        }
    }

    // Admin only access
    static requireAdmin(req, res, next) {
        return AuthMiddleware.requireRole('Admin')(req, res, next);
    }

    // Admin & Cashier Access
    static requireCashierOrAdmin(req, res, next) {
        return AuthMiddleware.requireRole(['Admin', 'Cashier'])(req, res, next);
    }

    // Verify Refresh Token
    static verifyRefreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if(!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh Token is required',
                    error: 'MISSING_REFRESH_TOKEN'
                });
            }

            const decoded = JWTService.verifyRefreshToken(refreshToken);

            AuthMiddleware.#setUser(req, decoded);

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Refresh token verification failed',
                error: 'REFRESH_TOKEN_ERROR'
            });
        }
    }
}

module.exports = AuthMiddleware;