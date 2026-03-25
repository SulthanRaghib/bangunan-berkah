/**
 * ============================================
 * PAGINATION UTILITY
 * ============================================
 * Menghilangkan duplikasi pagination logic di services
 */

/**
 * Extract & validate pagination parameters dari query
 * @param {Object} query - Express query object
 * @param {number} defaultLimit - Default limit jika tidak diberikan (default: 10)
 */
const getPaginationParams = (query, defaultLimit = 10) => {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || defaultLimit, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 */
const getPaginationMeta = (page, limit, total) => {
    return {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };
};

/**
 * Build paginated response
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 */
const buildPaginatedResponse = (data, page, limit, total) => {
    return {
        data,
        pagination: getPaginationMeta(page, limit, total),
    };
};

module.exports = {
    getPaginationParams,
    getPaginationMeta,
    buildPaginatedResponse,
};
