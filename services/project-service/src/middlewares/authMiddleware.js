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

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token tidak tersedia",
            });
        }

        const token = authHeader.split(" ")[1];

        try {
            const blacklisted = await isAccessTokenBlacklisted(token);

            if (blacklisted) {
                return res.status(401).json({
                    success: false,
                    message: "Token sudah tidak berlaku. Silakan login kembali",
                });
            }
        } catch (redisError) {
            const strictMode = shouldFailClosedForEndpoint(req);

            if (strictMode) {
                return res.status(503).json({
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
            return res.status(401).json({ success: false, message: "Token kedaluwarsa" });
        }
        return res.status(401).json({ success: false, message: "Token tidak valid" });
    }
};

module.exports = authMiddleware;
