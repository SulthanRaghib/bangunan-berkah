/**
 * Review Admin Controller
 * Admin-only operations for managing reviews
 */

const { asyncHandler, validate, sendSuccess } = require("../../../shared");
const { reviewUpdateSchema } = require("../utils/validation");
const reviewService = require("../services/reviewService");

/**
 * Get All Reviews (paginated)
 * GET /api/reviews/admin
 */
exports.getAllReviews = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    const result = await reviewService.getAllReviews({
        page,
        limit,
        sortBy,
        order,
    });

    return sendSuccess(res, {
        data: result.data,
        pagination: result.pagination,
    }, "Daftar review berhasil diambil");
});

/**
 * Get Review by ID
 * GET /api/reviews/admin/:id
 */
exports.getReviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await reviewService.getReviewById(id);

    return sendSuccess(res, review, "Review berhasil diambil");
});

/**
 * Update Review
 * PUT /api/reviews/admin/:projectCode
 */
exports.updateReview = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;
    const value = await validate(reviewUpdateSchema, req.body);

    const review = await reviewService.updateReview(projectCode, value);

    return sendSuccess(res, review, "Review berhasil diperbarui");
});

/**
 * Delete Review
 * DELETE /api/reviews/admin/:projectCode
 */
exports.deleteReview = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    await reviewService.deleteReview(projectCode);

    return sendSuccess(res, null, "Review berhasil dihapus");
});
