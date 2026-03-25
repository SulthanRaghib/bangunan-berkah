const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { ObjectId } = require("mongodb");

const prisma = new PrismaClient();

// Validation Schema
const testimonialSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().email().required(),
    company: Joi.string().optional().max(100),
    position: Joi.string().optional().max(100),
    testimonialText: Joi.string().required().min(10).max(5000),
    rating: Joi.number().integer().min(1).max(5).required(),
    photos: Joi.array().items(Joi.string()).optional(),
});

// Create Testimonial (Public - No Auth Required)
exports.createTestimonial = async (req, res) => {
    try {
        const { error, value } = testimonialSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map((e) => e.message),
            });
        }

        const testimonialId = new ObjectId();

        await prisma.$runCommandRaw({
            insert: "testimonials",
            documents: [{
                _id: testimonialId,
                name: value.name,
                email: value.email,
                company: value.company || null,
                position: value.position || null,
                testimonialText: value.testimonialText,
                rating: value.rating,
                photos: value.photos || [],
                isApproved: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }],
        });

        const testimonial = {
            id: testimonialId.toString(),
            name: value.name,
            email: value.email,
            company: value.company || null,
            position: value.position || null,
            testimonialText: value.testimonialText,
            rating: value.rating,
            photos: value.photos || [],
            isApproved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        res.status(201).json({
            success: true,
            message: "Testimonial submitted successfully. Awaiting admin approval.",
            data: testimonial,
        });
    } catch (error) {
        console.error("Error creating testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create testimonial",
            error: error.message,
        });
    }
};

// Get All Approved Testimonials (Public)
exports.getApprovedTestimonials = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const testimonialsResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { isApproved: true },
            sort: { createdAt: -1 },
            skip,
            limit,
        });

        const countResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { isApproved: true },
        });

        const testimonials = testimonialsResult.cursor.firstBatch.map((doc) => ({
            id: doc._id.$oid || doc._id,
            ...doc,
            _id: undefined,
        }));

        const total = countResult.cursor.firstBatch.length;

        res.status(200).json({
            success: true,
            data: testimonials,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching approved testimonials:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch testimonials",
            error: error.message,
        });
    }
};

// Get All Testimonials (Admin Only)
exports.getAllTestimonials = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || "all";

        let filter = {};
        if (status === "approved") filter.isApproved = true;
        if (status === "pending") filter.isApproved = false;

        const testimonialsResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter,
            sort: { createdAt: -1 },
            skip,
            limit,
        });

        const countResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter,
        });

        const testimonials = testimonialsResult.cursor.firstBatch.map((doc) => ({
            id: doc._id.$oid || doc._id,
            ...doc,
            _id: undefined,
        }));

        const total = countResult.cursor.firstBatch.length;

        res.status(200).json({
            success: true,
            data: testimonials,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch testimonials",
            error: error.message,
        });
    }
};

// Get Single Testimonial (Admin Only)
exports.getTestimonialById = async (req, res) => {
    try {
        const { id } = req.params;

        const testimonialResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        if (testimonialResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }

        const testimonial = testimonialResult.cursor.firstBatch[0];

        res.status(200).json({
            success: true,
            data: {
                id: testimonial._id.$oid || testimonial._id,
                ...testimonial,
                _id: undefined,
            },
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID",
            });
        }
        console.error("Error fetching testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch testimonial",
            error: error.message,
        });
    }
};

// Update Testimonial (Admin Only)
exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateSchema = Joi.object({
            name: Joi.string().optional().min(3).max(100),
            email: Joi.string().email().optional(),
            company: Joi.string().optional().max(100).allow(null),
            position: Joi.string().optional().max(100).allow(null),
            testimonialText: Joi.string().optional().min(10).max(5000),
            rating: Joi.number().integer().min(1).max(5).optional(),
            photos: Joi.array().items(Joi.string()).optional(),
            isApproved: Joi.boolean().optional(),
        });

        const { error, value } = updateSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map((e) => e.message),
            });
        }

        // Check if exists
        const existResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        if (existResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }

        await prisma.$runCommandRaw({
            update: "testimonials",
            updates: [{
                q: { _id: new ObjectId(id) },
                u: { $set: { ...value, updatedAt: new Date() } },
                upsert: false,
            }],
        });

        // Fetch updated document
        const updatedResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        const testimonial = updatedResult.cursor.firstBatch[0];

        res.status(200).json({
            success: true,
            message: "Testimonial updated successfully",
            data: {
                id: testimonial._id.$oid || testimonial._id,
                ...testimonial,
                _id: undefined,
            },
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID",
            });
        }
        console.error("Error updating testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update testimonial",
            error: error.message,
        });
    }
};

// Delete Testimonial (Admin Only)
exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteResult = await prisma.$runCommandRaw({
            delete: "testimonials",
            deletes: [{
                q: { _id: new ObjectId(id) },
                limit: 1,
            }],
        });

        if (deleteResult.n === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Testimonial deleted successfully",
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID",
            });
        }
        console.error("Error deleting testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete testimonial",
            error: error.message,
        });
    }
};

// Approve/Reject Testimonial (Admin Only)
exports.approveTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        if (typeof isApproved !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isApproved must be a boolean",
            });
        }

        // Check if exists
        const existResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        if (existResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }

        await prisma.$runCommandRaw({
            update: "testimonials",
            updates: [{
                q: { _id: new ObjectId(id) },
                u: { $set: { isApproved, updatedAt: new Date() } },
                upsert: false,
            }],
        });

        // Fetch updated document
        const updatedResult = await prisma.$runCommandRaw({
            find: "testimonials",
            filter: { _id: new ObjectId(id) },
            limit: 1,
        });

        const testimonial = updatedResult.cursor.firstBatch[0];

        res.status(200).json({
            success: true,
            message: isApproved ? "Testimonial approved" : "Testimonial rejected",
            data: {
                id: testimonial._id.$oid || testimonial._id,
                ...testimonial,
                _id: undefined,
            },
        });
    } catch (error) {
        if (error.message.includes("BsonError")) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID",
            });
        }
        console.error("Error approving testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update testimonial status",
            error: error.message,
        });
    }
};
