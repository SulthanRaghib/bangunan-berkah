const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

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
 *     summary: Create a new review (Customer only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectCode
 *               - rating
 *             properties:
 *               projectCode:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or Project not completed
 */
router.post("/", authMiddleware, reviewController.createReview);

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
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get("/:projectCode", reviewController.getReviewsByProject);

module.exports = router;
