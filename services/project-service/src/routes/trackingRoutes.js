const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");

// PUBLIC ROUTES - No authentication required
router.get("/track/:projectCode", trackingController.trackProject);
router.get("/summary/:projectCode", trackingController.getProjectSummary);

module.exports = router;