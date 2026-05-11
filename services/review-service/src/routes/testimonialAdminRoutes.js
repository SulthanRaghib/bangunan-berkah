/**
 * Testimonial Admin Routes
 * All routes require authentication + admin role
 */

const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// Apply auth + admin role to all routes in this file
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonialById);
router.put("/:id", testimonialController.updateTestimonial);
router.delete("/:id", testimonialController.deleteTestimonial);
router.patch("/:id/approve", testimonialController.approveTestimonial);
router.patch("/:id/reject", testimonialController.rejectTestimonial);

module.exports = router;
