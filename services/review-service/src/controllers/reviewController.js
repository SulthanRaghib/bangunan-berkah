const axios = require("axios");
const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Validation Schema
const reviewSchema = Joi.object({
    projectCode: Joi.string().required().trim(),
    customerName: Joi.string().required().min(3).max(100),
    customerEmail: Joi.string().email().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().optional().max(2000),
    photos: Joi.array().items(Joi.string()).optional(),
});

// ========================================
// CREATE REVIEW (Public - No Auth Required)
// ========================================
exports.createReview = async (req, res) => {
    try {
        const { error, value } = reviewSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map((e) => e.message),
            });
        }

        const { projectCode, customerName, customerEmail, rating, comment, photos } = value;

        // 1. Check if review already exists for this project
        const existingReviewResult = await prisma.$runCommandRaw({
            find: "reviews",
            filter: { projectCode },
            limit: 1,
        });

        if (existingReviewResult.cursor.firstBatch.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Review already exists for this project. One review per project allowed.",
            });
        }

        // 2. Verify Project Status via Project Service
        const projectServiceUrl = process.env.PROJECT_SERVICE_URL || "http://project-service:8004";

        try {
            const projectResponse = await axios.get(`${projectServiceUrl}/api/projects/summary/${projectCode}`);
            const projectData = projectResponse.data.data;

            if (!projectData) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            if (projectData.status !== "completed") {
                return res.status(400).json({
                    success: false,
                    message: "Project must be completed before you can submit a review",
                });
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }
            console.error("Error communicating with Project Service:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to verify project status",
            });
        }

        // 3. Create Review using raw MongoDB command
        const reviewId = new ObjectId();

        await prisma.$runCommandRaw({
            insert: "reviews",
            documents: [{
                _id: reviewId,
                projectCode,
                customerName,
                customerEmail,
                rating,
                comment: comment || null,
                photos: photos || [],
                createdAt: new Date(),
            }],
        });

        const newReview = {
            id: reviewId.toString(),
            projectCode,
            customerName,
            customerEmail,
            rating,
            comment: comment || null,
            photos: photos || [],
            createdAt: new Date(),
        };

        res.status(201).json({
            success: true,
            message: "Review submitted successfully!",
            data: newReview,
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error.message,
        });
    }
};

// ========================================
// GET REVIEW BY PROJECT (Public)
// ========================================
exports.getReviewsByProject = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const reviewResult = await prisma.$runCommandRaw({
            find: "reviews",
            filter: { projectCode },
            limit: 1,
        });

        if (reviewResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No review found for this project yet",
            });
        }

        const review = reviewResult.cursor.firstBatch[0];

        const formattedReview = {
            id: review._id.$oid || review._id,
            projectCode: review.projectCode,
            customerName: review.customerName,
            customerEmail: review.customerEmail,
            rating: review.rating,
            comment: review.comment,
            photos: review.photos,
            createdAt: review.createdAt,
        };

        res.status(200).json({
            success: true,
            data: formattedReview,
        });
    } catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch review",
            error: error.message,
        });
    }
};
