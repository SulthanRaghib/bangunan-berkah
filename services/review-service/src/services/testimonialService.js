/**
 * Testimonial Service
 */

const TestimonialRepository = require("../repositories/TestimonialRepository");
const { AppError, ValidationError } = require("../utils/errors");

class TestimonialService {
    /**
     * Create testimonial
     */
    async createTestimonial(testimonialData) {
        try {
            return await TestimonialRepository.createTestimonial(
                testimonialData
            );
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get testimonial by ID
     */
    async getTestimonialById(id) {
        return await TestimonialRepository.findById(id);
    }

    /**
     * Get all testimonials
     */
    async getAllTestimonials(filters = {}) {
        return await TestimonialRepository.getAll(filters);
    }

    /**
     * Get approved testimonials
     */
    async getApprovedTestimonials(filters = {}) {
        return await TestimonialRepository.getApproved(filters);
    }

    /**
     * Approve testimonial
     */
    async approveTestimonial(id) {
        return await TestimonialRepository.approveTestimonial(id);
    }

    /**
     * Reject testimonial
     */
    async rejectTestimonial(id) {
        return await TestimonialRepository.rejectTestimonial(id);
    }

    /**
     * Update testimonial
     */
    async updateTestimonial(id, updateData) {
        return await TestimonialRepository.updateTestimonial(id, updateData);
    }

    /**
     * Delete testimonial
     */
    async deleteTestimonial(id) {
        return await TestimonialRepository.deleteTestimonial(id);
    }
}

module.exports = new TestimonialService();
