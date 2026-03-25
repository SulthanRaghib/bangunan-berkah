const { asyncHandler, validate, sendSuccess, sendCreated } = require("../../../shared");
const { reviewSchema } = require("../utils/validation");
const reviewService = require("../services/reviewService");

/**
 * Create Review
 * POST /api/reviews
 * Public endpoint - No auth required
 */
exports.createReview = asyncHandler(async (req, res) => {
    const value = await validate(reviewSchema, req.body);

    const review = await reviewService.createReview(value);

    return sendCreated(res, review, "Ulasan Anda berhasil dikirimkan");
});

/**
 * Get Review by Project Code
 * GET /api/reviews/:projectCode
 * Public endpoint
 */
exports.getReviewsByProject = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const review = await reviewService.getReviewByProjectCode(projectCode);

    return sendSuccess(res, review, "Ulasan berhasil diambil");
});
