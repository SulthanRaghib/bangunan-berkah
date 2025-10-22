const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id", productController.getProductById);

// ========================================
// PROTECTED ROUTES (Admin only)
// ========================================
router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  upload.array("images", 5),
  productController.createProduct
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  upload.array("images", 5),
  productController.updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  productController.deleteProduct
);

router.patch(
  "/:id/featured",
  authMiddleware,
  checkRole(["admin"]),
  productController.toggleFeatured
);

router.patch(
  "/:id/active",
  authMiddleware,
  checkRole(["admin"]),
  productController.toggleActive
);

module.exports = router;
