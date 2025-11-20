const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");

/**
 * @swagger
 * /api/projects/track/{projectCode}:
 *   get:
 *     summary: Track project progress (Public - No auth required)
 *     tags: [Public - Project Tracking]
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *         example: PRJ-2025-001
 *     responses:
 *       200:
 *         description: Project tracking data retrieved
 *       404:
 *         description: Project not found
 */
router.get("/track/:projectCode", trackingController.trackProject);

/**
 * @swagger
 * /api/projects/summary/{projectCode}:
 *   get:
 *     summary: Get project summary (Public - No auth required)
 *     tags: [Public - Project Tracking]
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *         example: PRJ-2025-001
 *     responses:
 *       200:
 *         description: Project summary retrieved
 *       404:
 *         description: Project not found
 */
router.get("/summary/:projectCode", trackingController.getProjectSummary);

module.exports = router;