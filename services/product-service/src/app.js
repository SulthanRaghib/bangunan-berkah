const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Import routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const healthRoutes = require("./routes/healthRoutes");

dotenv.config();

const app = express();

// ============================================
// Middlewares
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (untuk serve uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================
// Routes
// ============================================
app.use(healthRoutes); // Health check
app.use("/api/products", productRoutes); // Product routes
app.use("/api/categories", categoryRoutes); // Category routes
app.use("/api/inventory", inventoryRoutes); // Inventory routes

// Root endpoint
app.get("/", (req, res) => {
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
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    path: req.path,
  });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Multer error (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File terlalu besar. Maksimal 5MB per file",
    });
  }

  if (err.message && err.message.includes("file")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma error
  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Data sudah ada (duplicate)",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Data tidak ditemukan",
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
