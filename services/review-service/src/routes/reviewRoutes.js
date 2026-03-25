const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Project review management
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a project review (Public - No Login Required)
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectCode
 *               - customerName
 *               - customerEmail
 *               - rating
 *             properties:
 *               projectCode:
 *                 type: string
 *                 description: Unique project code (e.g., PRJ-2026-001)
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 description: Customer email
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating score 1-5
 *               comment:
 *                 type: string
 *                 description: Review comment (optional)
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Photo URLs or base64 strings (optional)
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Validation error or Project not completed
 *       404:
 *         description: Project not found
 */
router.post("/", reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{projectCode}:
 *   get:
 *     summary: Get review for a project (Public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Project code to get review for
 *     responses:
 *       200:
 *         description: Review details with rating and comment
 *       404:
 *         description: No review found for this project
 */
router.get("/:projectCode", reviewController.getReviewsByProject);

module.exports = router;
