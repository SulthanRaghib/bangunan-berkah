const prisma = require("../config/prisma");
const {
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

const includeRelationsPipeline = [
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

class ProductRepository {
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
                    images: images || [],
                    tags: tags || null,
                    isFeatured: !!isFeatured,
                    isActive: true,
                    createdBy: "system",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            const product = await findOne({
                collection: "products",
                filter: { slug },
                sort: { createdAt: -1 },
            });

            if (stock !== undefined) {
                await insertOne({
                    collection: "inventories",
                    document: {
                        productId: toObjectIdExt(product.id),
                        stock: parseInt(stock, 10),
                        minStock: minStock ? parseInt(minStock, 10) : 10,
                        maxStock: 1000,
                        warehouseLocation: null,
                        updatedAt: new Date(),
                    },
                });
            }

            return await this.findById(product.id);
        } catch (error) {
            throw new Error(`Database error in create: ${error.message}`);
        }
    }

    async findBySku(sku) {
        try {
            const rows = await aggregate({
                collection: "products",
                pipeline: [{ $match: { sku } }, ...includeRelationsPipeline, { $limit: 1 }],
            });
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Database error in findBySku: ${error.message}`);
        }
    }

    async findBySlug(slug) {
        try {
            const rows = await aggregate({
                collection: "products",
                pipeline: [{ $match: { slug } }, ...includeRelationsPipeline, { $limit: 1 }],
            });
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Database error in findBySlug: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const rows = await aggregate({
                collection: "products",
                pipeline: [
                    { $addFields: { idString: { $toString: "$_id" } } },
                    { $match: { idString: String(id) } },
                    ...includeRelationsPipeline,
                    { $project: { idString: 0 } },
                    { $limit: 1 },
                ],
            });
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Database error in findById: ${error.message}`);
        }
    }

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
            const match = {};

            if (search) {
                const safe = escapeRegex(search);
                match.$or = [
                    { name: { $regex: safe, $options: "i" } },
                    { sku: { $regex: safe, $options: "i" } },
                    { description: { $regex: safe, $options: "i" } },
                ];
            }

            if (categoryId) {
                match.categoryId = toObjectIdExt(categoryId);
            }

            if (isFeatured !== null) {
                match.isFeatured = isFeatured === "true" || isFeatured === true;
            }

            if (isActive !== null) {
                match.isActive = isActive === "true" || isActive === true;
            }

            const [products, total] = await Promise.all([
                aggregate({
                    collection: "products",
                    pipeline: [
                        { $match: match },
                        ...includeRelationsPipeline,
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: parseInt(limit, 10) },
                    ],
                }),
                count({ collection: "products", filter: match }),
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
            if (name !== undefined) update.name = name;
            if (slug !== undefined) update.slug = slug;
            if (description !== undefined) update.description = description;
            if (sku !== undefined) update.sku = sku;
            if (price !== undefined) update.price = parseFloat(price);
            if (salePrice !== undefined) {
                update.salePrice = salePrice ? parseFloat(salePrice) : null;
            }
            if (categoryId !== undefined) update.categoryId = toObjectIdExt(categoryId);
            if (unit !== undefined) update.unit = unit;
            if (weight !== undefined) update.weight = weight ? parseFloat(weight) : null;
            if (dimensions !== undefined) update.dimensions = dimensions;
            if (images !== undefined) update.images = images;
            if (tags !== undefined) update.tags = tags;
            if (isFeatured !== undefined) update.isFeatured = isFeatured;
            if (isActive !== undefined) update.isActive = isActive;

            await updateOneById({ collection: "products", id, update });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Database error in update: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const product = await getRawById({ collection: "products", id });
            if (!product) return false;

            await prisma.$runCommandRaw({
                delete: "inventories",
                deletes: [{ q: { productId: product._id }, limit: 0 }],
            });

            await prisma.$runCommandRaw({
                delete: "stock_histories",
                deletes: [{ q: { productId: product._id }, limit: 0 }],
            });

            await deleteOneById({ collection: "products", id });
            return true;
        } catch (error) {
            throw new Error(`Database error in delete: ${error.message}`);
        }
    }

    async getFeatured(limit = 8) {
        try {
            return await aggregate({
                collection: "products",
                pipeline: [
                    { $match: { isFeatured: true, isActive: true } },
                    ...includeRelationsPipeline,
                    { $sort: { createdAt: -1 } },
                    { $limit: parseInt(limit, 10) },
                ],
            });
        } catch (error) {
            throw new Error(`Database error in getFeatured: ${error.message}`);
        }
    }

    async search(query, limit = 10) {
        try {
            const safe = escapeRegex(query);
            return await aggregate({
                collection: "products",
                pipeline: [
                    {
                        $match: {
                            $or: [
                                { name: { $regex: safe, $options: "i" } },
                                { sku: { $regex: safe, $options: "i" } },
                                { description: { $regex: safe, $options: "i" } },
                            ],
                            isActive: true,
                        },
                    },
                    ...includeRelationsPipeline,
                    { $limit: parseInt(limit, 10) },
                ],
            });
        } catch (error) {
            throw new Error(`Database error in search: ${error.message}`);
        }
    }
}

module.exports = new ProductRepository();
