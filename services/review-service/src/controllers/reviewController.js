const prisma = require("../config/prisma");
const axios = require("axios");
const { validateCreateReview } = require("../utils/validation");

// ========================================
// CREATE REVIEW
// ========================================
exports.createReview = async (req, res) => {
    try {
        const { projectCode, rating, comment, photos } = req.body;
        const userId = req.user.id;
        const userName = req.user.name || req.user.email; // Fallback if name not in token

        // 1. Validate Input
        const { error } = validateCreateReview(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // 2. Check if review already exists for this project
        const existingReview = await prisma.review.findUnique({
            where: { projectCode },
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Review already exists for this project",
            });
        }

        // 3. Verify Project Status via Project Service
        // Internal Docker URL: http://project-service:8004
        const projectServiceUrl = process.env.PROJECT_SERVICE_URL || "http://project-service:8004";

        try {
            // We need to pass the auth token to project-service if the endpoint is protected.
            // However, the summary endpoint is PUBLIC according to the prompt/context.
            // "GET /:projectCode (Public) -> getReviewsByProject" - wait, that's review service.
            // In project service: "GET /summary/:projectCode" is Public.

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
                    message: "Project must be completed to submit a review",
                });
            }

            // Optional: Verify if the user is the customer of the project?
            // The prompt says "A user can only submit one review per project" and "The user must be authenticated (Customer role)".
            // It doesn't explicitly say we must check if req.user.id matches project.customerId.
            // But it's good practice. However, project summary might not return customerId.
            // Let's stick to the prompt requirements: "Verify if projectCode exists and status === 'completed'".

        } catch (err) {
            if (err.response && err.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found in Project Service",
                });
            }
            console.error("Error communicating with Project Service:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to verify project status",
            });
        }

        // 4. Create Review
        const newReview = await prisma.review.create({
            data: {
                projectCode,
                userId,
                userName,
                rating,
                comment,
                photos: photos || [],
            },
        });

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: newReview,
        });

    } catch (err) {
        console.error("Create review error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ========================================
// GET REVIEWS BY PROJECT (Public)
// ========================================
exports.getReviewsByProject = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const review = await prisma.review.findUnique({
            where: { projectCode },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "No review found for this project",
            });
        }

        res.status(200).json({
            success: true,
            data: review,
        });

    } catch (err) {
        console.error("Get review error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
