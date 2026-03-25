/**
 * Review Service - Base Repository
 * Database abstraction layer for common operations
 */

const prisma = require("../config/prisma");
const { buildPaginatedResponse } = require("../../../shared");

class BaseRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.prisma = prisma;
    }

    async runCommand(command) {
        try {
            return await this.prisma.$runCommandRaw(command);
        } catch (error) {
            throw new Error(`Database command failed: ${error.message}`);
        }
    }

    async findOne(filter) {
        const result = await this.runCommand({
            find: this.collectionName,
            filter,
            limit: 1,
        });

        return result.cursor.firstBatch[0] || null;
    }

    /**
     * Find paginated records
     * @param {Object} filter - MongoDB filter criteria
     * @param {Object} options - Pagination options (page, limit, sort)
     * @returns {Object} - {data, pagination} with pagination metadata
     */
    async findPaginated(filter = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
        const skip = (page - 1) * limit;

        const [dataResult, countResult] = await Promise.all([
            this.runCommand({
                find: this.collectionName,
                filter,
                sort,
                skip,
                limit,
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

    async insertOne(document) {
        const result = await this.runCommand({
            insert: this.collectionName,
            documents: [
                {
                    ...document,
                    createdAt: new Date(),
                    ...(this.collectionName !== "reviews" && {
                        updatedAt: new Date(),
                    }),
                },
            ],
        });

        return result.n > 0;
    }

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

    async deleteOne(filter) {
        const result = await this.runCommand({
            delete: this.collectionName,
            deletes: [{ q: filter, limit: 1 }],
        });

        return result.n > 0;
    }

    async count(filter = {}) {
        const result = await this.runCommand({
            count: this.collectionName,
            query: filter,
        });

        return result.n || 0;
    }

    async exists(filter) {
        const count = await this.count(filter);
        return count > 0;
    }

    parseObjectId(objectId) {
        if (!objectId) return null;
        return objectId.$oid || objectId;
    }
}

module.exports = BaseRepository;
