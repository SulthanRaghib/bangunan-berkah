const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Admin only routes
router.get("/", checkRole(["admin"]), userController.getAllUsers);
router.delete("/:id", checkRole(["admin"]), userController.deleteUser);

// User or Admin can access
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser); // Authorization check inside controller

module.exports = router;
