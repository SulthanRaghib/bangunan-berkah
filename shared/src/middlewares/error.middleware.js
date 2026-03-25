/**
 * ============================================
 * CENTRALIZED ERROR HANDLING MIDDLEWARE
 * ============================================
 * Menangani semua error dengan konsisten di semua services
 */

/**
 * Async error wrapper untuk wrap controller functions
 * Menangkap promise rejections dan pass ke error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error formatter
 * @param {Array} errors - Joi validation errors
 */
const formatValidationErrors = (errors) => {
    if (!errors || !Array.isArray(errors)) {
        return "Validasi gagal";
    }

    return errors
        .map((error) => error.message || error.details?.[0]?.message)
        .filter(Boolean);
};

/**
 * Global error handler middleware
 * PERLU DILETAKKAN di paling akhir setelah semua routes
 */
const errorHandler = (err, req, res, next) => {
    console.error("Error:", {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    // Handle Joi validation errors
    if (err.name === "ValidationError" && err.details) {
        return res.status(400).json({
            success: false,
            message: "Validasi data gagal",
            errors: formatValidationErrors(err.details),
        });
    }

    // Handle Mongoose/Prisma validation errors
    if (err.name === "PrismaClientValidationError") {
        return res.status(400).json({
            success: false,
            message: "Format data tidak valid",
            error:
                process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }

    // Handle duplicate key errors
    if (err.code === 11000 || err.code === "P2002") {
        const field = Object.keys(err.keyPattern || err.meta?.target || {})[0];
        return res.status(400).json({
            success: false,
            message: `${field || "Field"} sudah terdaftar`,
        });
    }

    // Handle Not Found errors
    if (err.statusCode === 404 || err.status === 404) {
        return res.status(404).json({
            success: false,
            message: err.message || "Resource tidak ditemukan",
        });
    }

    // Handle Unauthorized errors
    if (err.statusCode === 401 || err.status === 401) {
        return res.status(401).json({
            success: false,
            message: err.message || "Unauthorized",
        });
    }

    // Handle Forbidden errors
    if (err.statusCode === 403 || err.status === 403) {
        return res.status(403).json({
            success: false,
            message: err.message || "Forbidden",
        });
    }

    // Handle Bad Request errors
    if (err.statusCode === 400 || err.status === 400) {
        return res.status(400).json({
            success: false,
            message: err.message || "Bad Request",
        });
    }

    // Default server error
    return res.status(err.statusCode || err.status || 500).json({
        success: false,
        message:
            err.message || "Terjadi kesalahan server",
        error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
    });
};

/**
 * 404 handler untuk routes yang tidak ditemukan
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} tidak ditemukan`,
    });
};

module.exports = {
    asyncHandler,
    errorHandler,
    notFoundHandler,
    formatValidationErrors,
};
