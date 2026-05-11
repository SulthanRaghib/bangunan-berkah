/**
 * Auth Protected Routes
 * All routes require authentication (Bearer token)
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../../../../shared");

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

router.get("/profile", authController.getProfile);
router.post("/logout", authController.logout);

module.exports = router;
