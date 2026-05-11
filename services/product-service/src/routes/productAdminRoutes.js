/**
 * Product Admin Routes
 * All routes require authentication + admin role
 */

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");
const upload = require("../middlewares/uploadMiddleware");

// Apply auth + admin role to all routes in this file
router.use(authMiddleware, roleMiddleware(["admin"]));

router.post("/", upload.array("images", 5), productController.createProduct);
router.put("/:id", upload.array("images", 5), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.patch("/:id/featured", productController.toggleFeatured);
router.patch("/:id/active", productController.toggleActive);

module.exports = router;
