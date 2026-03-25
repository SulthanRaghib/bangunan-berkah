/**
 * ============================================
 * CATEGORY SERVICE
 * ============================================
 * Business logic layer untuk Category
 */

const categoryRepository = require("../repositories/categoryRepository");

class CategoryService {
    /**
     * Create category
     * @param {Object} categoryData - Category data { name, description, icon }
     * @returns {Promise<Object>} Created category
     */
    async createCategory(categoryData) {
        try {
            const { name } = categoryData;

            // Generate slug
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            // Check slug uniqueness
            const existing = await categoryRepository.findBySlug(slug);
            if (existing) {
                const error = new Error("Kategori dengan nama tersebut sudah ada");
                error.statusCode = 400;
                throw error;
            }

            // Create category
            const category = await categoryRepository.create({
                ...categoryData,
                slug,
            });

            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all categories
     * @param {Object} options - { page, limit, search, isActive }
     * @returns {Promise<{categories: Array, pagination: Object}>}
     */
    async getAllCategories(options = {}) {
        try {
            const result = await categoryRepository.findAll(options);
            return {
                categories: result.categories,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get category by ID
     * @param {number|string} id - Category ID
     * @returns {Promise<Object>} Category
     */
    async getCategoryById(id) {
        try {
            const category = await categoryRepository.findById(id);

            if (!category) {
                const error = new Error("Kategori tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update category
     * @param {number|string} id - Category ID
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Updated category
     */
    async updateCategory(id, updateData) {
        try {
            // Check category exists
            const category = await categoryRepository.findById(id);
            if (!category) {
                const error = new Error("Kategori tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // If updating name, check slug uniqueness
            if (updateData.name) {
                const slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                if (slug !== category.slug) {
                    const existing = await categoryRepository.findBySlug(slug);
                    if (existing) {
                        const error = new Error("Kategori dengan nama tersebut sudah ada");
                        error.statusCode = 400;
                        throw error;
                    }
                }

                updateData.slug = slug;
            }

            // Update category
            const updated = await categoryRepository.update(id, updateData);

            return updated;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete category
     * @param {number|string} id - Category ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCategory(id) {
        try {
            // Check category exists
            const category = await categoryRepository.findById(id);
            if (!category) {
                const error = new Error("Kategori tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Check if category has products
            if (category._count && category._count.products > 0) {
                const error = new Error(
                    "Tidak dapat menghapus kategori yang memiliki produk. Hapus atau ubah kategori produk terlebih dahulu."
                );
                error.statusCode = 400;
                throw error;
            }

            // Delete category
            await categoryRepository.delete(id);

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get active categories
     * @returns {Promise<Array>}
     */
    async getActiveCategories() {
        try {
            return await categoryRepository.getActive();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CategoryService();
