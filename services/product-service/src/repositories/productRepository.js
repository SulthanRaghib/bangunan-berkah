/**
 * ============================================
 * PRODUCT REPOSITORY
 * ============================================
 * Data access layer untuk Product
 */

const prisma = require("../config/prisma");

class ProductRepository {
    /**
     * Create product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async create(productData) {
        try {
            const {
                name,
                slug,
                description,
                sku,
                price,
                salePrice,
                categoryId,
                unit,
                weight,
                dimensions,
                images,
                tags,
                isFeatured,
                stock,
                minStock,
            } = productData;

            const product = await prisma.product.create({
                data: {
                    name,
                    slug,
                    description,
                    sku,
                    price: parseFloat(price),
                    salePrice: salePrice ? parseFloat(salePrice) : null,
                    categoryId: parseInt(categoryId),
                    unit: unit || "pcs",
                    weight: weight ? parseFloat(weight) : null,
                    dimensions,
                    images: images || [],
                    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
                    isFeatured: isFeatured || false,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                include: { category: true },
            });

            // Create inventory entry
            if (stock !== undefined) {
                await prisma.inventory.create({
                    data: {
                        productId: product.id,
                        stock: parseInt(stock),
                        minStock: minStock ? parseInt(minStock) : 10,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
            }

            return product;
        } catch (error) {
            throw new Error(`Database error in create: ${error.message}`);
        }
    }

    /**
     * Find by SKU
     * @param {string} sku - Product SKU
     * @returns {Promise<Object|null>}
     */
    async findBySku(sku) {
        try {
            return await prisma.product.findUnique({
                where: { sku },
                include: { category: true },
            });
        } catch (error) {
            throw new Error(`Database error in findBySku: ${error.message}`);
        }
    }

    /**
     * Find by slug
     * @param {string} slug - Product slug
     * @returns {Promise<Object|null>}
     */
    async findBySlug(slug) {
        try {
            return await prisma.product.findUnique({
                where: { slug },
                include: { category: true },
            });
        } catch (error) {
            throw new Error(`Database error in findBySlug: ${error.message}`);
        }
    }

    /**
     * Find by ID
     * @param {number|string} id - Product ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        try {
            return await prisma.product.findUnique({
                where: { id: parseInt(id) },
                include: {
                    category: true,
                    inventory: true,
                },
            });
        } catch (error) {
            throw new Error(`Database error in findById: ${error.message}`);
        }
    }

    /**
     * Get all products with pagination & filtering
     * @param {Object} options - { page, limit, search, categoryId, isFeatured, isActive }
     * @returns {Promise<{products: Array, total: number, page: number, limit: number, totalPages: number}>}
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = "",
                categoryId = null,
                isFeatured = null,
                isActive = true,
            } = options;

            const skip = (page - 1) * limit;

            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { sku: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            if (categoryId) {
                where.categoryId = parseInt(categoryId);
            }
            if (isFeatured !== null) {
                where.isFeatured = isFeatured === "true" || isFeatured === true;
            }
            if (isActive !== null) {
                where.isActive = isActive === "true" || isActive === true;
            }

            // Get products
            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where,
                    include: {
                        category: true,
                        inventory: true,
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma.product.count({ where }),
            ]);

            return {
                products,
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
     * Update product
     * @param {number|string} id - Product ID
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Updated product
     */
    async update(id, updateData) {
        try {
            const {
                name,
                slug,
                description,
                sku,
                price,
                salePrice,
                categoryId,
                unit,
                weight,
                dimensions,
                images,
                tags,
                isFeatured,
                isActive,
            } = updateData;

            const update = { updatedAt: new Date() };
            if (name) update.name = name;
            if (slug) update.slug = slug;
            if (description) update.description = description;
            if (sku) update.sku = sku;
            if (price) update.price = parseFloat(price);
            if (salePrice !== undefined) {
                update.salePrice = salePrice ? parseFloat(salePrice) : null;
            }
            if (categoryId) update.categoryId = parseInt(categoryId);
            if (unit) update.unit = unit;
            if (weight) update.weight = parseFloat(weight);
            if (dimensions) update.dimensions = dimensions;
            if (images) update.images = images;
            if (tags) {
                update.tags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
            }
            if (isFeatured !== undefined) update.isFeatured = isFeatured;
            if (isActive !== undefined) update.isActive = isActive;

            const product = await prisma.product.update({
                where: { id: parseInt(id) },
                data: update,
                include: { category: true, inventory: true },
            });

            return product;
        } catch (error) {
            throw new Error(`Database error in update: ${error.message}`);
        }
    }

    /**
     * Delete product
     * @param {number|string} id - Product ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        try {
            // Delete inventory first
            await prisma.inventory.deleteMany({
                where: { productId: parseInt(id) },
            });

            // Delete product
            await prisma.product.delete({
                where: { id: parseInt(id) },
            });

            return true;
        } catch (error) {
            throw new Error(`Database error in delete: ${error.message}`);
        }
    }

    /**
     * Get featured products
     * @param {number} limit - Number of featured products
     * @returns {Promise<Array>}
     */
    async getFeatured(limit = 8) {
        try {
            return await prisma.product.findMany({
                where: {
                    isFeatured: true,
                    isActive: true,
                },
                include: { category: true, inventory: true },
                take: limit,
                orderBy: { createdAt: "desc" },
            });
        } catch (error) {
            throw new Error(`Database error in getFeatured: ${error.message}`);
        }
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @param {number} limit - Limit results
     * @returns {Promise<Array>}
     */
    async search(query, limit = 10) {
        try {
            return await prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { sku: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                    isActive: true,
                },
                include: { category: true, inventory: true },
                take: limit,
            });
        } catch (error) {
            throw new Error(`Database error in search: ${error.message}`);
        }
    }
}

module.exports = new ProductRepository();
