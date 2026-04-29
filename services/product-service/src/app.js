const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Import shared middleware
const { errorHandler, notFoundHandler, asyncHandler } = require("../../../shared");

// Import routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const healthRoutes = require("./routes/healthRoutes");

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
const allowedOrigins = parseAllowedOrigins(
  process.env.CORS_ALLOWED_ORIGINS ||
  "http://localhost:3000,http://localhost:8080,http://localhost:8002"
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (untuk serve uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/**
 * ============================================
 * ROUTES
 * ============================================
 */
app.use(healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("/", asyncHandler(async (req, res) => {
  res.json({
    service: "Product Service",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      products: "/api/products",
      categories: "/api/categories",
      inventory: "/api/inventory",
    },
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
