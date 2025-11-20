const express = require("express");
const router = express.Router();
const photoController = require("../controllers/photoController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

/**
 * @swagger
 * /api/{projectCode}/milestones/{milestoneId}/photos:
 *   post:
 *     summary: Upload photo to milestone (Admin only)
 *     tags: [Photos]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               caption:
 *                 type: string
 *                 example: Progress pekerjaan pondasi
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 */
router.post(
    "/:projectCode/milestones/:milestoneId/photos",
    upload.single("photo"),
    photoController.uploadPhoto
);

/**
 * @swagger
 * /api/{projectCode}/milestones/{milestoneId}/photos:
 *   get:
 *     summary: Get all photos for milestone (Admin only)
 *     tags: [Photos]
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
 *         description: Photos retrieved successfully
 */
router.get("/:projectCode/milestones/:milestoneId/photos", photoController.getPhotosByMilestone);

/**
 * @swagger
 * /api/{projectCode}/milestones/{milestoneId}/photos/{photoId}:
 *   delete:
 *     summary: Delete photo (Admin only)
 *     tags: [Photos]
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
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 */
router.delete("/:projectCode/milestones/:milestoneId/photos/:photoId", photoController.deletePhoto);

module.exports = router;