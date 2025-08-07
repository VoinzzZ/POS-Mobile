const JWTService = require('../utils/jwtService');

class AuthMiddleware {
    // Verify Access Token from cookies
    static verifyToken(req, res, next) {
        try {
            // Get Access token token from cookies
            if(!token) {
                const authHeader = req.header.authorization;
                const headerExtraction = JWTService.extractTokenFromHeader(authHeader);

                if(!headerExtraction) {
                    return res.status(401).json({
                        success: false,
                        message: 'Access Token Is required',
                        error: 'MISSING_TOKEN'
                    });
                }

                token = headerExtraction.token;
            }

            // Verify Token
            const verification = JWTService.verifyToken(token);

            if(!verification.isValid) {
                return res.status(401).json({
                    success: false,
                    message: verification.error,
                    error: 'INVALID_TOKEN'
                });
            }

            req.user = {
                userId: verification.decoded.userId,
                email : verification.decoded.email,
                role: verification.decoded.role,
                name : verification.decoded.name,
            };

            next();
        } catch (error) {
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
    static varifyRefreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if(!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh Token is required',
                    error: 'MISSING_REFRESH_TOKEN'
                });
            }

            const verification = JWTService.verifyRefreshToken(refreshToken);

            if(!verification.isValid) {
                return res.status(401).json({
                    success: false,
                    message: verification.error,
                    error: 'INVALID_REFRESH_TOKEN'
                });
            }

            req.user = {
                userId: verification.decoded.userId,
                email : verification.decoded.email,
                role: verification.decoded.role,
                name : verification.decoded.name,
            }

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