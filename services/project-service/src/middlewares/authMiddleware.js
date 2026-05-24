const jwt = require("jsonwebtoken");
const { isAccessTokenBlacklisted } = require("../../../../shared/src/utils/token-blacklist.util");

const parsePathList = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const shouldFailClosedForEndpoint = (req) => {
    const endpointPath = req.originalUrl || req.path || "";

    const failOpenPaths = parsePathList(process.env.AUTH_REDIS_FAIL_OPEN_PATHS);
    const failClosedPaths = parsePathList(process.env.AUTH_REDIS_FAIL_CLOSED_PATHS);

    if (failOpenPaths.some((path) => endpointPath.startsWith(path))) {
        return false;
    }

    if (failClosedPaths.length === 0) {
        return String(process.env.AUTH_REDIS_STRICT || "true") === "true";
    }

    return failClosedPaths.some((path) => endpointPath.startsWith(path));
};

/**
 * Helper: drain request body before sending error response.
 * When a proxy streams a multipart body to this service and middleware
 * sends a response BEFORE the body is fully received, the proxy gets
 * ECONNRESET because the server closes the connection while data is
 * still being written. This drains the remaining body first.
 */
const drainAndRespond = (req, res, statusCode, body) => {
    // If request is already fully received, respond immediately
    if (req.complete) {
        return res.status(statusCode).json(body);
    }

    // Drain remaining body data to prevent ECONNRESET
    req.resume();
    req.on("end", () => {
        res.status(statusCode).json(body);
    });
    req.on("error", () => {
        // If stream errors during drain, still send response
        if (!res.headersSent) {
            res.status(statusCode).json(body);
        }
    });
};

const authMiddleware = async (req, res, next) => {
    try {
        // ── FAST PATH: Trust API Gateway headers ──────────────
        // If the request comes through the API Gateway, it already verified
        // the JWT and injected x-user-* headers. Trust these headers to
        // avoid duplicate JWT verification and Redis blacklist checks.
        // This is critical for multipart uploads — re-checking Redis while
        // the body is still streaming can cause ECONNRESET.
        if (req.headers["x-user-id"] && req.headers["x-user-email"] && req.headers["x-user-role"]) {
            req.user = {
                id: req.headers["x-user-id"],
                email: req.headers["x-user-email"],
                role: req.headers["x-user-role"],
            };
            return next();
        }

        // ── FALLBACK: Direct access (not through gateway) ────
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return drainAndRespond(req, res, 401, {
                success: false,
                message: "Token tidak tersedia",
            });
        }

        const token = authHeader.split(" ")[1];

        try {
            const blacklisted = await isAccessTokenBlacklisted(token);

            if (blacklisted) {
                return drainAndRespond(req, res, 401, {
                    success: false,
                    message: "Token sudah tidak berlaku. Silakan login kembali",
                });
            }
        } catch (redisError) {
            const strictMode = shouldFailClosedForEndpoint(req);

            if (strictMode) {
                return drainAndRespond(req, res, 503, {
                    success: false,
                    message: "Layanan autentikasi sementara tidak tersedia",
                });
            }
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return drainAndRespond(req, res, 401, { success: false, message: "Token kedaluwarsa" });
        }
        return drainAndRespond(req, res, 401, { success: false, message: "Token tidak valid" });
    }
};

module.exports = authMiddleware;
