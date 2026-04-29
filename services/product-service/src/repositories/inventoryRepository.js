const {
    toObjectIdExt,
    escapeRegex,
    aggregate,
    count,
    findOne,
    updateOneById,
} = require("../utils/mongoRaw");

const inventoryLookupPipeline = [
    {
        $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
        },
    },
    {
        $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $lookup: {
            from: "categories",
            localField: "product.categoryId",
            foreignField: "_id",
            as: "category",
        },
    },
    {
        $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $addFields: {
            "product.category": {
                id: { $toString: "$category._id" },
                name: "$category.name",
            },
        },
    },
    { $project: { category: 0 } },
];

class InventoryRepository {
    async findAll(options = {}) {
        try {
            const { page = 1, limit = 10, search = "", lowStock = false } = options;
            const skip = (page - 1) * limit;

            const match = {};
            if (lowStock === "true" || lowStock === true) {
                match.$expr = { $lte: ["$stock", "$minStock"] };
            }

            if (search) {
                const safe = escapeRegex(search);
                match.$or = [
                    { "product.name": { $regex: safe, $options: "i" } },
                    { "product.sku": { $regex: safe, $options: "i" } },
                ];
            }

            const [inventories, totalRows] = await Promise.all([
                aggregate({
                    collection: "inventories",
                    pipeline: [
                        ...inventoryLookupPipeline,
                        { $match: match },
                        { $sort: { updatedAt: -1 } },
                        { $skip: skip },
                        { $limit: parseInt(limit, 10) },
                    ],
                }),
                aggregate({
                    collection: "inventories",
                    pipeline: [...inventoryLookupPipeline, { $match: match }, { $count: "total" }],
                }),
            ]);

            const total = totalRows[0]?.total || 0;

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

    async getLowStock(limit = 10) {
        try {
            return await aggregate({
                collection: "inventories",
                pipeline: [
                    ...inventoryLookupPipeline,
                    { $match: { $expr: { $lte: ["$stock", "$minStock"] } } },
                    { $sort: { stock: 1 } },
                    { $limit: parseInt(limit, 10) },
                ],
            });
        } catch (error) {
            throw new Error(`Database error in getLowStock: ${error.message}`);
        }
    }

    async updateStock(productId, quantity, type = "increment") {
        try {
            const inventory = await findOne({
                collection: "inventories",
                filter: { productId: toObjectIdExt(productId) },
            });

            if (!inventory) return null;

            let stock = inventory.stock;
            if (type === "increment") stock += parseInt(quantity, 10);
            else stock -= parseInt(quantity, 10);

            await updateOneById({
                collection: "inventories",
                id: inventory.id,
                update: {
                    stock,
                    updatedAt: new Date(),
                },
            });

            return await this.findByProductId(productId);
        } catch (error) {
            throw new Error(`Database error in updateStock: ${error.message}`);
        }
    }

    async setStock(productId, stock) {
        try {
            const inventory = await findOne({
                collection: "inventories",
                filter: { productId: toObjectIdExt(productId) },
            });

            if (!inventory) return null;

            await updateOneById({
                collection: "inventories",
                id: inventory.id,
                update: {
                    stock: parseInt(stock, 10),
                    updatedAt: new Date(),
                },
            });

            return await this.findByProductId(productId);
        } catch (error) {
            throw new Error(`Database error in setStock: ${error.message}`);
        }
    }

    async findByProductId(productId) {
        try {
            const rows = await aggregate({
                collection: "inventories",
                pipeline: [
                    { $match: { productId: toObjectIdExt(productId) } },
                    ...inventoryLookupPipeline,
                    { $limit: 1 },
                ],
            });

            return rows[0] || null;
        } catch (error) {
            throw new Error(`Database error in findByProductId: ${error.message}`);
        }
    }
}

module.exports = new InventoryRepository();
