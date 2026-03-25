/**
 * ============================================
 * AUTH CONTROLLER
 * ============================================
 * HTTP request handler untuk Authentication
 * 
 * Responsibility:
 * - Handle HTTP request/response
 * - Validate input using shared validation
 * - Call AuthService untuk business logic
 * - Return standardized responses
 * 
 * Uses:
 * - AuthService untuk business logic
 * - Shared validation utilities & response builders
 */

const authService = require("../services/authService");
const { registerSchema, loginSchema } = require("../utils/validation");
const { asyncHandler, validate, sendSuccess, sendBadRequest, sendError } = require("../../../shared");
const { verifyRefreshToken } = require("../utils/jwt");
const {
  blacklistAccessToken,
  revokeRefreshToken,
} = require("../../../../shared/src/utils/token-blacklist.util");

/**
 * Register user
 * @route POST /api/auth/register
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (optional, default: user)
 * @returns {Object} { success, message, user, token, refreshToken }
 */
exports.register = asyncHandler(async (req, res) => {
  // Validasi input dengan shared validate
  const value = await validate(registerSchema, req.body);

  // Call service
  const result = await authService.register(value);

  // Response
  return sendSuccess(res, {
    user: result.user,
    token: result.token,
    refreshToken: result.refreshToken,
  }, "Registrasi berhasil", 201);
});

/**
 * Login user
 * @route POST /api/auth/login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} { success, message, user, token, refreshToken }
 */
exports.login = asyncHandler(async (req, res) => {
  // Validasi input dengan shared validate
  const value = await validate(loginSchema, req.body);

  // Call service
  const result = await authService.login(value);

  // Response
  return sendSuccess(res, {
    user: result.user,
    token: result.token,
    refreshToken: result.refreshToken,
  }, "Login berhasil", 200);
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @param {string} refreshToken - Refresh token dari login response
 * @returns {Object} { success, message, token }
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendBadRequest(res, "Refresh token diperlukan");
  }

  // Call service
  const result = await authService.refreshToken(refreshToken);

  // Response
  return sendSuccess(res, {
    token: result.token,
    refreshToken: result.refreshToken,
  }, "Token berhasil diperbarui");
});

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @returns {Object} { success, message, user }
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user data dari service
  const userService = require("../services/userService");
  const user = await userService.getProfile(userId);

  // Response
  return sendSuccess(res, { user }, "Profile berhasil diambil");
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @returns {Object} { success, message }
 */
exports.logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const providedRefreshToken = req.body?.refreshToken;
  const exp = req.user?.exp;

  if (!token || !exp) {
    return sendBadRequest(res, "Token tidak valid untuk logout");
  }

  try {
    const revokeTasks = [blacklistAccessToken(token, exp)];

    if (providedRefreshToken) {
      const decodedRefresh = verifyRefreshToken(providedRefreshToken);
      revokeTasks.push(revokeRefreshToken(providedRefreshToken, decodedRefresh?.exp));
    }

    await Promise.all(revokeTasks);
  } catch (error) {
    return sendError(res, "Layanan logout sementara tidak tersedia", 503);
  }

  return sendSuccess(res, {}, "Logout berhasil");
});