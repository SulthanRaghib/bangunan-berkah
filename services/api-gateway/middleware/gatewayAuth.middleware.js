/**
 * ============================================
 * CENTRALIZED JWT AUTH MIDDLEWARE (API GATEWAY)
 * ============================================
 * Verifikasi JWT token SEKALI di API Gateway,
 * kemudian inject user info via custom headers
 * ke downstream services.
 * 
 * Benefit:
 * - Sentralisasi autentikasi → efisiensi resource
 * - Fail-fast: Request ditolak di gateway sebelum tiba di service
 * - Mengurangi duplikasi verifikasi JWT
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
 * Cek apakah request memerlukan token (protected route)
 * Rute publik: exempt dari JWT verification
 */
const isProtectedRoute = (path) => {
    const publicPaths = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/products", // GET products biasanya publik
        "/api/categories", // GET categories publik
        "/api/reviews",
        "/api/testimonials",
        "/api/qa",
        "/health",
        "/docs",
        "/",
    ];

    return !publicPaths.some((p) => path.startsWith(p));
};

/**
 * Main gateway auth middleware
 * Extract JWT → Verify → Inject custom headers
 */
const gatewayAuthMiddleware = (req, res, next) => {
    const path = req.path || req.url;

    // Skip auth untuk rute publik
    if (!isProtectedRoute(path)) {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;

        // Validasi ketersediaan token
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token tidak tersedia. Gunakan format: Authorization: Bearer <token>",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Inject user info ke custom headers untuk downstream services
        // Downstream services HANYA akan membaca headers ini, tanpa verifikasi ulang
        req.headers["x-user-id"] = decoded.id;
        req.headers["x-user-email"] = decoded.email;
        req.headers["x-user-role"] = decoded.role;
        req.headers["x-user-token"] = token; // For fallback verification di service jika perlu

        // Attach decoded user to request object (untuk logging/monitoring di gateway)
        req.user = decoded;

        next();
    } catch (err) {
        return handleJWTError(err, res);
    }
};

/**
 * Handle JWT-specific errors dengan pesan yang jelas
 */
const handleJWTError = (err, res) => {
    const errorMap = {
        TokenExpiredError: {
            status: 401,
            message: "Token kedaluwarsa. Silakan login kembali.",
        },
        JsonWebTokenError: {
            status: 401,
            message: "Token tidak valid.",
        },
        NotBeforeError: {
            status: 401,
            message: "Token belum aktif.",
        },
    };

    const errorInfo = errorMap[err.name] || {
        status: 500,
        message: "Terjadi kesalahan saat verifikasi token.",
    };

    return res.status(errorInfo.status).json({
        success: false,
        message: errorInfo.message,
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
};

module.exports = { gatewayAuthMiddleware, isProtectedRoute };
