/**
 * Review Repository
 */

const BaseRepository = require("./BaseRepository");
const { NotFoundError, ConflictError, AppError } = require("../utils/errors");
const { ObjectId } = require("mongodb");

class ReviewRepository extends BaseRepository {
    constructor() {
        super("reviews");
    }

    /**
     * Create review for project
     */
    async createReview(reviewData) {
        try {
            // Check if review already exists
            const exists = await this.exists({ projectCode: reviewData.projectCode });
            if (exists) {
                throw new ConflictError(
                    "Review untuk proyek ini sudah ada"
                );
            }

            const reviewId = new ObjectId();
            const success = await this.insertOne({
                _id: reviewId,
                ...reviewData,
            });

            if (!success) {
                throw new AppError("Gagal membuat review", 500);
            }

            return this.formatReview({
                _id: reviewId,
                ...reviewData,
                createdAt: new Date(),
            });
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Find review by project code
     */
    async findByProjectCode(projectCode) {
        const review = await this.findOne({ projectCode });

        if (!review) {
            throw new NotFoundError("Review");
        }

        return this.formatReview(review);
    }

    /**
     * Find review by project code (optional)
     */
    async findByProjectCodeOptional(projectCode) {
        const review = await this.findOne({ projectCode });
        return review ? this.formatReview(review) : null;
    }

    /**
     * Find review by ID
     */
    async findById(id) {
        const review = await this.findOne({ _id: new ObjectId(id) });

        if (!review) {
            throw new NotFoundError("Review");
        }

        return this.formatReview(review);
    }

    /**
     * Get all reviews with pagination
     */
    async getAll(filters = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",
        } = filters;

        const sort = { [sortBy]: order === "desc" ? -1 : 1 };
        const result = await this.findPaginated({}, { page, limit, sort });

        return {
            data: result.data.map((review) => this.formatReview(review)),
            pagination: result.pagination,
        };
    }

    /**
     * Update review
     */
    async updateReview(projectCode, updateData) {
        const exists = await this.exists({ projectCode });

        if (!exists) {
            throw new NotFoundError("Review");
        }

        const success = await this.updateOne(
            { projectCode },
            updateData
        );

        if (!success) {
            throw new AppError("Gagal mengupdate review", 500);
        }

        return await this.findByProjectCode(projectCode);
    }

    /**
     * Delete review
     */
    async deleteReview(projectCode) {
        const exists = await this.exists({ projectCode });

        if (!exists) {
            throw new NotFoundError("Review");
        }

        const success = await this.deleteOne({ projectCode });

        if (!success) {
            throw new AppError("Gagal menghapus review", 500);
        }

        return true;
    }

    /**
     * Format review for response
     */
    formatReview(review) {
        if (!review) return null;

        return {
            id: this.parseObjectId(review._id),
            projectCode: review.projectCode,
            customerName: review.customerName,
            customerEmail: review.customerEmail,
            rating: review.rating,
            comment: review.comment,
            photos: review.photos || [],
            createdAt: review.createdAt,
        };
    }
}

module.exports = new ReviewRepository();
