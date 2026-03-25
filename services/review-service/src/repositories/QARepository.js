/**
 * QA Repository
 */

const BaseRepository = require("./BaseRepository");
const { NotFoundError, AppError } = require("../utils/errors");
const { ObjectId } = require("mongodb");

class QARepository extends BaseRepository {
    constructor() {
        super("qas");
    }

    /**
     * Create question
     */
    async createQuestion(qaData) {
        try {
            const qaId = new ObjectId();
            const success = await this.insertOne({
                _id: qaId,
                ...qaData,
                status: "open",
            });

            if (!success) {
                throw new AppError("Gagal membuat pertanyaan", 500);
            }

            return this.formatQA({
                _id: qaId,
                ...qaData,
                status: "open",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Find question by ID
     */
    async findById(id) {
        const qa = await this.findOne({ _id: new ObjectId(id) });

        if (!qa) {
            throw new NotFoundError("Pertanyaan");
        }

        return this.formatQA(qa);
    }

    /**
     * Get all questions with pagination
     */
    async getAll(filters = {}) {
        const {
            page = 1,
            limit = 10,
            status = "all",
            sortBy = "createdAt",
            order = "desc",
        } = filters;

        const filter = {};
        if (status !== "all") {
            filter.status = status;
        }

        const sort = { [sortBy]: order === "desc" ? -1 : 1 };
        const result = await this.findPaginated(filter, {
            page,
            limit,
            sort,
        });

        return {
            data: result.data.map((qa) => this.formatQA(qa)),
            pagination: result.pagination,
        };
    }

    /**
     * Get answered questions
     */
    async getAnswered(filters = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = "updatedAt",
            order = "desc",
        } = filters;

        const sort = { [sortBy]: order === "desc" ? -1 : 1 };
        const result = await this.findPaginated(
            { status: "answered" },
            { page, limit, sort }
        );

        return {
            data: result.data.map((qa) => this.formatQA(qa)),
            pagination: result.pagination,
        };
    }

    /**
     * Answer question
     */
    async answerQuestion(id, answer) {
        const exists = await this.findOne({ _id: new ObjectId(id) });

        if (!exists) {
            throw new NotFoundError("Pertanyaan");
        }

        const success = await this.updateOne(
            { _id: new ObjectId(id) },
            { answer, status: "answered" }
        );

        if (!success) {
            throw new AppError("Gagal menjawab pertanyaan", 500);
        }

        return await this.findById(id);
    }

    /**
     * Delete question
     */
    async deleteQuestion(id) {
        const exists = await this.findOne({ _id: new ObjectId(id) });

        if (!exists) {
            throw new NotFoundError("Pertanyaan");
        }

        const success = await this.deleteOne({ _id: new ObjectId(id) });

        if (!success) {
            throw new AppError("Gagal menghapus pertanyaan", 500);
        }

        return true;
    }

    /**
     * Format QA for response
     */
    formatQA(qa) {
        if (!qa) return null;

        return {
            id: this.parseObjectId(qa._id),
            customerName: qa.customerName,
            customerEmail: qa.customerEmail,
            question: qa.question,
            answer: qa.answer,
            status: qa.status,
            createdAt: qa.createdAt,
            updatedAt: qa.updatedAt,
        };
    }
}

module.exports = new QARepository();
