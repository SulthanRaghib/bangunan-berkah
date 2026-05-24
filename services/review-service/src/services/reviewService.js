/**
 * Review Service
 */

const axios = require("axios");
const ReviewRepository = require("../repositories/ReviewRepository");
const { AppError, ValidationError } = require("../utils/errors");
const { cloudinaryService } = require("../../../../shared");

const PROJECT_SERVICE_URL =
    process.env.PROJECT_SERVICE_URL || "http://project-service:8004";

class ReviewService {
    /**
     * Create review with project verification
     */
    async createReview(reviewData) {
        try {
            // Verify project status
            const projectVerified = await this.verifyProjectStatus(
                reviewData.projectCode
            );

            if (!projectVerified) {
                throw new ValidationError(
                    "Proyek harus dalam status 'completed' untuk memberikan review"
                );
            }

            // Process and upload photos to Cloudinary if any
            if (reviewData.photos && reviewData.photos.length > 0) {
                const folder = `reviews/${reviewData.projectCode}/photos`;
                reviewData.photos = await cloudinaryService.processPhotos(reviewData.photos, folder);
            }

            // Create review
            return await ReviewRepository.createReview(reviewData);
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get review by project code
     */
    async getReviewByProjectCode(projectCode) {
        return await ReviewRepository.findByProjectCode(projectCode);
    }

    /**
     * Get review by ID
     */
    async getReviewById(id) {
        return await ReviewRepository.findById(id);
    }

    /**
     * Get all reviews
     */
    async getAllReviews(filters = {}) {
        return await ReviewRepository.getAll(filters);
    }

    /**
     * Update review
     */
    async updateReview(projectCode, updateData) {
        try {
            const oldReview = await ReviewRepository.findByProjectCode(projectCode);

            // Process and upload new photos
            if (updateData.photos) {
                const folder = `reviews/${projectCode}/photos`;
                updateData.photos = await cloudinaryService.processPhotos(updateData.photos, folder);
                
                // Cleanup removed photos from Cloudinary
                await cloudinaryService.cleanupRemovedPhotos(oldReview.photos, updateData.photos);
            }

            return await ReviewRepository.updateReview(projectCode, updateData);
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Delete review
     */
    async deleteReview(projectCode) {
        try {
            const review = await ReviewRepository.findByProjectCode(projectCode);

            // Delete all photos from Cloudinary
            if (review.photos && review.photos.length > 0) {
                const cloudinaryUrls = review.photos.filter((url) => url.includes("cloudinary.com"));
                if (cloudinaryUrls.length > 0) {
                    await cloudinaryService.deleteMultipleImages(cloudinaryUrls);
                }
            }

            return await ReviewRepository.deleteReview(projectCode);
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Verify project status via Project Service
     */
    async verifyProjectStatus(projectCode) {
        try {
            const response = await axios.get(
                `${PROJECT_SERVICE_URL}/api/projects/summary/${projectCode}`,
                { timeout: 5000 }
            );

            return response.data?.data?.status === "completed";
        } catch (error) {
            if (error.code === "ECONNREFUSED") {
                throw new AppError(
                    "Project Service tidak tersedia",
                    503
                );
            }

            if (error.response?.status === 404) {
                throw new ValidationError("Proyek tidak ditemukan");
            }

            throw new AppError(
                error.message || "Gagal verifikasi proyek",
                500
            );
        }
    }
}

module.exports = new ReviewService();
