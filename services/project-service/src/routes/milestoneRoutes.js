const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Middleware
router.use(authMiddleware);
router.use(checkRole(["admin"]));

router.post("/:projectCode/milestones", milestoneController.addMilestone);
router.get("/:projectCode/milestones", milestoneController.getMilestones);
router.patch("/:projectCode/milestones/:milestoneId", upload.array("photos", 5), milestoneController.updateMilestone);
router.delete("/:projectCode/milestones/:milestoneId", milestoneController.deleteMilestone);

module.exports = router;
