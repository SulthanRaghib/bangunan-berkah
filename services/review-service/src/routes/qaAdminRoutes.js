/**
 * QA Admin Routes
 * All routes require authentication + admin role
 */

const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qaController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// Apply auth + admin role to all routes in this file
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/", qaController.getAllQuestions);
router.get("/:id", qaController.getQuestionById);
router.patch("/:id/answer", qaController.answerQuestion);
router.delete("/:id", qaController.deleteQuestion);

module.exports = router;
