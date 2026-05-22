const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/", reviewController.createReview);
// Only match projectCode that starts with "PRJ-" (exclude /admin endpoint)
router.get(/^\/PRJ-/, reviewController.getReviewsByProject);

module.exports = router;
