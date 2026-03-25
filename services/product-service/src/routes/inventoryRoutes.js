const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// All routes require authentication
router.use(authMiddleware);

// ========================================
// GET ROUTES
// ========================================
router.get("/", roleMiddleware(["admin"]), inventoryController.getAllInventory);
router.get("/low-stock", roleMiddleware(["admin"]), inventoryController.getLowStock);
router.get("/:productId", inventoryController.getInventoryByProduct);
router.get("/history/:productId", inventoryController.getStockHistory);

// ========================================
// UPDATE ROUTES (Admin only)
// ========================================
router.post(
  "/update-stock",
  roleMiddleware(["admin"]),
  inventoryController.updateStock
);

router.put(
  "/:productId",
  roleMiddleware(["admin"]),
  inventoryController.updateInventorySettings
);

module.exports = router;
