/**
 * Testimonial Public Routes
 * No authentication required
 */

const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");

router.post("/", testimonialController.createTestimonial);
router.get("/", testimonialController.getApprovedTestimonials);

module.exports = router;
