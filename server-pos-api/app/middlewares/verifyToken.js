const JWTService = require('../utils/jwtService');

function setUser(req, decoded) {
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name,
    is_sa: decoded.is_sa,
    tenantId: decoded.tenantId
  };
}

function verifyToken(req, res, next) {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({
          success: false,
          message: 'Access Token is Required',
          error: 'MISSING_TOKEN'
        });
      }
      token = authHeader.split(' ')[1];
    }

    const decoded = JWTService.verifyToken(token);
    setUser(req, decoded);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError' ||
        error.message?.includes('expired') ||
        error.message?.includes('invalid')) {
      return res.status(401).json({
        success: false,
        message: error.message,
        error: 'INVALID_OR_EXPIRED_TOKEN'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'authenticate verification failed',
      error: 'AUTH_ERROR'
    });
  }
}

module.exports = {
  verifyToken
};