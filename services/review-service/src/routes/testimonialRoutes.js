const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// ========================================
// PUBLIC ROUTES
// ========================================
router.post("/", testimonialController.createTestimonial);
router.get("/", testimonialController.getApprovedTestimonials);

// ========================================
// ADMIN ROUTES
// ========================================
router.get("/admin/all", authMiddleware, roleMiddleware(["admin"]), testimonialController.getAllTestimonials);
router.get("/admin/:id", authMiddleware, roleMiddleware(["admin"]), testimonialController.getTestimonialById);
router.put("/admin/:id", authMiddleware, roleMiddleware(["admin"]), testimonialController.updateTestimonial);
router.delete("/admin/:id", authMiddleware, roleMiddleware(["admin"]), testimonialController.deleteTestimonial);
router.patch("/admin/:id/approve", authMiddleware, roleMiddleware(["admin"]), testimonialController.approveTestimonial);

module.exports = router;
