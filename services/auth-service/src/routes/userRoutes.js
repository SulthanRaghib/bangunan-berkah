const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

router.use(authMiddleware);

router.get("/", roleMiddleware(["admin"]), userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", roleMiddleware(["admin"]), userController.deleteUser);

module.exports = router;
