const prisma = require("../config/prisma");

const isObject = (value) => typeof value === "object" && value !== null;

const isValidObjectId = (value) =>
    typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const toObjectIdExt = (value) => ({ $oid: String(value) });

const escapeRegex = (value = "") =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeValue = (value) => {
    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }

    if (isObject(value)) {
        if (Object.keys(value).length === 1 && value.$oid) {
            return String(value.$oid);
        }

        if (Object.keys(value).length === 1 && value.$date) {
            return new Date(value.$date);
        }

        const next = {};
        for (const [key, val] of Object.entries(value)) {
            if (key === "_id") {
                next.id = normalizeValue(val);
            } else {
                next[key] = normalizeValue(val);
            }
        }

        return next;
    }

    return value;
};

const find = async ({
    collection,
    filter = {},
    projection,
    sort,
    limit,
    skip,
}) => {
    const command = {
        find: collection,
        filter,
    };

    if (projection) command.projection = projection;
    if (sort) command.sort = sort;
    if (typeof limit === "number") command.limit = limit;
    if (typeof skip === "number") command.skip = skip;

    const result = await prisma.$runCommandRaw(command);
    return (result?.cursor?.firstBatch || []).map(normalizeValue);
};

const findOne = async ({ collection, filter = {}, projection, sort }) => {
    const rows = await find({
        collection,
        filter,
        projection,
        sort,
        limit: 1,
    });

    return rows[0] || null;
};

const findOneRaw = async ({ collection, filter = {}, projection, sort }) => {
    const command = {
        find: collection,
        filter,
        limit: 1,
    };

    if (projection) command.projection = projection;
    if (sort) command.sort = sort;

    const result = await prisma.$runCommandRaw(command);
    return result?.cursor?.firstBatch?.[0] || null;
};

const count = async ({ collection, filter = {} }) => {
    const result = await prisma.$runCommandRaw({
        aggregate: collection,
        pipeline: [{ $match: filter }, { $count: "total" }],
        cursor: {},
    });

    return result?.cursor?.firstBatch?.[0]?.total || 0;
};

const aggregate = async ({ collection, pipeline = [] }) => {
    const result = await prisma.$runCommandRaw({
        aggregate: collection,
        pipeline,
        cursor: {},
    });

    return (result?.cursor?.firstBatch || []).map(normalizeValue);
};

const aggregateRaw = async ({ collection, pipeline = [] }) => {
    const result = await prisma.$runCommandRaw({
        aggregate: collection,
        pipeline,
        cursor: {},
    });

    return result?.cursor?.firstBatch || [];
};

const insertOne = async ({ collection, document }) => {
    await prisma.$runCommandRaw({
        insert: collection,
        documents: [document],
    });
};

const getRawById = async ({ collection, id }) => {
    const rows = await aggregateRaw({
        collection,
        pipeline: [
            {
                $addFields: {
                    idString: { $toString: "$_id" },
                },
            },
            { $match: { idString: String(id) } },
            { $limit: 1 },
        ],
    });

    return rows[0] || null;
};

const updateOneById = async ({ collection, id, update }) => {
    const rawDoc = await getRawById({ collection, id });
    if (!rawDoc) {
        return false;
    }

    await prisma.$runCommandRaw({
        update: collection,
        updates: [
            {
                q: { _id: rawDoc._id },
                u: { $set: update },
            },
        ],
    });

    return true;
};

const deleteOneById = async ({ collection, id }) => {
    const rawDoc = await getRawById({ collection, id });
    if (!rawDoc) {
        return false;
    }

    await prisma.$runCommandRaw({
        delete: collection,
        deletes: [
            {
                q: { _id: rawDoc._id },
                limit: 1,
            },
        ],
    });

    return true;
};

module.exports = {
    isValidObjectId,
    toObjectIdExt,
    escapeRegex,
    normalizeValue,
    find,
    findOne,
    findOneRaw,
    count,
    aggregate,
    aggregateRaw,
    insertOne,
    getRawById,
    updateOneById,
    deleteOneById,
};
