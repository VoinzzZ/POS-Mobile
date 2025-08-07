const jwt = require('jsonwebtoken');

class JWTService {
    // Generate Token (15minutes)
    static generateAccessToken(payLoad) {
        return jwt.sign(
            payLoad,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
                issuer: 'pos-system',
                audience: 'pos-users'
            }
        );
    }

    // Generate Refresh Token (7days)
    static generateRefreshToken(payLoad) {
        return jwt.sign(
            payLoad,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
                issuer: 'pos-system',
                audience: 'pos-users'
            }
        );
    }

    // Verify Token
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET, {
                issuer: 'pos-system',
                audience: 'pos-users'
            });
        } catch (error) {
            throw new Error(`Token Verification failed: ${error.message}`);
        }
    }

    // Verify refresh token
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET, {
                issuer: 'pos-system',
                audience: 'pos-users'
            })
        } catch (error) {
            throw new Error(`Refresh Token Verification failed: ${error.message}`);
        }
    }

    // Decode Token (without verification)
    static decodeToken(token) {
        return jwt.decode(token);
    }

    // Generated Token Pair (Access + Refresh)
    static generateTokenPair(payLoad) {
        return {
            accessToken: this.generateAccessToken(payLoad),
            refreshToken: this.generateRefreshToken(payLoad)
        };
    }
}

module.exports = JWTService;