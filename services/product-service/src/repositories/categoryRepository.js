const {
    toObjectIdExt,
    escapeRegex,
    findOne,
    find,
    count,
    aggregate,
    insertOne,
    updateOneById,
    deleteOneById,
} = require("../utils/mongoRaw");

class CategoryRepository {
    async create(categoryData) {
        try {
            const { name, slug, description, icon } = categoryData;

            await insertOne({
                collection: "categories",
                document: {
                    name,
                    slug,
                    description: description || null,
                    icon: icon || null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            return await findOne({
                collection: "categories",
                filter: { slug },
                sort: { createdAt: -1 },
            });
        } catch (error) {
            throw new Error(`Database error in create: ${error.message}`);
        }
    }

    async findBySlug(slug) {
        try {
            return await findOne({
                collection: "categories",
                filter: { slug },
            });
        } catch (error) {
            throw new Error(`Database error in findBySlug: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const rows = await aggregate({
                collection: "categories",
                pipeline: [
                    {
                        $addFields: {
                            idString: { $toString: "$_id" },
                        },
                    },
                    { $match: { idString: String(id) } },
                    {
                        $lookup: {
                            from: "products",
                            let: { categoryId: "$_id" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
                                { $count: "count" },
                            ],
                            as: "productCountDocs",
                        },
                    },
                    {
                        $addFields: {
                            _count: {
                                products: {
                                    $ifNull: [{ $arrayElemAt: ["$productCountDocs.count", 0] }, 0],
                                },
                            },
                        },
                    },
                    { $project: { idString: 0, productCountDocs: 0 } },
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
            const { page = 1, limit = 10, search = "", isActive = true } = options;
            const skip = (page - 1) * limit;

            const match = {};
            if (search) {
                const safe = escapeRegex(search);
                match.$or = [
                    { name: { $regex: safe, $options: "i" } },
                    { description: { $regex: safe, $options: "i" } },
                ];
            }
            if (isActive !== null && isActive !== undefined) {
                match.isActive = isActive === "true" || isActive === true;
            }

            const [categories, total] = await Promise.all([
                aggregate({
                    collection: "categories",
                    pipeline: [
                        { $match: match },
                        {
                            $lookup: {
                                from: "products",
                                let: { categoryId: "$_id" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
                                    { $count: "count" },
                                ],
                                as: "productCountDocs",
                            },
                        },
                        {
                            $addFields: {
                                _count: {
                                    products: {
                                        $ifNull: [{ $arrayElemAt: ["$productCountDocs.count", 0] }, 0],
                                    },
                                },
                            },
                        },
                        { $project: { productCountDocs: 0 } },
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: parseInt(limit, 10) },
                    ],
                }),
                count({
                    collection: "categories",
                    filter: match,
                }),
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

    async update(id, updateData) {
        try {
            const { name, slug, description, icon, isActive } = updateData;

            const update = { updatedAt: new Date() };
            if (name !== undefined) update.name = name;
            if (slug !== undefined) update.slug = slug;
            if (description !== undefined) update.description = description || null;
            if (icon !== undefined) update.icon = icon || null;
            if (isActive !== undefined) update.isActive = isActive;

            await updateOneById({
                collection: "categories",
                id,
                update,
            });

            return await findOne({
                collection: "categories",
                filter: { _id: toObjectIdExt(id) },
            });
        } catch (error) {
            throw new Error(`Database error in update: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            await deleteOneById({
                collection: "categories",
                id,
            });
            return true;
        } catch (error) {
            throw new Error(`Database error in delete: ${error.message}`);
        }
    }

    async getActive() {
        try {
            return await find({
                collection: "categories",
                filter: { isActive: true },
                sort: { name: 1 },
            });
        } catch (error) {
            throw new Error(`Database error in getActive: ${error.message}`);
        }
    }
}

module.exports = new CategoryRepository();
