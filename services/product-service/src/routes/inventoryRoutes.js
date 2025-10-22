const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// ========================================
// GET ROUTES
// ========================================
router.get("/", checkRole(["admin"]), inventoryController.getAllInventory);
router.get("/low-stock", checkRole(["admin"]), inventoryController.getLowStock);
router.get("/:productId", inventoryController.getInventoryByProduct);
router.get("/history/:productId", inventoryController.getStockHistory);

// ========================================
// UPDATE ROUTES (Admin only)
// ========================================
router.post(
  "/update-stock",
  checkRole(["admin"]),
  inventoryController.updateStock
);

router.put(
  "/:productId",
  checkRole(["admin"]),
  inventoryController.updateInventorySettings
);

module.exports = router;
