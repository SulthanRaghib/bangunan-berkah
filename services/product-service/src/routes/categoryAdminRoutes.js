/**
 * Category Admin Routes
 * All routes require authentication + admin role
 */

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// Apply auth + admin role to all routes in this file
router.use(authMiddleware, roleMiddleware(["admin"]));

router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
