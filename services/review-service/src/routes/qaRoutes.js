const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qaController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

/**
 * @swagger
 * /api/qa:
 *   post:
 *     tags:
 *       - Q&A
 *     summary: Submit a question (Public)
 *     description: Customers can ask questions without authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerEmail
 *               - question
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               customerEmail:
 *                 type: string
 *                 format: email
 *               question:
 *                 type: string
 *                 description: Question content
 *     responses:
 *       201:
 *         description: Question submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", qaController.createQuestion);

/**
 * @swagger
 * /api/qa:
 *   get:
 *     tags:
 *       - Q&A
 *     summary: Get answered questions (Public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of answered questions
 *       500:
 *         description: Server error
 */
router.get("/", qaController.getAnsweredQuestions);

/**
 * @swagger
 * /api/qa/admin/all:
 *   get:
 *     tags:
 *       - Q&A (Admin)
 *     summary: Get all questions (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, open, answered]
 *           default: all
 *     responses:
 *       200:
 *         description: List of all questions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get("/admin/all", authMiddleware, roleMiddleware("admin"), qaController.getAllQuestions);

/**
 * @swagger
 * /api/qa/admin/{id}:
 *   get:
 *     tags:
 *       - Q&A (Admin)
 *     summary: Get question by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question details
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin/:id", authMiddleware, roleMiddleware("admin"), qaController.getQuestionById);

/**
 * @swagger
 * /api/qa/admin/{id}/answer:
 *   patch:
 *     tags:
 *       - Q&A (Admin)
 *     summary: Answer a question (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: Answer to the question
 *     responses:
 *       200:
 *         description: Question answered successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/admin/:id/answer", authMiddleware, roleMiddleware("admin"), qaController.answerQuestion);

/**
 * @swagger
 * /api/qa/admin/{id}:
 *   delete:
 *     tags:
 *       - Q&A (Admin)
 *     summary: Delete question (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/admin/:id", authMiddleware, roleMiddleware("admin"), qaController.deleteQuestion);

module.exports = router;
