/**
 * ============================================
 * SHARED MODULES INDEX
 * ============================================
 * Export semua shared modules untuk kemudahan import
 *
 * Usage:
 * const { authMiddleware, sendSuccess, CONSTANTS } = require('../../../shared');
 */

const {
    authMiddleware,
    roleMiddleware,
} = require("./src/middlewares/auth.middleware");
const {
    asyncHandler,
    errorHandler,
    notFoundHandler,
    formatValidationErrors,
} = require("./src/middlewares/error.middleware");

const {
    getPaginationParams,
    getPaginationMeta,
    buildPaginatedResponse,
} = require("./src/utils/pagination.util");

const {
    buildSuccessResponse,
    buildErrorResponse,
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
} = require("./src/utils/response.util");

const {
    validateData,
    validateRequest,
    validate,
} = require("./src/utils/validation.util");

const CONSTANTS = require("./src/constants/app.constants");

module.exports = {
    authMiddleware,
    roleMiddleware,
    asyncHandler,
    errorHandler,
    notFoundHandler,
    getPaginationParams,
    getPaginationMeta,
    buildPaginatedResponse,
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    buildSuccessResponse,
    buildErrorResponse,
    validateData,
    validateRequest,
    validate,
    CONSTANTS,
    formatValidationErrors,
};
