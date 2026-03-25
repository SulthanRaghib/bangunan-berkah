/**
 * ============================================
 * RESPONSE HELPER UTILITY
 * ============================================
 * Standardized response helpers for all services
 */

const buildSuccessResponse = (data = null, message = "Success") => ({
    success: true,
    message,
    data,
});

const buildErrorResponse = (message = "Error", errors = null) => ({
    success: false,
    message,
    ...(errors ? { errors } : {}),
});

const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json(buildSuccessResponse(data, message));
};

const sendCreated = (res, data = null, message = "Created") => {
    return res.status(201).json(buildSuccessResponse(data, message));
};

const sendError = (res, message = "Error", statusCode = 500, errors = null) => {
    return res.status(statusCode).json(buildErrorResponse(message, errors));
};

const sendBadRequest = (res, message = "Bad Request", errors = null) => {
    return sendError(res, message, 400, errors);
};

const sendUnauthorized = (res, message = "Unauthorized") => {
    return sendError(res, message, 401);
};

const sendForbidden = (res, message = "Forbidden") => {
    return sendError(res, message, 403);
};

const sendNotFound = (res, message = "Not Found") => {
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
