/**
 * ============================================
 * EXPRESS APP CONFIGURATION
 * ============================================
 * Main application setup dengan:
 * - Middleware configuration
 * - Routes mounting
 * - Global error handling (dari shared)
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Import shared middleware
const {
  errorHandler,
  notFoundHandler,
  asyncHandler
} = require("../../../shared");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");

const PORT = process.env.PORT || 8001;
const SERVICE_NAME = process.env.SERVICE_NAME || "Auth Service";

dotenv.config();

const app = express();

const parseAllowedOrigins = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * ============================================
 * MIDDLEWARE CONFIGURATION
 * ============================================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = parseAllowedOrigins(
  process.env.CORS_ALLOWED_ORIGINS ||
  "http://localhost:3000,http://localhost:8080,http://localhost:8001"
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * ============================================
 * ROUTES
 * ============================================
 */
app.use(healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", asyncHandler(async (req, res) => {
  res.json({
    service: SERVICE_NAME,
    port: PORT,
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      health: "/health",
    }
  });
}));

/**
 * ============================================
 * GLOBAL MIDDLEWARE
 * ============================================
 */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
