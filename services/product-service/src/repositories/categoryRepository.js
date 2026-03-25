/**
 * ============================================
 * CATEGORY REPOSITORY
 * ============================================
 * Data access layer untuk Category
 */

const prisma = require("../config/prisma");

class CategoryRepository {
    /**
     * Create category
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(categoryData) {
        try {
            const { name, slug, description, icon } = categoryData;

            const category = await prisma.category.create({
                data: {
                    name,
                    slug,
                    description: description || null,
                    icon: icon || null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            return category;
        } catch (error) {
            throw new Error(`Database error in create: ${error.message}`);
        }
    }

    /**
     * Find by slug
     * @param {string} slug - Category slug
     * @returns {Promise<Object|null>}
     */
    async findBySlug(slug) {
        try {
            return await prisma.category.findUnique({
                where: { slug },
            });
        } catch (error) {
            throw new Error(`Database error in findBySlug: ${error.message}`);
        }
    }

    /**
     * Find by ID
     * @param {number|string} id - Category ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await prisma.category.findUnique({
                where: { id: parseInt(id) },
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Database error in findById: ${error.message}`);
        }
    }

    /**
     * Get all categories with pagination & filtering
     * @param {Object} options - { page, limit, search, isActive }
     * @returns {Promise<{categories: Array, total: number, page: number, limit: number, totalPages: number}>}
     */
    async findAll(options = {}) {
        try {
            const { page = 1, limit = 10, search = "", isActive = true } = options;

            const skip = (page - 1) * limit;

            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            if (isActive !== null) {
                where.isActive = isActive === "true" || isActive === true;
            }

            // Get categories
            const [categories, total] = await Promise.all([
                prisma.category.findMany({
                    where,
                    include: {
                        _count: {
                            select: { products: true },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma.category.count({ where }),
            ]);

            return {
                categories,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new Error(`Database error in findAll: ${error.message}`);
        }
    }

    /**
     * Update category
     * @param {number|string} id - Category ID
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Updated category
     */
    async update(id, updateData) {
        try {
            const { name, slug, description, icon, isActive } = updateData;

            const update = { updatedAt: new Date() };
            if (name) update.name = name;
            if (slug) update.slug = slug;
            if (description !== undefined) update.description = description || null;
            if (icon !== undefined) update.icon = icon || null;
            if (isActive !== undefined) update.isActive = isActive;

            const category = await prisma.category.update({
                where: { id: parseInt(id) },
                data: update,
            });

            return category;
        } catch (error) {
            throw new Error(`Database error in update: ${error.message}`);
        }
    }

    /**
     * Delete category
     * @param {number|string} id - Category ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        try {
            await prisma.category.delete({
                where: { id: parseInt(id) },
            });
            return true;
        } catch (error) {
            throw new Error(`Database error in delete: ${error.message}`);
        }
    }

    /**
     * Get all active categories
     * @returns {Promise<Array>}
     */
    async getActive() {
        try {
            return await prisma.category.findMany({
                where: { isActive: true },
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
                orderBy: { name: "asc" },
            });
        } catch (error) {
            throw new Error(`Database error in getActive: ${error.message}`);
        }
    }
}

module.exports = new CategoryRepository();
