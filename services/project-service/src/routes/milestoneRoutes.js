const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Middleware
router.use(authMiddleware);
router.use(checkRole(["admin"])); // Only admin can manage milestones

/**
 * @swagger
 * tags:
 *   name: Milestones
 *   description: Project Milestone Management
 */

/**
 * @swagger
 * /api/projects/{projectCode}/milestones:
 *   post:
 *     summary: Add a new milestone to a project
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
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [PENDING, ON_PROGRESS, COMPLETED]
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       201:
 *         description: Milestone added successfully
 */
router.post("/:projectCode/milestones", milestoneController.addMilestone);

/**
 * @swagger
 * /api/projects/{projectCode}/milestones:
 *   get:
 *     summary: Get all milestones for a project
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
 *         description: List of milestones
 */
router.get("/:projectCode/milestones", milestoneController.getMilestones);

/**
 * @swagger
 * /api/projects/{projectCode}/milestones/{milestoneId}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a milestone
 *     tags: [Milestones]
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               progress:
 *                 type: integer
 *               targetDate:
 *                 type: string
 *                 format: date
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 */
router.patch(
    "/:projectCode/milestones/:milestoneId",
    upload.array("photos", 5), // Allow up to 5 photos
    milestoneController.updateMilestone
);

/**
 * @swagger
 * /api/projects/{projectCode}/milestones/{milestoneId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a milestone
 *     tags: [Milestones]
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
