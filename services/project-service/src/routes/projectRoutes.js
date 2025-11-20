const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

// CRUD Operations
router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:projectCode", projectController.getProjectByCode);
router.put("/:projectCode", projectController.updateProject);
router.delete("/:projectCode", projectController.deleteProject);

// Update status
router.patch("/:projectCode/status", projectController.updateProjectStatus);

module.exports = router;