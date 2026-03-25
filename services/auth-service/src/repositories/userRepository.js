/**
 * ============================================
 * USER REPOSITORY
 * ============================================
 * Data access layer: Menangani SEMUA operasi database untuk User
 * 
 * Responsibility:
 * - Query MongoDB
 * - Data transformation
 * - Error handling untuk database
 * 
 * Do NOT:
 * - Handle business logic
 * - Handle HTTP responses
 * - Handle validation
 */

const prisma = require("../config/prisma");
const { ObjectId } = require("mongodb");

class UserRepository {
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    async findByEmail(email) {
        try {
            const result = await prisma.$runCommandRaw({
                find: "users",
                filter: { email },
                limit: 1,
                projection: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    password: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            });

            return result.cursor.firstBatch[0] || null;
        } catch (error) {
            throw new Error(`Database error in findByEmail: ${error.message}`);
        }
    }

    /**
     * Find user by ID
     * @param {string|ObjectId} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findById(id) {
        try {
            const result = await prisma.$runCommandRaw({
                aggregate: "users",
                pipeline: [
                    {
                        $addFields: {
                            idString: { $toString: "$_id" }
                        }
                    },
                    { $match: { idString: id } },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            role: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        }
                    },
                    { $limit: 1 }
                ],
                cursor: {}
            });

            return result.cursor.firstBatch[0] || null;
        } catch (error) {
            throw new Error(`Database error in findById: ${error.message}`);
        }
    }

    /**
     * Create new user
     * @param {Object} userData - User data { name, email, password, role }
     * @returns {Promise<Object>} Created user
     */
    async create(userData) {
        try {
            const { name, email, password, role = "user" } = userData;

            const result = await prisma.$runCommandRaw({
                insert: "users",
                documents: [{
                    name,
                    email,
                    password,
                    role,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }]
            });

            const userId = result.insertedId || result.insertedIds?.[0];
            const userIdString = userId.$oid || userId;

            // Return created user
            return {
                id: userIdString,
                name,
                email,
                role,
                createdAt: new Date(),
            };
        } catch (error) {
            throw new Error(`Database error in create: ${error.message}`);
        }
    }

    /**
     * Get all users with pagination & filtering
     * @param {Object} options - { page, limit, search, role }
     * @returns {Promise<{users: Array, total: number}>}
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = "",
                role = null
            } = options;

            const skip = (page - 1) * limit;

            // Build filter
            const filter = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            if (role) {
                filter.role = role;
            }

            // Get users
            const usersResult = await prisma.$runCommandRaw({
                aggregate: "users",
                pipeline: [
                    { $match: filter },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            role: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        }
                    },
                    { $sort: { createdAt: -1 } },
                    { $skip: parseInt(skip) },
                    { $limit: parseInt(limit) }
                ],
                cursor: {}
            });

            // Get total count
            const countResult = await prisma.$runCommandRaw({
                aggregate: "users",
                pipeline: [
                    { $match: filter },
                    { $count: "total" }
                ],
                cursor: {}
            });

            const users = usersResult.cursor.firstBatch.map(user => this._formatUser(user));
            const total = countResult.cursor.firstBatch[0]?.total || 0;

            return {
                users,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw new Error(`Database error in findAll: ${error.message}`);
        }
    }

    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Updated user
     */
    async update(id, updateData) {
        try {
            const { name, email, password, role } = updateData;

            const update = { updatedAt: new Date() };
            if (name) update.name = name;
            if (email) update.email = email;
            if (password) update.password = password;
            if (role) update.role = role;

            // Use custom MongoDB aggregation to find and update by string ID
            const userResult = await prisma.$runCommandRaw({
                aggregate: "users",
                pipeline: [
                    {
                        $addFields: {
                            idString: { $toString: "$_id" }
                        }
                    },
                    { $match: { idString: id } },
                    { $limit: 1 }
                ],
                cursor: {}
            });

            if (userResult.cursor.firstBatch.length === 0) {
                return null;
            }

            const user = userResult.cursor.firstBatch[0];
            const objectId = user._id;

            // Perform update
            await prisma.$runCommandRaw({
                update: "users",
                updates: [{
                    q: { _id: objectId },
                    u: { $set: update }
                }]
            });

            // Return updated user
            const updatedUser = await this.findById(id);
            return updatedUser;
        } catch (error) {
            throw new Error(`Database error in update: ${error.message}`);
        }
    }

    /**
     * Delete user
     * @param {string} id - User ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        try {
            const userResult = await prisma.$runCommandRaw({
                aggregate: "users",
                pipeline: [
                    {
                        $addFields: {
                            idString: { $toString: "$_id" }
                        }
                    },
                    { $match: { idString: id } },
                    { $limit: 1 }
                ],
                cursor: {}
            });

            if (userResult.cursor.firstBatch.length === 0) {
                return false;
            }

            const user = userResult.cursor.firstBatch[0];
            const objectId = user._id;

            await prisma.$runCommandRaw({
                delete: "users",
                deletes: [{
                    q: { _id: objectId },
                    limit: 1
                }]
            });

            return true;
        } catch (error) {
            throw new Error(`Database error in delete: ${error.message}`);
        }
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>}
     */
    async emailExists(email) {
        try {
            const result = await prisma.$runCommandRaw({
                find: "users",
                filter: { email },
                limit: 1
            });

            return result.cursor.firstBatch.length > 0;
        } catch (error) {
            throw new Error(`Database error in emailExists: ${error.message}`);
        }
    }

    /**
     * Format user object for response (remove sensitive data)
     * @private
     * @param {Object} user - Raw user from database
     * @returns {Object} Formatted user
     */
    _formatUser(user) {
        return {
            id: user._id.$oid || user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt?.$date ? new Date(user.createdAt.$date) : new Date(user.createdAt),
            updatedAt: user.updatedAt?.$date ? new Date(user.updatedAt.$date) : new Date(user.updatedAt),
        };
    }
}

module.exports = new UserRepository();
