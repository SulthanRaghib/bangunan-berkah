const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:projectCode", projectController.getProjectByCode);
router.put("/:projectCode", projectController.updateProject);
router.delete("/:projectCode", projectController.deleteProject);
router.patch("/:projectCode/status", projectController.updateProjectStatus);

// Progress — direct update (NOT accumulated from milestones)
router.get("/:projectCode/progress", projectController.getProjectProgress);
router.patch("/:projectCode/progress", projectController.updateProjectProgress);

// Photos — project documentation photos
router.post("/:projectCode/photos", upload.array("photos", 10), projectController.uploadProjectPhotos);
router.get("/:projectCode/photos", projectController.getProjectPhotos);
router.delete("/:projectCode/photos", projectController.deleteProjectPhoto);

module.exports = router;