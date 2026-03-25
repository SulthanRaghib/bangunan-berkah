/**
 * Base Repository Class
 * Provides common database operations for all repositories
 */

const prisma = require("../config/prisma");
const { buildPaginatedResponse } = require("../../../shared");

class BaseRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.prisma = prisma;
    }

    /**
     * Execute raw MongoDB command
     */
    async runCommand(command) {
        try {
            return await this.prisma.$runCommandRaw(command);
        } catch (error) {
            throw new Error(`Database command failed: ${error.message}`);
        }
    }

    /**
     * Find single document
     */
    async findOne(filter) {
        const result = await this.runCommand({
            find: this.collectionName,
            filter,
            limit: 1,
        });

        return result.cursor.firstBatch[0] || null;
    }

    /**
     * Find multiple documents with pagination
     * @param {Object} filter - MongoDB filter criteria
     * @param {Object} options - Pagination options (page, limit, sort, projection)
     * @returns {Object} - {data, pagination} with pagination metadata
     */
    async findPaginated(filter = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 }, projection = {} } = options;
        const skip = (page - 1) * limit;

        const [dataResult, countResult] = await Promise.all([
            this.runCommand({
                find: this.collectionName,
                filter,
                sort,
                skip,
                limit,
                ...(Object.keys(projection).length > 0 && { projection }),
            }),
            this.runCommand({
                count: this.collectionName,
                query: filter,
            }),
        ]);

        const data = dataResult.cursor.firstBatch || [];
        const total = countResult.n || 0;

        // Use shared pagination utility to format response
        return {
            data,
            pagination: buildPaginatedResponse(data, page, limit, total).pagination,
        };
    }

    /**
     * Insert single document
     */
    async insertOne(document) {
        const result = await this.runCommand({
            insert: this.collectionName,
            documents: [{ ...document, createdAt: new Date(), updatedAt: new Date() }],
        });

        return result.n > 0;
    }

    /**
     * Update single document
     */
    async updateOne(filter, updateData) {
        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: filter,
                    u: {
                        $set: {
                            ...updateData,
                            updatedAt: new Date(),
                        },
                    },
                },
            ],
        });

        return result.nModified > 0;
    }

    /**
     * Delete single document
     */
    async deleteOne(filter) {
        const result = await this.runCommand({
            delete: this.collectionName,
            deletes: [{ q: filter, limit: 1 }],
        });

        return result.n > 0;
    }

    /**
     * Count documents
     */
    async count(filter = {}) {
        const result = await this.runCommand({
            count: this.collectionName,
            query: filter,
        });

        return result.n || 0;
    }

    /**
     * Check if document exists
     */
    async exists(filter) {
        const count = await this.count(filter);
        return count > 0;
    }

    /**
     * Build filter with text search
     */
    buildSearchFilter(searchFields, query) {
        if (!query) return {};

        return {
            $or: searchFields.map((field) => ({
                [field]: { $regex: query, $options: "i" },
            })),
        };
    }

    /**
     * Serialize data for MongoDB (handle dates and types)
     */
    serializeForMongo(data) {
        if (data instanceof Date) {
            return { $date: data.toISOString() };
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.serializeForMongo(item));
        }

        if (data !== null && typeof data === "object") {
            const serialized = {};
            for (const [key, value] of Object.entries(data)) {
                serialized[key] = this.serializeForMongo(value);
            }
            return serialized;
        }

        return data;
    }

    /**
     * Deserialize MongoDB dates
     */
    deserializeDate(mongoDate) {
        if (!mongoDate) return null;
        return mongoDate.$date ? new Date(mongoDate.$date) : new Date(mongoDate);
    }

    /**
     * Parse ObjectId if present
     */
    parseObjectId(objectId) {
        if (!objectId) return null;
        return objectId.$oid || objectId;
    }
}

module.exports = BaseRepository;
