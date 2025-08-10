const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} expiresIn - Token expiration time
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'tracktrack-api',
    audience: 'tracktrack-client'
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'tracktrack-api',
    audience: 'tracktrack-client'
  });
};

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = generateToken(payload, '15m'); // Short-lived access token
  const refreshToken = generateToken({ id: user._id }, '7d'); // Long-lived refresh token

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 * 1000 // 15 minutes in milliseconds
  };
};

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {String|null} JWT token or null
 */
const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check for direct token
  return authHeader;
};

/**
 * Decode token without verification (for expired token info)
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateTokens,
  extractTokenFromHeader,
  decodeToken
};
