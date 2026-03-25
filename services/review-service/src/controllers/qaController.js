const { asyncHandler, validate, sendSuccess, sendCreated } = require("../../../shared");
const { qaSchema, answerSchema } = require("../utils/validation");
const qaService = require("../services/qaService");

/**
 * Create Question
 * POST /api/qas
 * Public endpoint - No auth required
 */
exports.createQuestion = asyncHandler(async (req, res) => {
    const value = await validate(qaSchema, req.body);

    const qa = await qaService.createQuestion(value);

    return sendCreated(
        res,
        qa,
        "Pertanyaan Anda berhasil dikirimkan. Admin akan menjawab segera."
    );
});

/**
 * Get Answered Questions
 * GET /api/qas/answered
 * Public endpoint - No pagination required in query, use defaults
 */
exports.getAnsweredQuestions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await qaService.getAnsweredQuestions({ page, limit });

    return sendSuccess(res, {
        data: result.data,
        pagination: result.pagination,
    }, "Pertanyaan terjawab berhasil diambil");
});

/**
 * Get All Questions
 * GET /api/qas
 * Admin endpoint
 */
exports.getAllQuestions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "all";

    const result = await qaService.getAllQuestions({ page, limit, status });

    return sendSuccess(res, {
        data: result.data,
        pagination: result.pagination,
    }, "Daftar pertanyaan berhasil diambil");
});

/**
 * Get Question by ID
 * GET /api/qas/:id
 * Admin endpoint
 */
exports.getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const qa = await qaService.getQuestionById(id);

    return sendSuccess(res, qa, "Pertanyaan berhasil diambil");
});

/**
 * Answer Question
 * PATCH /api/qas/:id/answer
 * Admin endpoint
 */
exports.answerQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const value = await validate(answerSchema, req.body);

    const qa = await qaService.answerQuestion(id, value.answer);

    return sendSuccess(res, qa, "Pertanyaan berhasil dijawab");
});

/**
 * Delete Question
 * DELETE /api/qas/:id
 * Admin endpoint
 */
exports.deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await qaService.deleteQuestion(id);

    return sendSuccess(res, null, "Pertanyaan berhasil dihapus");
});
