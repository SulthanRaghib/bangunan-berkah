/**
 * ============================================
 * USER SERVICE
 * ============================================
 * Business logic layer untuk User Management
 * 
 * Responsibility:
 * - Get all users
 * - Get user by ID
 * - Update user
 * - Delete user
 * - Authorization checks
 * 
 * Uses:
 * - UserRepository untuk database access
 * - Bcrypt untuk password hashing (untuk update)
 */

const userRepository = require("../repositories/userRepository");
const { hashPassword } = require("../utils/bcrypt");

const normalizeMongoId = (idValue) => {
    if (!idValue) return null;
    if (typeof idValue === "string") return idValue;
    if (typeof idValue === "object" && idValue.$oid) return idValue.$oid;
    if (typeof idValue?.toHexString === "function") return idValue.toHexString();
    return String(idValue);
};

class UserService {
    /**
     * Get all users with pagination & filtering
     * @param {Object} options - { page, limit, search, role }
     * @returns {Promise<Object>} { users, total, page, limit, totalPages }
     * @throws Error jika error database
     */
    async getAllUsers(options = {}) {
        try {
            const result = await userRepository.findAll(options);
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object>} User object
     * @throws Error jika user tidak ditemukan atau error database
     */
    async getUserById(id) {
        try {
            const user = await userRepository.findById(id);

            if (!user) {
                const error = new Error("User tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} updateData - Fields to update { name, email, password, role }
     * @param {Object} requestUser - Current user from JWT { id, role }
     * @returns {Promise<Object>} Updated user
     * @throws Error jika forbidden atau user tidak ditemukan
     */
    async updateUser(id, updateData, requestUser) {
        try {
            // Authorization: user hanya bisa update dirinya sendiri, kecuali admin
            const tokenUserId = normalizeMongoId(requestUser.id);

            if (requestUser.role !== "admin" && tokenUserId !== id) {
                const error = new Error("Anda tidak memiliki izin mengubah user ini");
                error.statusCode = 403;
                throw error;
            }

            // Cek user exists
            const user = await userRepository.findById(id);
            if (!user) {
                const error = new Error("User tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Prepare update data
            const updatePayload = {};

            if (updateData.name) {
                updatePayload.name = updateData.name;
            }

            if (updateData.email) {
                // Cek email tidak sudah dipakai oleh user lain
                const existingUser = await userRepository.findByEmail(updateData.email);
                if (existingUser && existingUser._id !== user._id) {
                    const error = new Error("Email sudah digunakan oleh user lain");
                    error.statusCode = 400;
                    throw error;
                }
                updatePayload.email = updateData.email;
            }

            if (updateData.password) {
                const hashedPassword = await hashPassword(updateData.password);
                updatePayload.password = hashedPassword;
            }

            // Admin bisa update role, user biasa tidak bisa
            if (updateData.role && requestUser.role === "admin") {
                updatePayload.role = updateData.role;
            }

            // Update user
            const updatedUser = await userRepository.update(id, updatePayload);

            return updatedUser;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete user
     * @param {string} id - User ID
     * @param {Object} requestUser - Current user from JWT { id, role }
     * @returns {Promise<boolean>} Success status
     * @throws Error jika forbidden atau user tidak ditemukan
     */
    async deleteUser(id, requestUser) {
        try {
            // Authorization: hanya admin yang bisa delete user
            if (requestUser.role !== "admin") {
                const error = new Error("Hanya admin yang dapat menghapus user");
                error.statusCode = 403;
                throw error;
            }

            // Cek user exists
            const user = await userRepository.findById(id);
            if (!user) {
                const error = new Error("User tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Prevent deleting self
            if (requestUser.id === id) {
                const error = new Error("Anda tidak dapat menghapus akun Anda sendiri");
                error.statusCode = 400;
                throw error;
            }

            // Delete user
            const deleted = await userRepository.delete(id);

            return deleted;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user profile (untuk authenticated user)
     * @param {string} id - User ID
     * @returns {Promise<Object>} User profile
     * @throws Error jika user tidak ditemukan
     */
    async getProfile(id) {
        try {
            const user = await userRepository.findById(id);

            if (!user) {
                const error = new Error("Profile tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();
