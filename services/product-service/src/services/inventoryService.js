/**
 * ============================================
 * INVENTORY SERVICE
 * ============================================
 * Business logic layer untuk Inventory Management
 */

const inventoryRepository = require("../repositories/inventoryRepository");
const productRepository = require("../repositories/productRepository");

class InventoryService {
    /**
     * Get all inventory
     * @param {Object} options - { page, limit, search, lowStock }
     * @returns {Promise<{inventories: Array, pagination: Object}>}
     */
    async getAllInventory(options = {}) {
        try {
            const result = await inventoryRepository.findAll(options);

            // Filter lowStock locally if needed
            let inventories = result.inventories;
            if (options.lowStock === "true" || options.lowStock === true) {
                inventories = inventories.filter((inv) => inv.stock <= inv.minStock);
            }

            return {
                inventories,
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
     * Get low stock products
     * @param {number} limit - Limit results
     * @returns {Promise<Array>}
     */
    async getLowStockProducts(limit = 10) {
        try {
            return await inventoryRepository.getLowStock(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update stock (increment/decrement)
     * @param {number|string} productId - Product ID
     * @param {number} quantity - Quantity to add/subtract
     * @param {string} type - 'increment' or 'decrement'
     * @returns {Promise<Object>} Updated inventory
     */
    async updateStock(productId, quantity, type = "increment") {
        try {
            // Check product exists
            const product = await productRepository.findById(productId);
            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Get current inventory
            const inventory = await inventoryRepository.findByProductId(productId);
            if (!inventory) {
                const error = new Error("Inventory produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Prevent negative stock for decrement
            if (type === "decrement") {
                const newStock = inventory.stock - parseInt(quantity);
                if (newStock < 0) {
                    const error = new Error(
                        `Stok tidak cukup. Stok saat ini: ${inventory.stock}, pengurangan diminta: ${quantity}`
                    );
                    error.statusCode = 400;
                    throw error;
                }
            }

            // Update stock
            const updated = await inventoryRepository.updateStock(productId, quantity, type);

            return updated;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Set stock (absolute value)
     * @param {number|string} productId - Product ID
     * @param {number} stock - New stock value
     * @returns {Promise<Object>} Updated inventory
     */
    async setStock(productId, stock) {
        try {
            // Check product exists
            const product = await productRepository.findById(productId);
            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Get current inventory
            const inventory = await inventoryRepository.findByProductId(productId);
            if (!inventory) {
                const error = new Error("Inventory produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Validate stock value
            if (stock < 0) {
                const error = new Error("Stok tidak boleh negatif");
                error.statusCode = 400;
                throw error;
            }

            // Set stock
            const updated = await inventoryRepository.setStock(productId, stock);

            return updated;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get inventory by product ID
     * @param {number|string} productId - Product ID
     * @returns {Promise<Object>} Inventory for product
     */
    async getInventoryByProductId(productId) {
        try {
            // Check product exists
            const product = await productRepository.findById(productId);
            if (!product) {
                const error = new Error("Produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            const inventory = await inventoryRepository.findByProductId(productId);
            if (!inventory) {
                const error = new Error("Inventory produk tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            return inventory;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new InventoryService();
