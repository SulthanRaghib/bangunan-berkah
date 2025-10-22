const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

// ========================================
// HEALTH CHECK
// ========================================
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      service: "product-service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "product-service",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    });
  }
});

// ========================================
// READINESS CHECK
// ========================================
router.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

// ========================================
// LIVENESS CHECK
// ========================================
router.get("/live", (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;
