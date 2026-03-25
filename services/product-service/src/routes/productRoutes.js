const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");
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
  roleMiddleware(["admin"]),
  upload.array("images", 5),
  productController.createProduct
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.array("images", 5),
  productController.updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.deleteProduct
);

router.patch(
  "/:id/featured",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.toggleFeatured
);

router.patch(
  "/:id/active",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.toggleActive
);

module.exports = router;
