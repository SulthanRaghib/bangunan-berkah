/**
 * ============================================
 * DOWNSTREAM SERVICE AUTH MIDDLEWARE (REFACTORED)
 * ============================================
 * Versi baru: HANYA membaca custom headers dari API Gateway
 * Tidak lagi memverifikasi JWT (sudah dilakukan di gateway)
 * 
 * Benefit:
 * - Menghilangkan duplikasi JWT verification
 * - Lebih cepat: tidak perlu decode/verify
 * - Kompatibel dengan centralized auth di API Gateway
 * - Fallback ke token header jika perlu (untuk service-to-service auth)
 */

const jwt = require("jsonwebtoken");

/**
 * Parse comma-separated list dari environment variable
 */
const parsePathList = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

/**
 * Downstream auth middleware (REFACTORED)
 * Membaca x-user-* headers dari API Gateway, tanpa verifikasi ulang
 */
const authMiddleware = async (req, res, next) => {
    try {
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];
        const userRole = req.headers["x-user-role"];
        const token = req.headers["x-user-token"];

        // Jika headers tersedia (berasal dari API Gateway yang sudah terverifikasi):
        if (userId && userEmail && userRole) {
            // Attach ke req.user (kompatibel dengan controller yang sudah ada)
            req.user = {
                id: userId,
                email: userEmail,
                role: userRole,
            };
            return next();
        }

        // Fallback: Jika request langsung ke service (bypassing gateway):
        // Lakukan verifikasi JWT manual (hanya sebagai safety net)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token tidak tersedia",
            });
        }

        // Extract dan verify token
        const extractedToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);

        req.user = decoded; // { id, email, role, iat, exp }
        next();
    } catch (err) {
        return handleAuthError(err, res);
    }
};

/**
 * Handle JWT errors
 */
const handleAuthError = (err, res) => {
    const errorMap = {
        TokenExpiredError: {
            status: 401,
            message: "Token kedaluwarsa. Silakan login kembali",
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
                message: "Autentikasi diperlukan",
            });
        }

        const userRole = req.user.role;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak. Diperlukan role: ${roles.join(" atau ")}`,
            });
        }

        next();
    };
};

module.exports = { authMiddleware, roleMiddleware };
