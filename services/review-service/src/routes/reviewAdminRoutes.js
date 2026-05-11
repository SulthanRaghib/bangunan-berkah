/**
 * Review Admin Routes
 * All routes require authentication + admin role
 */

const express = require("express");
const router = express.Router();
const reviewAdminController = require("../controllers/reviewAdminController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// Apply auth + admin role to all routes in this file
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/", reviewAdminController.getAllReviews);
router.get("/:id", reviewAdminController.getReviewById);
router.put("/:projectCode", reviewAdminController.updateReview);
router.delete("/:projectCode", reviewAdminController.deleteReview);

module.exports = router;
