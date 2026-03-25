const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate access token (short-lived)
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    jwtid: crypto.randomUUID(),
  });
}

/**
 * Generate refresh token (long-lived)
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
      jwtid: crypto.randomUUID(),
    }
  );
}

/**
 * Verify token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  );
}

/**
 * Decode token without verification to get exp claim.
 */
function getTokenExpiration(token) {
  const decoded = jwt.decode(token);
  return decoded?.exp || null;
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  getTokenExpiration,
};
