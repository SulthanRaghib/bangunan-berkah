const { asyncHandler, validate, sendSuccess, sendCreated } = require("../../../shared");
const { testimonialSchema } = require("../utils/validation");
const testimonialService = require("../services/testimonialService");

/**
 * Create Testimonial
 * POST /api/testimonials
 * Public endpoint - No auth required
 */
exports.createTestimonial = asyncHandler(async (req, res) => {
    const value = await validate(testimonialSchema, req.body);

    const testimonial = await testimonialService.createTestimonial(value);

    return sendCreated(
        res,
        testimonial,
        "Testimoni Anda berhasil dikirimkan. Menunggu persetujuan admin."
    );
});

/**
 * Get Approved Testimonials
 * GET /api/testimonials/approved
 * Public endpoint
 */
exports.getApprovedTestimonials = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await testimonialService.getApprovedTestimonials({
        page,
        limit,
    });

    return sendSuccess(res, {
        data: result.data,
        pagination: result.pagination,
    }, "Testimoni disetujui berhasil diambil");
});


/**
 * Get All Testimonials
 * GET /api/testimonials
 * Admin endpoint
 */
exports.getAllTestimonials = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "all";

    const result = await testimonialService.getAllTestimonials({
        page,
        limit,
        status,
    });

    return sendSuccess(res, {
        data: result.data,
        pagination: result.pagination,
    }, "Daftar testimoni berhasil diambil");
});

/**
 * Get Testimonial by ID
 * GET /api/testimonials/:id
 * Admin endpoint
 */
exports.getTestimonialById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testimonial = await testimonialService.getTestimonialById(id);

    return sendSuccess(res, testimonial, "Testimoni berhasil diambil");
});

/**
 * Approve Testimonial
 * PATCH /api/testimonials/:id/approve
 * Admin endpoint
 */
exports.approveTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testimonial = await testimonialService.approveTestimonial(id);

    return sendSuccess(res, testimonial, "Testimoni disetujui");
});

/**
 * Reject Testimonial
 * PATCH /api/testimonials/:id/reject
 * Admin endpoint
 */
exports.rejectTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testimonial = await testimonialService.rejectTestimonial(id);

    return sendSuccess(res, testimonial, "Testimoni ditolak");
});

/**
 * Update Testimonial
 * PUT /api/testimonials/:id
 * Admin endpoint
 */
exports.updateTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testimonial = await testimonialService.updateTestimonial(id, req.body);

    return sendSuccess(res, testimonial, "Testimoni berhasil diperbarui");
});

/**
 * Delete Testimonial
 * DELETE /api/testimonials/:id
 * Admin endpoint
 */
exports.deleteTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await testimonialService.deleteTestimonial(id);

    return sendSuccess(res, null, "Testimoni berhasil dihapus");
});