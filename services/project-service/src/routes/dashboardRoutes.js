const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

router.get("/stats", dashboardController.getDashboardStats);
router.get("/activities/:projectCode", dashboardController.getProjectActivities);

module.exports = router;