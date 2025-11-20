const express = require("express");
const router = express.Router();
const photoController = require("../controllers/photoController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

// Photo operations
router.post(
    "/:projectCode/milestones/:milestoneId/photos",
    upload.single("photo"),
    photoController.uploadPhoto
);
router.get("/:projectCode/milestones/:milestoneId/photos", photoController.getPhotosByMilestone);
router.delete("/:projectCode/milestones/:milestoneId/photos/:photoId", photoController.deletePhoto);

module.exports = router;