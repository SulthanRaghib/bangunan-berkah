const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

/**
 * @swagger
 * /api/{projectCode}/milestones:
 *   post:
 *     summary: Add milestone to project (Admin only)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
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
 *               - name
 *               - targetDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pondasi
 *               description:
 *                 type: string
 *                 example: Pekerjaan pondasi dan struktur bawah
 *               targetDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-02-15
 *     responses:
 *       201:
 *         description: Milestone added successfully
 */
router.post("/:projectCode/milestones", milestoneController.addMilestone);

/**
 * @swagger
 * /api/{projectCode}/milestones:
 *   get:
 *     summary: Get all milestones for project (Admin only)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestones retrieved successfully
 */
router.get("/:projectCode/milestones", milestoneController.getMilestonesByProject);

/**
 * @swagger
 * /api/{projectCode}/milestones/{milestoneId}:
 *   get:
 *     summary: Get milestone by ID (Admin only)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone retrieved successfully
 */
router.get("/:projectCode/milestones/:milestoneId", milestoneController.getMilestoneById);

/**
 * @swagger
 * /api/{projectCode}/milestones/{milestoneId}/progress:
 *   patch:
 *     summary: Update milestone progress (Admin only)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
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
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *                 example: 75
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.patch("/:projectCode/milestones/:milestoneId/progress", milestoneController.updateMilestoneProgress);

/**
 * @swagger
 * /api/{projectCode}/milestones/{milestoneId}:
 *   delete:
 *     summary: Delete milestone (Admin only)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
 */
router.delete("/:projectCode/milestones/:milestoneId", milestoneController.deleteMilestone);

module.exports = router;