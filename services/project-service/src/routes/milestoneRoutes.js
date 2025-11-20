const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

// Milestone operations
router.post("/:projectCode/milestones", milestoneController.addMilestone);
router.get("/:projectCode/milestones", milestoneController.getMilestonesByProject);
router.get("/:projectCode/milestones/:milestoneId", milestoneController.getMilestoneById);
router.patch("/:projectCode/milestones/:milestoneId/progress", milestoneController.updateMilestoneProgress);
router.delete("/:projectCode/milestones/:milestoneId", milestoneController.deleteMilestone);

module.exports = router;