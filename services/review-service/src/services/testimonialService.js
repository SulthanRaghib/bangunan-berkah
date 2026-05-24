/**
 * Testimonial Service
 */

const TestimonialRepository = require("../repositories/TestimonialRepository");
const { AppError, ValidationError } = require("../utils/errors");
const { cloudinaryService } = require("../../../../shared");

class TestimonialService {
    /**
     * Create testimonial
     */
    async createTestimonial(testimonialData) {
        try {
            // Process base64 photos if any
            if (testimonialData.photos && testimonialData.photos.length > 0) {
                const folder = "testimonials/photos";
                testimonialData.photos = await cloudinaryService.processPhotos(testimonialData.photos, folder);
            }

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
        try {
            const oldTestimonial = await TestimonialRepository.findById(id);

            // Process and update photos
            if (updateData.photos) {
                const folder = "testimonials/photos";
                updateData.photos = await cloudinaryService.processPhotos(updateData.photos, folder);
                
                // Cleanup removed photos from Cloudinary
                await cloudinaryService.cleanupRemovedPhotos(oldTestimonial.photos, updateData.photos);
            }

            return await TestimonialRepository.updateTestimonial(id, updateData);
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Delete testimonial
     */
    async deleteTestimonial(id) {
        try {
            const testimonial = await TestimonialRepository.findById(id);

            // Delete all photos from Cloudinary
            if (testimonial.photos && testimonial.photos.length > 0) {
                const cloudinaryUrls = testimonial.photos.filter((url) => url.includes("cloudinary.com"));
                if (cloudinaryUrls.length > 0) {
                    await cloudinaryService.deleteMultipleImages(cloudinaryUrls);
                }
            }

            return await TestimonialRepository.deleteTestimonial(id);
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }
}

module.exports = new TestimonialService();
