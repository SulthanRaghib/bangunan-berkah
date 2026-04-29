const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qaController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// ========================================
// PUBLIC ROUTES
// ========================================
router.post("/", qaController.createQuestion);
router.get("/", qaController.getAnsweredQuestions);

// ========================================
// ADMIN ROUTES
// ========================================
router.get("/admin/all", authMiddleware, roleMiddleware("admin"), qaController.getAllQuestions);
router.get("/admin/:id", authMiddleware, roleMiddleware("admin"), qaController.getQuestionById);
router.patch("/admin/:id/answer", authMiddleware, roleMiddleware("admin"), qaController.answerQuestion);
router.delete("/admin/:id", authMiddleware, roleMiddleware("admin"), qaController.deleteQuestion);

module.exports = router;
