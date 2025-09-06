const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('./errors');
const crypto = require("crypto");

class JWTService {
    static #tokenSettings = {
        access: {
            expiresIn: '15m',
            type: 'access'
        },
        refresh: {
            expiresIn: '7d',
            type: 'refresh'
        },
        reset: {
            expiresIn: '10m',
            type: 'reset'
        }
    };

    static #defaultOptions = {
        issuer: 'pos-mobile-api',
        audience: 'pos-mobile-client'
    };

    static #generateToken(payload, type) {
        const settings = this.#tokenSettings[type];
        if (!settings) {
            throw new Error(`Invalid token type: ${type}`);
        }

        const tokenPayload = {
            ...payload,
            type: settings.type
        };

        return jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            {
                ...this.#defaultOptions,
                expiresIn: settings.expiresIn,
                jwtid: this.#generateTokenId()
            }
        );
    }

    static #generateTokenId() {
        return crypto.randomBytes(32).toString('hex');
    }

    static #verifyToken(token, type) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, this.#defaultOptions);
            
            if (decoded.type !== type) {
                throw new AuthenticationError('Invalid token type');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AuthenticationError(`${type} token has expired`);
            }
            if (error.name === 'JsonWebTokenError') {
                throw new AuthenticationError(`Invalid ${type} token`);
            }
            throw error;
        }
    }

    // Generate Access Token
    static generateAccessToken(payload) {
        return this.#generateToken(payload, 'access');
    }

    // Generate Refresh Token
    static generateRefreshToken(payload) {
        return this.#generateToken(payload, 'refresh');
    }

    // Generate Reset Token
    static generateResetToken(payload) {
        return this.#generateToken(payload, 'reset');
    }

    // Verify Access Token
    static verifyToken(token) {
        return this.#verifyToken(token, 'access');
    }

    // Verify Refresh Token
    static verifyRefreshToken(token) {
        return this.#verifyToken(token, 'refresh');
    }

    // Verify Reset Token
    static verifyResetToken(token) {
        return this.#verifyToken(token, 'reset');
    }

    // Generate Token Pair
    static generateTokenPair(payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900, // 15 minutes in seconds
            refreshExpiresIn: 604800 // 7 days in seconds
        };
    }

    // Extract token info (without verification)
    static getTokenInfo(token) {
        try {
            const decoded = jwt.decode(token, { complete: true });
            if (!decoded) {
                throw new AuthenticationError('Invalid token format');
            }

            return {
                type: decoded.payload.type,
                expiresAt: new Date(decoded.payload.exp * 1000),
                issuer: decoded.payload.iss,
                audience: decoded.payload.aud,
                issuedAt: new Date(decoded.payload.iat * 1000),
                tokenId: decoded.payload.jti
            };
        } catch (error) {
            throw new AuthenticationError('Failed to decode token');
        }
    }
}

module.exports = JWTService;