/**
 * ============================================
 * INVENTORY REPOSITORY
 * ============================================
 * Data access layer untuk Inventory
 */

const prisma = require("../config/prisma");

class InventoryRepository {
    /**
     * Get all inventory with pagination
     * @param {Object} options - { page, limit, search, lowStock }
     * @returns {Promise<{inventories: Array, total: number}>}
     */
    async findAll(options = {}) {
        try {
            const { page = 1, limit = 10, search = "", lowStock = false } = options;

            const skip = (page - 1) * limit;

            // Build where clause
            const where = {};

            if (lowStock === "true" || lowStock === true) {
                // This requires a subquery - use raw query for better control
                // For now, get all and filter in app
            }

            if (search) {
                where.product = {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { sku: { contains: search, mode: "insensitive" } },
                    ],
                };
            }

            // Get inventory
            const [inventories, total] = await Promise.all([
                prisma.inventory.findMany({
                    where,
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                price: true,
                                salePrice: true,
                                category: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { updatedAt: "desc" },
                }),
                prisma.inventory.count({ where }),
            ]);

            return {
                inventories,
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
     * Get low stock products
     * @param {number} limit - Limit results
     * @returns {Promise<Array>}
     */
    async getLowStock(limit = 10) {
        try {
            return await prisma.inventory.findMany({
                where: {
                    stock: {
                        lte: prisma.inventory.fields.minStock,
                    },
                },
                include: {
                    product: true,
                },
                take: limit,
                orderBy: { stock: "asc" },
            });
        } catch (error) {
            // Fallback: get all and filter locally
            try {
                const all = await prisma.inventory.findMany({
                    include: { product: true },
                });
                return all
                    .filter((inv) => inv.stock <= inv.minStock)
                    .slice(0, limit);
            } catch (e) {
                throw new Error(`Database error in getLowStock: ${error.message}`);
            }
        }
    }

    /**
     * Update stock
     * @param {number|string} productId - Product ID
     * @param {number} quantity - Quantity to add/subtract
     * @param {string} type - 'increment' or 'decrement'
     * @returns {Promise<Object>} Updated inventory
     */
    async updateStock(productId, quantity, type = "increment") {
        try {
            const data = {};
            if (type === "increment") {
                data.stock = { increment: parseInt(quantity) };
            } else {
                data.stock = { decrement: parseInt(quantity) };
            }
            data.updatedAt = new Date();

            const inventory = await prisma.inventory.update({
                where: { productId: parseInt(productId) },
                data,
                include: { product: true },
            });

            return inventory;
        } catch (error) {
            throw new Error(`Database error in updateStock: ${error.message}`);
        }
    }

    /**
     * Set stock
     * @param {number|string} productId - Product ID
     * @param {number} stock - New stock value
     * @returns {Promise<Object>} Updated inventory
     */
    async setStock(productId, stock) {
        try {
            const inventory = await prisma.inventory.update({
                where: { productId: parseInt(productId) },
                data: {
                    stock: parseInt(stock),
                    updatedAt: new Date(),
                },
                include: { product: true },
            });

            return inventory;
        } catch (error) {
            throw new Error(`Database error in setStock: ${error.message}`);
        }
    }

    /**
     * Get inventory by product ID
     * @param {number|string} productId - Product ID
     * @returns {Promise<Object|null>}
     */
    async findByProductId(productId) {
        try {
            return await prisma.inventory.findUnique({
                where: { productId: parseInt(productId) },
                include: { product: true },
            });
        } catch (error) {
            throw new Error(`Database error in findByProductId: ${error.message}`);
        }
    }
}

module.exports = new InventoryRepository();
