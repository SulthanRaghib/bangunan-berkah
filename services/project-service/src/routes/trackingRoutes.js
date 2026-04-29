const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");

router.get("/track/:projectCode", trackingController.trackProject);
router.get("/summary/:projectCode", trackingController.getProjectSummary);

module.exports = router;