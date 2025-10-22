const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// ========================================
// PROTECTED ROUTES (Admin only)
// ========================================
router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  categoryController.createCategory
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;
