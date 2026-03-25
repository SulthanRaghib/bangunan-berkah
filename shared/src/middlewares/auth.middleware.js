/**
 * ============================================
 * CENTRALIZED AUTH MIDDLEWARE
 * ============================================
 * TujuanL Verifikasi JWT token dari semua services
 * Menghilangkan duplikasi di 4 services
 */

const jwt = require("jsonwebtoken");

/**
 * Verifikasi JWT token dan attach user info ke request
 * Format: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Validasi token ketersediaan
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token tidak tersedia",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verifikasi dan decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = decoded; // { id, email, role, iat, exp }

        next();
    } catch (err) {
        return handleAuthError(err, res);
    }
};

/**
 * Handle JWT errors dengan pesan yang jelas
 * @param {Error} err - JWT error object
 * @param {Object} res - Express response object
 */
const handleAuthError = (err, res) => {
    const errorMap = {
        TokenExpiredError: {
            status: 401,
            message: "Token expired: Silakan login kembali",
        },
        JsonWebTokenError: {
            status: 401,
            message: "Token tidak valid",
        },
        NotBeforeError: {
            status: 401,
            message: "Token belum aktif",
        },
    };

    const errorInfo = errorMap[err.name] || {
        status: 500,
        message: "Terjadi kesalahan saat verifikasi token",
    };

    return res.status(errorInfo.status).json({
        success: false,
        message: errorInfo.message,
    });
};

/**
 * Role-based authorization middleware
 * @param {string|string[]} allowedRoles - Role(s) yang diizinkan
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Pastikan auth sudah dijalankan
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const userRole = req.user.role;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Anda tidak memiliki akses. Diperlukan role: ${roles.join(" atau ")}`,
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    roleMiddleware,
    handleAuthError,
};
