const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

/**
 * @swagger
 * /api/{projectCode}/documents:
 *   post:
 *     summary: Upload document to project (Admin only)
 *     tags: [Documents]
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
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *                 example: RAB Proyek
 *               type:
 *                 type: string
 *                 example: contract
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.post("/:projectCode/documents", upload.single("document"), documentController.uploadDocument);

/**
 * @swagger
 * /api/{projectCode}/documents:
 *   get:
 *     summary: Get all documents for project (Admin only)
 *     tags: [Documents]
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
 *         description: Documents retrieved successfully
 */
router.get("/:projectCode/documents", documentController.getDocumentsByProject);

/**
 * @swagger
 * /api/{projectCode}/documents/{documentId}:
 *   delete:
 *     summary: Delete document (Admin only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.delete("/:projectCode/documents/:documentId", documentController.deleteDocument);

module.exports = router;
