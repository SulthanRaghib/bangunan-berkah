const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

const checkDb = async () => {
  await prisma.$runCommandRaw({ ping: 1 });
};

// ========================================
// HEALTH CHECK
// ========================================
router.get("/health", async (req, res) => {
  try {
    await checkDb();

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
    await checkDb();
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

router.get("/health/ready", async (req, res) => {
  try {
    await checkDb();
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

router.get("/health/live", (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;
