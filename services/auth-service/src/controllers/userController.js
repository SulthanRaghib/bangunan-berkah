/**
 * ============================================
 * USER CONTROLLER
 * ============================================
 * HTTP request handler untuk User Management
 * 
 * Responsibility:
 * - Handle HTTP request/response
 * - Validate input
 * - Call UserService untuk business logic
 * - Return standardized responses
 * 
 * Uses:
 * - UserService untuk business logic
 * - Shared validation utilities & response builders
 */

const userService = require("../services/userService");
const { updateUserSchema } = require("../utils/validation");
const {
  asyncHandler,
  sendSuccess,
  validate,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  getPaginationParams
} = require("../../../shared");

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search term (optional)
 * @param {string} role - Filter by role (optional)
 * @returns {Object} { success, message, data, pagination }
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { search = "", role } = req.query;

  // Call service
  const result = await userService.getAllUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role: role || null
  });

  // Response
  return sendSuccess(res, {
    data: result.users,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, "Users berhasil diambil");
});

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @param {string} id - User ID
 * @returns {Object} { success, message, user }
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Call service
  const user = await userService.getUserById(id);

  // Response
  return sendSuccess(res, { user }, "User berhasil diambil");
});

/**
 * Update user
 * @route PUT /api/users/:id
 * @param {string} id - User ID
 * @param {string} name - User name (optional)
 * @param {string} email - User email (optional)
 * @param {string} password - User password (optional)
 * @param {string} role - User role (optional, admin only)
 * @returns {Object} { success, message, user }
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validasi input menggunakan shared validate (throws ValidationError jika invalid)
  const value = await validate(updateUserSchema, req.body);

  // Call service dengan current user context
  const updatedUser = await userService.updateUser(id, value, req.user);

  // Response
  return sendSuccess(res, { user: updatedUser }, "User berhasil diperbarui");
});

/**
 * Delete user (Admin only)
 * @route DELETE /api/users/:id
 * @param {string} id - User ID
 * @returns {Object} { success, message }
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = await userService.getUserById(id);

  // Prevent deleting yourself
  if (req.user.id === id) {
    return sendBadRequest(res, "Anda tidak dapat menghapus akun sendiri");
  }

  // Call service
  await userService.deleteUser(id);

  // Response
  return sendSuccess(res, {}, "User berhasil dihapus");
});
