/**
 * QA Public Routes
 * No authentication required
 */

const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qaController");

router.post("/", qaController.createQuestion);
router.get("/", qaController.getAnsweredQuestions);

module.exports = router;
