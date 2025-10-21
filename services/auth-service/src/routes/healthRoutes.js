const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      service: "auth-service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "auth-service",
      timestamp: new Date().toISOString(),
      error: error.message,
      database: "disconnected",
    });
  }
});

// Readiness check
router.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

// Liveness check
router.get("/live", (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;
