const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");

const PORT = process.env.PORT || 8002;
const SERVICE_NAME = process.env.SERVICE_NAME || "Auth Service";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(healthRoutes); // Health check routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/users", userRoutes); // User management routes

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: `${SERVICE_NAME} is running on port ${PORT}`,
    version: "1.0.0",
    status: "running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
  });
});

module.exports = app;
