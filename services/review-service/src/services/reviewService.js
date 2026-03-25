/**
 * Review Service
 */

const axios = require("axios");
const ReviewRepository = require("../repositories/ReviewRepository");
const { AppError, ValidationError } = require("../utils/errors");

const PROJECT_SERVICE_URL =
    process.env.PROJECT_SERVICE_URL || "http://project-service:3002";

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
     * Get all reviews
     */
    async getAllReviews(filters = {}) {
        return await ReviewRepository.getAll(filters);
    }

    /**
     * Update review
     */
    async updateReview(projectCode, updateData) {
        return await ReviewRepository.updateReview(projectCode, updateData);
    }

    /**
     * Delete review
     */
    async deleteReview(projectCode) {
        return await ReviewRepository.deleteReview(projectCode);
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
