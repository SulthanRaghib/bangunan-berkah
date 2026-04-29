const prisma = require("../config/prisma");
const { updateStockSchema } = require("../utils/validation");
const {
    asyncHandler,
    validate,
    sendSuccess,
    sendBadRequest,
    sendNotFound,
    getPaginationParams,
    buildPaginatedResponse,
} = require("../../../shared");
const {
    isValidObjectId,
    toObjectIdExt,
    escapeRegex,
    aggregate,
    count,
    findOne,
    insertOne,
    updateOneById,
    getRawById,
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
            product: {
                $mergeObjects: [
                    "$product",
                    {
                        category: {
                            _id: "$category._id",
                            name: "$category.name",
                            slug: "$category.slug",
                        },
                    },
                ],
            },
        },
    },
    {
        $project: {
            category: 0,
        },
    },
];

const getInventoryByProductId = async (productId) => {
    const rows = await aggregate({
        collection: "inventories",
        pipeline: [
            {
                $match: {
                    productId: toObjectIdExt(productId),
                },
            },
            ...inventoryLookupPipeline,
            { $limit: 1 },
        ],
    });

    return rows[0] || null;
};

/**
 * Get all inventory with pagination
 */
exports.getAllInventory = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, lowStock } = req.query;

    const searchMatch = {};
    if (search) {
        const safe = escapeRegex(search);
        searchMatch.$or = [
            { "product.name": { $regex: safe, $options: "i" } },
            { "product.sku": { $regex: safe, $options: "i" } },
        ];
    }

    if (lowStock === "true") {
        searchMatch.$expr = { $lt: ["$stock", "$minStock"] };
    }

    const [inventories, totalRows] = await Promise.all([
        aggregate({
            collection: "inventories",
            pipeline: [
                ...inventoryLookupPipeline,
                { $match: searchMatch },
                { $sort: { updatedAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ],
        }),
        aggregate({
            collection: "inventories",
            pipeline: [
                ...inventoryLookupPipeline,
                { $match: searchMatch },
                { $count: "total" },
            ],
        }),
    ]);

    const total = totalRows[0]?.total || 0;

    return sendSuccess(
        res,
        {
            data: inventories,
            pagination: buildPaginatedResponse(total, page, limit),
        },
        "Inventory berhasil diambil"
    );
});

/**
 * Get products with low stock
 */
exports.getLowStock = asyncHandler(async (req, res) => {
    const rows = await aggregate({
        collection: "inventories",
        pipeline: [
            ...inventoryLookupPipeline,
            {
                $match: {
                    $expr: {
                        $lt: ["$stock", "$minStock"],
                    },
                },
            },
            { $sort: { stock: 1 } },
        ],
    });

    return sendSuccess(res, rows, "Produk dengan stock rendah");
});

/**
 * Get inventory by product ID
 */
exports.getInventoryByProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
        return sendBadRequest(res, "productId tidak valid");
    }

    const inventory = await getInventoryByProductId(productId);

    if (!inventory) {
        return sendNotFound(res, "Inventory tidak ditemukan");
    }

    return sendSuccess(res, inventory, "Inventory berhasil diambil");
});

/**
 * Update stock with transaction history
 */
exports.updateStock = asyncHandler(async (req, res) => {
    const { productId, type, quantity, description } = req.body;

    const value = await validate(updateStockSchema, {
        type,
        quantity,
        description,
    });

    if (!productId) {
        return sendBadRequest(res, "productId wajib diisi");
    }

    if (!isValidObjectId(String(productId))) {
        return sendBadRequest(res, "productId tidak valid");
    }

    const inventoryRaw = await findOne({
        collection: "inventories",
        filter: { productId: toObjectIdExt(productId) },
    });

    if (!inventoryRaw) {
        return sendNotFound(res, "Inventory tidak ditemukan");
    }

    let newStock = inventoryRaw.stock;
    if (value.type === "in") {
        newStock += parseInt(value.quantity, 10);
    } else {
        newStock -= parseInt(value.quantity, 10);
        if (newStock < 0) {
            return sendBadRequest(
                res,
                `Stock tidak mencukupi. Stok saat ini: ${inventoryRaw.stock}`
            );
        }
    }

    await updateOneById({
        collection: "inventories",
        id: inventoryRaw.id,
        update: {
            stock: newStock,
            lastRestockDate:
                value.type === "in" ? new Date() : inventoryRaw.lastRestockDate || null,
            lastRestockQty:
                value.type === "in" ? parseInt(value.quantity, 10) : inventoryRaw.lastRestockQty || null,
            updatedAt: new Date(),
        },
    });

    await insertOne({
        collection: "stock_histories",
        document: {
            productId: toObjectIdExt(productId),
            type: value.type,
            quantity: parseInt(value.quantity, 10),
            description: value.description || null,
            createdBy: String(req.user?.id || "system"),
            createdAt: new Date(),
        },
    });

    const updated = await getInventoryByProductId(productId);
    return sendSuccess(res, updated, "Stock berhasil diperbarui");
});

/**
 * Get stock history for a product
 */
exports.getStockHistory = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);

    if (!isValidObjectId(productId)) {
        return sendBadRequest(res, "productId tidak valid");
    }

    const [history, total] = await Promise.all([
        aggregate({
            collection: "stock_histories",
            pipeline: [
                { $match: { productId: toObjectIdExt(productId) } },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ],
        }),
        count({
            collection: "stock_histories",
            filter: { productId: toObjectIdExt(productId) },
        }),
    ]);

    return sendSuccess(
        res,
        {
            data: history,
            pagination: buildPaginatedResponse(total, page, limit),
        },
        "Riwayat stock berhasil diambil"
    );
});

/**
 * Update inventory settings
 */
exports.updateInventorySettings = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { minStock, maxStock, warehouseLocation } = req.body;

    if (!isValidObjectId(productId)) {
        return sendBadRequest(res, "productId tidak valid");
    }

    const inventory = await findOne({
        collection: "inventories",
        filter: { productId: toObjectIdExt(productId) },
    });

    if (!inventory) {
        return sendNotFound(res, "Inventory tidak ditemukan");
    }

    const updateData = {};
    if (minStock !== undefined) updateData.minStock = parseInt(minStock, 10);
    if (maxStock !== undefined) updateData.maxStock = parseInt(maxStock, 10);
    if (warehouseLocation !== undefined) {
        updateData.warehouseLocation = warehouseLocation;
    }
    updateData.updatedAt = new Date();

    await updateOneById({
        collection: "inventories",
        id: inventory.id,
        update: updateData,
    });

    const updated = await getInventoryByProductId(productId);
    return sendSuccess(res, updated, "Pengaturan inventory berhasil diperbarui");
});
