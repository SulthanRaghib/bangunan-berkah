/**
 * Testimonial Repository
 */

const BaseRepository = require("./BaseRepository");
const { NotFoundError, AppError } = require("../utils/errors");
const { ObjectId } = require("mongodb");

class TestimonialRepository extends BaseRepository {
    constructor() {
        super("testimonials");
    }

    /**
     * Create testimonial
     */
    async createTestimonial(testimonialData) {
        try {
            const testimonialId = new ObjectId();
            const success = await this.insertOne({
                _id: testimonialId,
                ...testimonialData,
                isApproved: false,
            });

            if (!success) {
                throw new AppError("Gagal membuat testimoni", 500);
            }

            return this.formatTestimonial({
                _id: testimonialId,
                ...testimonialData,
                isApproved: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Find testimonial by ID
     */
    async findById(id) {
        const testimonial = await this.findOne({ _id: new ObjectId(id) });

        if (!testimonial) {
            throw new NotFoundError("Testimoni");
        }

        return this.formatTestimonial(testimonial);
    }

    /**
     * Get all testimonials with pagination
     */
    async getAll(filters = {}) {
        const {
            page = 1,
            limit = 10,
            status = "all",
            sortBy = "createdAt",
            order = "desc",
        } = filters;

        const filter = {};
        if (status === "approved") {
            filter.isApproved = true;
        } else if (status === "pending") {
            filter.isApproved = false;
        }

        const sort = { [sortBy]: order === "desc" ? -1 : 1 };
        const result = await this.findPaginated(filter, {
            page,
            limit,
            sort,
        });

        return {
            data: result.data.map((testimonial) =>
                this.formatTestimonial(testimonial)
            ),
            pagination: result.pagination,
        };
    }

    /**
     * Get approved testimonials
     */
    async getApproved(filters = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",
        } = filters;

        const sort = { [sortBy]: order === "desc" ? -1 : 1 };
        const result = await this.findPaginated(
            { isApproved: true },
            { page, limit, sort }
        );

        return {
            data: result.data.map((testimonial) =>
                this.formatTestimonial(testimonial)
            ),
            pagination: result.pagination,
        };
    }

    /**
     * Approve testimonial
     */
    async approveTestimonial(id) {
        const exists = await this.findOne({ _id: new ObjectId(id) });

        if (!exists) {
            throw new NotFoundError("Testimoni");
        }

        const success = await this.updateOne(
            { _id: new ObjectId(id) },
            { isApproved: true }
        );

        if (!success) {
            throw new AppError("Gagal menyetujui testimoni", 500);
        }

        return await this.findById(id);
    }

    /**
     * Reject testimonial
     */
    async rejectTestimonial(id) {
        const exists = await this.findOne({ _id: new ObjectId(id) });

        if (!exists) {
            throw new NotFoundError("Testimoni");
        }

        const success = await this.updateOne(
            { _id: new ObjectId(id) },
            { isApproved: false }
        );

        if (!success) {
            throw new AppError("Gagal menolak testimoni", 500);
        }

        return await this.findById(id);
    }

    /**
     * Update testimonial
     */
    async updateTestimonial(id, updateData = {}) {
        const exists = await this.findOne({ _id: new ObjectId(id) });

        if (!exists) {
            throw new NotFoundError("Testimoni");
        }

        const allowedFields = [
            "name",
            "email",
            "company",
            "position",
            "testimonialText",
            "rating",
            "photos",
            "isApproved",
        ];

        const payload = {};
        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(updateData, field)) {
                payload[field] = updateData[field];
            }
        }

        const success = await this.updateOne({ _id: new ObjectId(id) }, payload);

        if (!success) {
            throw new AppError("Gagal memperbarui testimoni", 500);
        }

        return await this.findById(id);
    }

    /**
     * Delete testimonial
     */
    async deleteTestimonial(id) {
        const exists = await this.findOne({ _id: new ObjectId(id) });

        if (!exists) {
            throw new NotFoundError("Testimoni");
        }

        const success = await this.deleteOne({ _id: new ObjectId(id) });

        if (!success) {
            throw new AppError("Gagal menghapus testimoni", 500);
        }

        return true;
    }

    /**
     * Format testimonial for response
     */
    formatTestimonial(testimonial) {
        if (!testimonial) return null;

        return {
            id: this.parseObjectId(testimonial._id),
            name: testimonial.name,
            email: testimonial.email,
            company: testimonial.company,
            position: testimonial.position,
            testimonialText: testimonial.testimonialText,
            rating: testimonial.rating,
            photos: testimonial.photos || [],
            isApproved: testimonial.isApproved,
            createdAt: testimonial.createdAt,
            updatedAt: testimonial.updatedAt,
        };
    }
}

module.exports = new TestimonialRepository();
