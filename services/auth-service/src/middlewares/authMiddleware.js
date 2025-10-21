const jwt = require("jsonwebtoken");

/**
 * Middleware untuk verifikasi JWT token
 * Token format: Bearer <token>
 */

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token tidak tersedia",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded; // { id, email, role, iat, exp }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired: Silakan login kembali",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat verifikasi token",
    });
  }
};

module.exports = authMiddleware;
