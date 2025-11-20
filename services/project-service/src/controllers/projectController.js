const prisma = require("../config/prisma");
const { validateCreateProject, validateUpdateProject } = require("../utils/validation");
const { getPaginationParams, getPaginationMeta } = require("../utils/pagination");
const { generateProjectCode } = require("../utils/projectCodeGenerator");
const { logProjectActivity } = require("../services/activityLogger");
const { calculateDuration } = require("../utils/dateHelper");

// ========================================
// CREATE PROJECT
// ========================================
exports.createProject = async (req, res) => {
    try {
        const {
            projectName,
            description,
            projectType,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            budget,
            startDate,
            estimatedEndDate,
            notes,
        } = req.body;

        // Validation
        const { error } = validateCreateProject(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Generate unique project code
        const projectCode = await generateProjectCode();

        // Create project
        const project = await prisma.project.create({
            data: {
                projectCode,
                projectName,
                description,
                projectType,
                customerName,
                customerEmail,
                customerPhone,
                customerAddress,
                budget: budget ? parseFloat(budget) : null,
                startDate: new Date(startDate),
                estimatedEndDate: new Date(estimatedEndDate),
                notes,
                status: "pending",
                progress: 0,
                createdBy: req.user.id.toString(),
                createdByName: req.user.name || req.user.email,
                milestones: [],
                documents: [],
            },
        });

        // Log activity using central logger
        await logProjectActivity(projectCode, {
            userId: req.user.id.toString(),
            userName: req.user.name || req.user.email,
            action: "created",
            description: `Project created by ${req.user.name || req.user.email}`,
        });

        res.status(201).json({
            success: true,
            message: "Project berhasil dibuat",
            data: {
                projectCode: project.projectCode,
                projectName: project.projectName,
                customerName: project.customerName,
                startDate: project.startDate,
                estimatedEndDate: project.estimatedEndDate,
                trackingUrl: `${req.protocol}://${req.get("host")}/api/projects/track/${project.projectCode}`,
            },
        });
    } catch (err) {
        console.error("Create project error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }
};

// ========================================
// GET ALL PROJECTS (Admin)
// ========================================
exports.getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { search, status, projectType, sortBy = "createdAt", order = "desc" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};

        if (search) {
            where.OR = [
                { projectCode: { contains: search, mode: "insensitive" } },
                { projectName: { contains: search, mode: "insensitive" } },
                { customerName: { contains: search, mode: "insensitive" } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (projectType) {
            where.projectType = projectType;
        }

        // Get projects
        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: order },
                select: {
                    id: true,
                    projectCode: true,
                    projectName: true,
                    customerName: true,
                    customerEmail: true,
                    customerPhone: true,
                    projectType: true,
                    status: true,
                    progress: true,
                    budget: true,
                    actualCost: true,
                    startDate: true,
                    estimatedEndDate: true,
                    actualEndDate: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.project.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            message: "Projects berhasil diambil",
            data: projects,
            pagination: getPaginationMeta(total, parseInt(page), parseInt(limit)),
        });
    } catch (err) {
        console.error("Get projects error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// GET PROJECT BY CODE (Admin)
// ========================================
exports.getProjectByCode = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Calculate additional info
        const duration = calculateDuration(project.startDate, project.estimatedEndDate);
        const daysRemaining =
            new Date(project.estimatedEndDate) - new Date() > 0
                ? Math.ceil((new Date(project.estimatedEndDate) - new Date()) / (1000 * 60 * 60 * 24))
                : 0;

        res.status(200).json({
            success: true,
            message: "Project berhasil diambil",
            data: {
                ...project,
                duration: `${duration} hari`,
                daysRemaining,
                isOverdue: daysRemaining === 0 && project.status !== "completed",
            },
        });
    } catch (err) {
        console.error("Get project error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// UPDATE PROJECT
// ========================================
exports.updateProject = async (req, res) => {
    try {
        const { projectCode } = req.params;
        const updateData = req.body;

        // Validation
        const { error } = validateUpdateProject(updateData);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Check exists
        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Prepare update data
        const data = {};

        if (updateData.projectName) data.projectName = updateData.projectName;
        if (updateData.description !== undefined) data.description = updateData.description;
        if (updateData.projectType) data.projectType = updateData.projectType;
        if (updateData.customerName) data.customerName = updateData.customerName;
        if (updateData.customerEmail) data.customerEmail = updateData.customerEmail;
        if (updateData.customerPhone) data.customerPhone = updateData.customerPhone;
        if (updateData.customerAddress !== undefined)
            data.customerAddress = updateData.customerAddress;
        if (updateData.budget !== undefined) data.budget = parseFloat(updateData.budget);
        if (updateData.startDate) data.startDate = new Date(updateData.startDate);
        if (updateData.estimatedEndDate)
            data.estimatedEndDate = new Date(updateData.estimatedEndDate);
        if (updateData.status) data.status = updateData.status;
        if (updateData.notes !== undefined) data.notes = updateData.notes;

        // Update
        const updated = await prisma.project.update({
            where: { projectCode },
            data,
        });

        // Log update activity
        await logProjectActivity(projectCode, {
            userId: req.user.id.toString(),
            userName: req.user.name || req.user.email,
            action: "updated",
            description: `Project updated by ${req.user.name || req.user.email}`,
            metadata: { updatedFields: Object.keys(data) },
        });

        res.status(200).json({
            success: true,
            message: "Project berhasil diperbarui",
            data: updated,
        });
    } catch (err) {
        console.error("Update project error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// DELETE PROJECT
// ========================================
exports.deleteProject = async (req, res) => {
    try {
        const { projectCode } = req.params;

        // Check exists
        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Delete
        await prisma.project.delete({
            where: { projectCode },
        });

        res.status(200).json({
            success: true,
            message: "Project berhasil dihapus",
        });
    } catch (err) {
        console.error("Delete project error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// UPDATE PROJECT STATUS
// ========================================
exports.updateProjectStatus = async (req, res) => {
    try {
        const { projectCode } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "in_progress", "on_hold", "completed", "cancelled"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status harus salah satu dari: ${validStatuses.join(", ")}`,
            });
        }

        // Update
        const updated = await prisma.project.update({
            where: { projectCode },
            data: {
                status,
                actualEndDate: status === "completed" ? new Date() : null,
            },
        });

        // Log status change activity
        await logProjectActivity(projectCode, {
            userId: req.user.id.toString(),
            userName: req.user.name || req.user.email,
            action: "status_changed",
            description: `Project status changed to ${status}`,
            metadata: { newStatus: status },
        });

        res.status(200).json({
            success: true,
            message: `Status project berhasil diubah menjadi ${status}`,
            data: updated,
        });
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};