const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const tokenSettings = {
  access: { expiresIn: '15m', type: 'access' },
  refresh: { expiresIn: '7d', type: 'refresh' },
  reset: { expiresIn: '10m', type: 'reset' }
};

const defaultOptions = {
  issuer: 'pos-mobile-api',
  audience: 'pos-mobile-client'
};

function generateTokenId() {
  return crypto.randomBytes(32).toString('hex');
}

function generateToken(payload, type) {
  const settings = tokenSettings[type];
  if (!settings) throw new Error(`Invalid token type: ${type}`);

  const tokenPayload = { ...payload, type: settings.type };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    ...defaultOptions,
    expiresIn: settings.expiresIn,
    jwtid: generateTokenId()
  });
}

function verifyTokenType(token, type) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, defaultOptions);
    if (decoded.type !== type) throw new Error('Invalid token type');
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new Error(`${type} token has expired`);
    if (error.name === 'JsonWebTokenError') throw new Error(`Invalid ${type} token`);
    throw error;
  }
}

function generateAccessToken(payload) {
  return generateToken(payload, 'access');
}

function generateRefreshToken(payload) {
  return generateToken(payload, 'refresh');
}

function generateResetToken(payload) {
  return generateToken(payload, 'reset');
}

function verifyToken(token) {
  return verifyTokenType(token, 'access');
}

function verifyRefreshToken(token) {
  return verifyTokenType(token, 'refresh');
}

function verifyResetToken(token) {
  return verifyTokenType(token, 'reset');
}

function generateTokenPair(payload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 900,
    refreshExpiresIn: 604800
  };
}

function getTokenInfo(token) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token format');

    return {
      type: decoded.payload.type,
      expiresAt: new Date(decoded.payload.exp * 1000),
      issuer: decoded.payload.iss,
      audience: decoded.payload.aud,
      issuedAt: new Date(decoded.payload.iat * 1000),
      tokenId: decoded.payload.jti
    };
  } catch (error) {
    throw new Error('Failed to decode token');
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyToken,
  verifyRefreshToken,
  verifyResetToken,
  generateTokenPair,
  getTokenInfo
};