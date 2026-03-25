/**
 * ============================================
 * PRODUCT SERVICE
 * ============================================
 * Business logic layer untuk Product
 */

const productRepository = require("../repositories/productRepository");
const categoryRepository = require("../repositories/categoryRepository");

class ProductService {
    /**
     * Create product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
        try {
            const { name, categoryId, sku } = productData;

            // Check category exists
            const category = await categoryRepository.findById(categoryId);
            if (!category) {
                const error = new Error("Kategori tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Check SKU uniqueness
            const existingSku = await productRepository.findBySku(sku);
            if (existingSku) {
                const error = new Error("SKU sudah digunakan");
                error.statusCode = 400;
                throw error;
            }

            // Generate slug
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            // Check slug uniqueness
            const existingSlug = await productRepository.findBySlug(slug);
            if (existingSlug) {
                const error = new Error("Produk dengan nama tersebut sudah ada");
                error.statusCode = 400;
                throw error;
            }

            // Create product
            const product = await productRepository.create({
                ...productData,
                slug,
            });

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all products
     * @param {Object} options - { page, limit, search, categoryId, isFeatured, isActive }
     * @returns {Promise<{products: Array, pagination: Object}>}
     */
    async getAllProducts(options = {}) {
        try {
            const result = await productRepository.findAll(options);
            return {
                products: result.products,
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
     * Get product by ID
     * @param {number|string} id - Product ID
     * @returns {Promise<Object>} Product with inventory
     */
    async getProductById(id) {
        try {
            const product = await productRepository.findById(id);

            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get product by slug
     * @param {string} slug - Product slug
     * @returns {Promise<Object>} Product
     */
    async getProductBySlug(slug) {
        try {
            const product = await productRepository.findBySlug(slug);

            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update product
     * @param {number|string} id - Product ID
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(id, updateData) {
        try {
            // Check product exists
            const product = await productRepository.findById(id);
            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // If updating categoryId, verify category exists
            if (updateData.categoryId) {
                const category = await categoryRepository.findById(updateData.categoryId);
                if (!category) {
                    const error = new Error("Kategori tidak ditemukan");
                    error.statusCode = 404;
                    throw error;
                }
            }

            // If updating SKU, check uniqueness
            if (updateData.sku && updateData.sku !== product.sku) {
                const existingSku = await productRepository.findBySku(updateData.sku);
                if (existingSku) {
                    const error = new Error("SKU sudah digunakan");
                    error.statusCode = 400;
                    throw error;
                }
            }

            // If updating name, generate new slug
            if (updateData.name) {
                const slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                if (slug !== product.slug) {
                    const existingSlug = await productRepository.findBySlug(slug);
                    if (existingSlug) {
                        const error = new Error("Produk dengan nama tersebut sudah ada");
                        error.statusCode = 400;
                        throw error;
                    }
                }

                updateData.slug = slug;
            }

            // Update product
            const updated = await productRepository.update(id, updateData);

            return updated;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete product
     * @param {number|string} id - Product ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProduct(id) {
        try {
            // Check product exists
            const product = await productRepository.findById(id);
            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Delete product (will cascade delete inventory)
            await productRepository.delete(id);

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get featured products
     * @param {number} limit - Number of featured products
     * @returns {Promise<Array>}
     */
    async getFeaturedProducts(limit = 8) {
        try {
            return await productRepository.getFeatured(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @param {number} limit - Limit results
     * @returns {Promise<Array>}
     */
    async searchProducts(query, limit = 10) {
        try {
            if (!query || query.length < 2) {
                const error = new Error("Query pencarian minimal 2 karakter");
                error.statusCode = 400;
                throw error;
            }

            return await productRepository.search(query, limit);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProductService();
