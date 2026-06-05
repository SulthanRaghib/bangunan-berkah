/**
 * ============================================
 * RESPONSE HELPER UTILITY
 * ============================================
 * Standardized response helpers for all services
 */

const buildSuccessResponse = (data = null, message = "Berhasil") => ({
    success: true,
    message,
    data,
});

const buildErrorResponse = (message = "Gagal", errors = null) => ({
    success: false,
    message,
    ...(errors ? { errors } : {}),
});

const sendSuccess = (res, data = null, message = "Berhasil", statusCode = 200) => {
    return res.status(statusCode).json(buildSuccessResponse(data, message));
};

const sendCreated = (res, data = null, message = "Berhasil dibuat") => {
    return res.status(201).json(buildSuccessResponse(data, message));
};

const sendError = (res, message = "Terjadi kesalahan", statusCode = 500, errors = null) => {
    return res.status(statusCode).json(buildErrorResponse(message, errors));
};

const sendBadRequest = (res, message = "Permintaan tidak valid", errors = null) => {
    return sendError(res, message, 400, errors);
};

const sendUnauthorized = (res, message = "Tidak terautentikasi") => {
    return sendError(res, message, 401);
};

const sendForbidden = (res, message = "Terlarang") => {
    return sendError(res, message, 403);
};

const sendNotFound = (res, message = "Tidak ditemukan") => {
    return sendError(res, message, 404);
};

module.exports = {
    buildSuccessResponse,
    buildErrorResponse,
    sendSuccess,
    sendCreated,
    sendError,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
};
