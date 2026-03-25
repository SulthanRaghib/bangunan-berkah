const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     tags:
 *       - Testimonials
 *     summary: Submit a new testimonial (Public)
 *     description: Users can submit testimonials without authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - testimonialText
 *               - rating
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer name
 *               email:
 *                 type: string
 *                 format: email
 *               company:
 *                 type: string
 *                 description: Company name (optional)
 *               position:
 *                 type: string
 *                 description: Job position (optional)
 *               testimonialText:
 *                 type: string
 *                 description: Testimonial content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Photo URLs or base64 strings
 *     responses:
 *       201:
 *         description: Testimonial submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", testimonialController.createTestimonial);

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     tags:
 *       - Testimonials
 *     summary: Get approved testimonials (Public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of approved testimonials
 *       500:
 *         description: Server error
 */
router.get("/", testimonialController.getApprovedTestimonials);

/**
 * @swagger
 * /api/testimonials/admin/all:
 *   get:
 *     tags:
 *       - Testimonials (Admin)
 *     summary: Get all testimonials (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, approved, pending]
 *           default: all
 *     responses:
 *       200:
 *         description: List of all testimonials
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get("/admin/all", authMiddleware, roleMiddleware("admin"), testimonialController.getAllTestimonials);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   get:
 *     tags:
 *       - Testimonials (Admin)
 *     summary: Get testimonial by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial details
 *       404:
 *         description: Testimonial not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin/:id", authMiddleware, roleMiddleware("admin"), testimonialController.getTestimonialById);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   put:
 *     tags:
 *       - Testimonials (Admin)
 *     summary: Update testimonial (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Testimonial updated
 *       404:
 *         description: Testimonial not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/admin/:id", authMiddleware, roleMiddleware("admin"), testimonialController.updateTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   delete:
 *     tags:
 *       - Testimonials (Admin)
 *     summary: Delete testimonial (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial deleted
 *       404:
 *         description: Testimonial not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/admin/:id", authMiddleware, roleMiddleware("admin"), testimonialController.deleteTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}/approve:
 *   patch:
 *     tags:
 *       - Testimonials (Admin)
 *     summary: Approve or reject testimonial (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Testimonial approval status updated
 *       404:
 *         description: Testimonial not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/admin/:id/approve", authMiddleware, roleMiddleware("admin"), testimonialController.approveTestimonial);

module.exports = router;
