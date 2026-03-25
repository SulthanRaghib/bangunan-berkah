const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { ObjectId } = require("mongodb");

const prisma = new PrismaClient();

// Validation Schema
const qaSchema = Joi.object({
    customerName: Joi.string().required().min(3).max(100),
    customerEmail: Joi.string().email().required(),
    question: Joi.string().required().min(10).max(2000),
});

const answerSchema = Joi.object({
    answer: Joi.string().required().min(10).max(5000),
});

// Create Question (Public - No Auth Required)
exports.createQuestion = async (req, res) => {
    try {
        const { error, value } = qaSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map((e) => e.message),
            });
        }

        const qaId = new ObjectId();

        await prisma.$runCommandRaw({
            insert: "qas",
            documents: [{
                _id: qaId,
                customerName: value.customerName,
                customerEmail: value.customerEmail,
                question: value.question,
                answer: null,
                status: "open",
                createdAt: new Date(),
                updatedAt: new Date(),
            }],
        });

        const qa = {
            id: qaId.toString(),
            customerName: value.customerName,
            customerEmail: value.customerEmail,
            question: value.question,
            answer: null,
            status: "open",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        res.status(201).json({
            success: true,
            message: "Question submitted successfully. Admin will answer soon.",
            data: qa,
        });
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit question",
            error: error.message,
        });
    }
};

// Get All Answered Questions (Public)
exports.getAnsweredQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const questionsResult = await prisma.$runCommandRaw({
            find: "qas",
            filter: { status: "answered" },
            sort: { updatedAt: -1 },
            skip,
            limit,
        });

        const countResult = await prisma.$runCommandRaw({
            find: "qas",
            filter: { status: "answered" },
        });

        const questions = questionsResult.cursor.firstBatch.map((doc) => ({
            id: doc._id.$oid || doc._id,
            ...doc,
            _id: undefined,
        }));

        const total = countResult.cursor.firstBatch.length;

        res.status(200).json({
            success: true,
            data: questions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
            error: error.message,
        });
    }
};

// Get All Questions (Admin Only)
exports.getAllQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || "all"; // all, open, answered

        let filter = {};
        if (status === "open") filter.status = "open";
        if (status === "answered") filter.status = "answered";

        const questionsResult = await prisma.$runCommandRaw({
            find: "qas",
            filter,
            sort: { createdAt: "desc" },
            skip,
            limit,
        });

        const countResult = await prisma.$runCommandRaw({
            find: "qas",
            filter,
        });

        const questions = questionsResult.cursor.firstBatch.map((doc) => ({
            id: doc._id.$oid || doc._id,
            ...doc,
            _id: undefined,
        }));

        const total = countResult.cursor.firstBatch.length;

        res.status(200).json({
            success: true,
            data: questions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
            error: error.message,
        });
    }
};

// Get Single Question (Admin Only)
exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const questionResult = await prisma.$runCommandRaw({
            find: "qas",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        if (questionResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        const question = questionResult.cursor.firstBatch[0];

        res.status(200).json({
            success: true,
            data: {
                id: question._id.$oid || question._id,
                ...question,
                _id: undefined,
            },
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID",
            });
        }
        console.error("Error fetching question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch question",
            error: error.message,
        });
    }
};

// Answer Question (Admin Only)
exports.answerQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = answerSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map((e) => e.message),
            });
        }

        // Check if exists
        const existResult = await prisma.$runCommandRaw({
            find: "qas",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        if (existResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        await prisma.$runCommandRaw({
            update: "qas",
            updates: [{
                q: { _id: new ObjectId(id) },
                u: { $set: { answer: value.answer, status: "answered", updatedAt: new Date() } },
                upsert: false,
            }],
        });

        // Fetch updated document
        const updatedResult = await prisma.$runCommandRaw({
            find: "qas",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        const question = updatedResult.cursor.firstBatch[0];

        res.status(200).json({
            success: true,
            message: "Question answered successfully",
            data: {
                id: question._id.$oid || question._id,
                ...question,
                _id: undefined,
            },
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID",
            });
        }
        console.error("Error answering question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to answer question",
            error: error.message,
        });
    }
};

// Delete Question (Admin Only)
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteResult = await prisma.$runCommandRaw({
            delete: "qas",
            deletes: [{
                q: { _id: new ObjectId(id) },
                limit: 1,
            }],
        });

        if (deleteResult.n === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID",
            });
        }
        console.error("Error deleting question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete question",
            error: error.message,
        });
    }
};
