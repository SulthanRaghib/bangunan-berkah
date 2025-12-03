const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create new project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - clientName
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pembangunan Rumah Tinggal Tipe 45
 *               description:
 *                 type: string
 *                 example: Proyek pembangunan rumah tinggal di Jakarta Selatan
 *               clientName:
 *                 type: string
 *                 example: Budi Santoso
 *               location:
 *                 type: string
 *                 example: Jakarta Selatan
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-15
 *               budget:
 *                 type: number
 *                 example: 500000000
 *     responses:
 *       201:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post("/", projectController.createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects with filters (Admin only)
 *     tags: [Projects]
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
 *           enum: [planning, in_progress, completed, on_hold, cancelled]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name or code
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{projectCode}:
 *   get:
 *     summary: Get project by code (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *         example: PRJ-2025-001
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:projectCode", projectController.getProjectByCode);

/**
 * @swagger
 * /api/projects/{projectCode}:
 *   put:
 *     summary: Update project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put("/:projectCode", projectController.updateProject);

/**
 * @swagger
 * /api/projects/{projectCode}:
 *   delete:
 *     summary: Delete project (Admin only)
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:projectCode", projectController.deleteProject);

/**
 * @swagger
 * /api/projects/{projectCode}/status:
 *   patch:
 *     summary: Update project status (Admin only)
 *     tags: [Projects]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, completed, on_hold, cancelled]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Project not found
 */
router.patch("/:projectCode/status", projectController.updateProjectStatus);

/**
 * @swagger
 * /api/projects/{projectCode}/progress:
 *   post:
 *     summary: Add weekly progress report (Admin only)
 *     tags: [Projects]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - weekNumber
 *               - progress
 *               - description
 *             properties:
 *               weekNumber:
 *                 type: integer
 *               progress:
 *                 type: number
 *               description:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Report added successfully
 */
router.post("/:projectCode/progress", upload.array("photos", 5), progressController.addWeeklyReport);

module.exports = router;