/**
 * QA Service
 */

const QARepository = require("../repositories/QARepository");
const { AppError, ValidationError } = require("../utils/errors");

class QAService {
    /**
     * Create question
     */
    async createQuestion(qaData) {
        try {
            return await QARepository.createQuestion(qaData);
        } catch (error) {
            throw error instanceof AppError || error instanceof ValidationError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get question by ID
     */
    async getQuestionById(id) {
        return await QARepository.findById(id);
    }

    /**
     * Get all questions
     */
    async getAllQuestions(filters = {}) {
        return await QARepository.getAll(filters);
    }

    /**
     * Get answered questions
     */
    async getAnsweredQuestions(filters = {}) {
        return await QARepository.getAnswered(filters);
    }

    /**
     * Answer question
     */
    async answerQuestion(id, answer) {
        if (!answer || answer.trim().length === 0) {
            throw new ValidationError("Jawaban tidak boleh kosong");
        }

        return await QARepository.answerQuestion(id, answer);
    }

    /**
     * Delete question
     */
    async deleteQuestion(id) {
        return await QARepository.deleteQuestion(id);
    }
}

module.exports = new QAService();
