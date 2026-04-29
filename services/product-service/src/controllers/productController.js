const {
    createProductSchema,
    updateProductSchema,
} = require("../utils/validation");
const {
    asyncHandler,
    validate,
    sendSuccess,
    sendBadRequest,
    sendNotFound,
    getPaginationParams,
    buildPaginatedResponse,
} = require("../../../shared");
const { deleteImage } = require("../utils/imageHandler");
const {
    isValidObjectId,
    toObjectIdExt,
    escapeRegex,
    findOne,
    count,
    aggregate,
    insertOne,
    updateOneById,
    deleteOneById,
    getRawById,
} = require("../utils/mongoRaw");
const prisma = require("../config/prisma");

const productLookupPipeline = [
    {
        $lookup: {
            from: "categories",
            localField: "categoryId",
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
        $lookup: {
            from: "inventories",
            localField: "_id",
            foreignField: "productId",
            as: "inventory",
        },
    },
    {
        $unwind: {
            path: "$inventory",
            preserveNullAndEmptyArrays: true,
        },
    },
];

const getProductByIdWithRelations = async (id) => {
    const rows = await aggregate({
        collection: "products",
        pipeline: [
            {
                $addFields: {
                    idString: { $toString: "$_id" },
                },
            },
            { $match: { idString: String(id) } },
            ...productLookupPipeline,
            { $project: { idString: 0 } },
            { $limit: 1 },
        ],
    });

    return rows[0] || null;
};

const getProductBySlugWithRelations = async (slug) => {
    const rows = await aggregate({
        collection: "products",
        pipeline: [
            { $match: { slug: String(slug) } },
            ...productLookupPipeline,
            { $limit: 1 },
        ],
    });

    return rows[0] || null;
};

/**
 * Create product
 */
exports.createProduct = asyncHandler(async (req, res) => {
    const value = await validate(createProductSchema, req.body);
    const {
        name,
        description,
        sku,
        price,
        salePrice,
        categoryId,
        unit,
        weight,
        dimensions,
        tags,
        isFeatured,
        stock,
        minStock,
    } = value;

    if (!isValidObjectId(categoryId)) {
        return sendBadRequest(res, "categoryId harus berupa ObjectId yang valid");
    }

    const category = await findOne({
        collection: "categories",
        filter: { _id: toObjectIdExt(categoryId), isActive: true },
    });
    if (!category) {
        return sendBadRequest(res, "Kategori tidak ditemukan atau tidak aktif");
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const [existingSlug, existingSku] = await Promise.all([
        findOne({ collection: "products", filter: { slug } }),
        findOne({ collection: "products", filter: { sku } }),
    ]);

    if (existingSlug) {
        return sendBadRequest(res, "Produk dengan nama tersebut sudah ada");
    }

    if (existingSku) {
        return sendBadRequest(res, "SKU sudah digunakan");
    }

    const images = req.files ? req.files.map((file) => file.filename) : [];

    await insertOne({
        collection: "products",
        document: {
            name,
            slug,
            description: description || null,
            sku,
            price: parseFloat(price),
            salePrice: salePrice ? parseFloat(salePrice) : null,
            categoryId: toObjectIdExt(categoryId),
            unit: unit || "pcs",
            weight: weight ? parseFloat(weight) : null,
            dimensions: dimensions || null,
            images,
            tags: tags || null,
            isActive: true,
            isFeatured: isFeatured === "true" || isFeatured === true,
            createdBy: String(req.user?.id || "system"),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    const product = await findOne({
        collection: "products",
        filter: { slug },
        sort: { createdAt: -1 },
    });

    await insertOne({
        collection: "inventories",
        document: {
            productId: toObjectIdExt(product.id),
            stock: stock ? parseInt(stock, 10) : 0,
            minStock: minStock ? parseInt(minStock, 10) : 10,
            maxStock: 1000,
            warehouseLocation: null,
            lastRestockDate: stock && parseInt(stock, 10) > 0 ? new Date() : null,
            lastRestockQty: stock && parseInt(stock, 10) > 0 ? parseInt(stock, 10) : null,
            updatedAt: new Date(),
        },
    });

    if (stock && parseInt(stock, 10) > 0) {
        await insertOne({
            collection: "stock_histories",
            document: {
                productId: toObjectIdExt(product.id),
                type: "in",
                quantity: parseInt(stock, 10),
                description: "Initial stock",
                createdBy: String(req.user?.id || "system"),
                createdAt: new Date(),
            },
        });
    }

    const response = await getProductByIdWithRelations(product.id);
    return sendSuccess(res, response, "Produk berhasil dibuat", 201);
});

/**
 * Get all products with filters and pagination
 */
exports.getAllProducts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, categoryId, minPrice, maxPrice, isFeatured, isActive } = req.query;

    const match = {};

    if (search) {
        const safe = escapeRegex(search);
        match.$or = [
            { name: { $regex: safe, $options: "i" } },
            { description: { $regex: safe, $options: "i" } },
            { sku: { $regex: safe, $options: "i" } },
            { tags: { $regex: safe, $options: "i" } },
        ];
    }

    if (categoryId) {
        if (!isValidObjectId(categoryId)) {
            return sendBadRequest(res, "categoryId tidak valid");
        }
        match.categoryId = toObjectIdExt(categoryId);
    }

    if (minPrice || maxPrice) {
        match.price = {};
        if (minPrice) match.price.$gte = parseFloat(minPrice);
        if (maxPrice) match.price.$lte = parseFloat(maxPrice);
    }

    if (isFeatured !== undefined) {
        match.isFeatured = isFeatured === "true";
    }

    if (isActive !== undefined) {
        match.isActive = isActive === "true";
    }

    const [products, total] = await Promise.all([
        aggregate({
            collection: "products",
            pipeline: [
                { $match: match },
                ...productLookupPipeline,
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ],
        }),
        count({
            collection: "products",
            filter: match,
        }),
    ]);

    return sendSuccess(
        res,
        {
            data: products,
            pagination: buildPaginatedResponse(total, page, limit),
        },
        "Produk berhasil diambil"
    );
});

/**
 * Get product by ID
 */
exports.getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return sendBadRequest(res, "ID produk tidak valid");
    }

    const product = await getProductByIdWithRelations(id);

    if (!product) {
        return sendNotFound(res, "Produk tidak ditemukan");
    }

    return sendSuccess(res, product, "Produk berhasil diambil");
});

/**
 * Get product by slug
 */
exports.getProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const product = await getProductBySlugWithRelations(slug);

    if (!product) {
        return sendNotFound(res, "Produk tidak ditemukan");
    }

    return sendSuccess(res, product, "Produk berhasil diambil");
});

/**
 * Get featured products
 */
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const products = await aggregate({
        collection: "products",
        pipeline: [
            {
                $match: {
                    isFeatured: true,
                    isActive: true,
                },
            },
            ...productLookupPipeline,
            { $sort: { createdAt: -1 } },
            { $limit: parseInt(limit, 10) },
        ],
    });

    return sendSuccess(res, products, "Produk featured berhasil diambil");
});

/**
 * Update product
 */
exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const value = await validate(updateProductSchema, req.body);

    if (!isValidObjectId(id)) {
        return sendBadRequest(res, "ID produk tidak valid");
    }

    const productRaw = await getRawById({ collection: "products", id });
    if (!productRaw) {
        return sendNotFound(res, "Produk tidak ditemukan");
    }

    const data = {};

    if (value.name) {
        const newSlug = value.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const existingSlug = await findOne({
            collection: "products",
            filter: {
                slug: newSlug,
                _id: { $ne: toObjectIdExt(id) },
            },
        });

        if (existingSlug) {
            return sendBadRequest(res, "Produk dengan nama tersebut sudah ada");
        }

        data.name = value.name;
        data.slug = newSlug;
    }

    if (value.sku) {
        const existingSku = await findOne({
            collection: "products",
            filter: {
                sku: value.sku,
                _id: { $ne: toObjectIdExt(id) },
            },
        });

        if (existingSku) {
            return sendBadRequest(res, "SKU sudah digunakan");
        }

        data.sku = value.sku;
    }

    if (value.description !== undefined) data.description = value.description || null;
    if (value.price !== undefined) data.price = parseFloat(value.price);
    if (value.salePrice !== undefined) {
        data.salePrice = value.salePrice ? parseFloat(value.salePrice) : null;
    }

    if (value.categoryId) {
        if (!isValidObjectId(value.categoryId)) {
            return sendBadRequest(res, "categoryId tidak valid");
        }

        const category = await findOne({
            collection: "categories",
            filter: { _id: toObjectIdExt(value.categoryId), isActive: true },
        });

        if (!category) {
            return sendBadRequest(res, "Kategori tidak ditemukan atau tidak aktif");
        }

        data.categoryId = toObjectIdExt(value.categoryId);
    }

    if (value.unit !== undefined) data.unit = value.unit;
    if (value.weight !== undefined) data.weight = value.weight ? parseFloat(value.weight) : null;
    if (value.dimensions !== undefined) data.dimensions = value.dimensions || null;
    if (value.tags !== undefined) data.tags = value.tags || null;
    if (value.isActive !== undefined) {
        data.isActive = value.isActive === "true" || value.isActive === true;
    }
    if (value.isFeatured !== undefined) {
        data.isFeatured = value.isFeatured === "true" || value.isFeatured === true;
    }

    if (req.files && req.files.length > 0) {
        const existingImages = Array.isArray(productRaw.images) ? productRaw.images : [];
        const newImages = req.files.map((file) => file.filename);
        data.images = [...existingImages, ...newImages];
    }

    data.updatedAt = new Date();

    await updateOneById({
        collection: "products",
        id,
        update: data,
    });

    const updated = await getProductByIdWithRelations(id);
    return sendSuccess(res, updated, "Produk berhasil diperbarui");
});

/**
 * Delete product
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return sendBadRequest(res, "ID produk tidak valid");
    }

    const productRaw = await getRawById({ collection: "products", id });
    if (!productRaw) {
        return sendNotFound(res, "Produk tidak ditemukan");
    }

    if (Array.isArray(productRaw.images) && productRaw.images.length > 0) {
        for (const image of productRaw.images) {
            await deleteImage(image);
        }
    }

    await prisma.$runCommandRaw({
        delete: "inventories",
        deletes: [
            {
                q: { productId: productRaw._id },
                limit: 0,
            },
        ],
    });

    await prisma.$runCommandRaw({
        delete: "stock_histories",
        deletes: [
            {
                q: { productId: productRaw._id },
                limit: 0,
            },
        ],
    });

    await deleteOneById({
        collection: "products",
        id,
    });

    return sendSuccess(res, {}, "Produk berhasil dihapus");
});

/**
 * Toggle featured status
 */
exports.toggleFeatured = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return sendBadRequest(res, "ID produk tidak valid");
    }

    const product = await findOne({
        collection: "products",
        filter: { _id: toObjectIdExt(id) },
    });

    if (!product) {
        return sendNotFound(res, "Produk tidak ditemukan");
    }

    await updateOneById({
        collection: "products",
        id,
        update: {
            isFeatured: !product.isFeatured,
            updatedAt: new Date(),
        },
    });

    const updated = await findOne({
        collection: "products",
        filter: { _id: toObjectIdExt(id) },
    });

    return sendSuccess(
        res,
        updated,
        `Produk ${updated.isFeatured ? "ditandai" : "dihapus"} sebagai featured`
    );
});

/**
 * Toggle active status
 */
exports.toggleActive = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return sendBadRequest(res, "ID produk tidak valid");
    }

    const product = await findOne({
        collection: "products",
        filter: { _id: toObjectIdExt(id) },
    });

    if (!product) {
        return sendNotFound(res, "Produk tidak ditemukan");
    }

    await updateOneById({
        collection: "products",
        id,
        update: {
            isActive: !product.isActive,
            updatedAt: new Date(),
        },
    });

    const updated = await findOne({
        collection: "products",
        filter: { _id: toObjectIdExt(id) },
    });

    return sendSuccess(
        res,
        updated,
        `Produk ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}`
    );
});
