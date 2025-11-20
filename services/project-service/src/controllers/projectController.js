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

        // Create project using raw MongoDB command to avoid transaction requirement
        const project = await prisma.$runCommandRaw({
            insert: 'projects',
            documents: [{
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
                activities: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }]
        });

        // Log activity using central logger (commented out for standalone MongoDB)
        // await logProjectActivity(projectCode, {
        //     userId: req.user.id.toString(),
        //     userName: req.user.name || req.user.email,
        //     action: "created",
        //     description: `Project created by ${req.user.name || req.user.email}`,
        // });

        res.status(201).json({
            success: true,
            message: "Project berhasil dibuat",
            data: {
                projectCode: projectCode,
                projectName: projectName,
                customerName: customerName,
                startDate: new Date(startDate),
                estimatedEndDate: new Date(estimatedEndDate),
                trackingUrl: `${req.protocol}://${req.get("host")}/api/projects/track/${projectCode}`,
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

        // Build MongoDB filter
        const filter = {};

        if (search) {
            filter.$or = [
                { projectCode: { $regex: search, $options: "i" } },
                { projectName: { $regex: search, $options: "i" } },
                { customerName: { $regex: search, $options: "i" } },
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (projectType) {
            filter.projectType = projectType;
        }

        // Build sort order
        const sort = {};
        sort[sortBy] = order === "desc" ? -1 : 1;

        // Get projects using raw MongoDB commands
        const [projectsResult, countResult] = await Promise.all([
            prisma.$runCommandRaw({
                find: "projects",
                filter,
                sort,
                skip,
                limit: parseInt(limit),
                projection: {
                    _id: 1,
                    projectCode: 1,
                    projectName: 1,
                    customerName: 1,
                    customerEmail: 1,
                    customerPhone: 1,
                    projectType: 1,
                    status: 1,
                    progress: 1,
                    budget: 1,
                    actualCost: 1,
                    startDate: 1,
                    estimatedEndDate: 1,
                    actualEndDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            }),
            prisma.$runCommandRaw({
                count: "projects",
                query: filter
            }),
        ]);

        const projects = projectsResult.cursor.firstBatch.map(project => ({
            id: project._id.$oid || project._id,
            projectCode: project.projectCode,
            projectName: project.projectName,
            customerName: project.customerName,
            customerEmail: project.customerEmail,
            customerPhone: project.customerPhone,
            projectType: project.projectType,
            status: project.status,
            progress: project.progress,
            budget: project.budget,
            actualCost: project.actualCost,
            startDate: project.startDate?.$date ? new Date(project.startDate.$date) : new Date(project.startDate),
            estimatedEndDate: project.estimatedEndDate?.$date ? new Date(project.estimatedEndDate.$date) : new Date(project.estimatedEndDate),
            actualEndDate: project.actualEndDate?.$date ? new Date(project.actualEndDate.$date) : (project.actualEndDate ? new Date(project.actualEndDate) : null),
            createdAt: project.createdAt?.$date ? new Date(project.createdAt.$date) : new Date(project.createdAt),
            updatedAt: project.updatedAt?.$date ? new Date(project.updatedAt.$date) : new Date(project.updatedAt),
        }));

        const total = countResult.n;

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

        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const project = projectResult.cursor.firstBatch[0];

        // Convert MongoDB date objects to JavaScript dates
        const startDate = project.startDate?.$date ? new Date(project.startDate.$date) : new Date(project.startDate);
        const estimatedEndDate = project.estimatedEndDate?.$date ? new Date(project.estimatedEndDate.$date) : new Date(project.estimatedEndDate);
        const actualEndDate = project.actualEndDate?.$date ? new Date(project.actualEndDate.$date) : (project.actualEndDate ? new Date(project.actualEndDate) : null);
        const createdAt = project.createdAt?.$date ? new Date(project.createdAt.$date) : new Date(project.createdAt);
        const updatedAt = project.updatedAt?.$date ? new Date(project.updatedAt.$date) : new Date(project.updatedAt);

        // Calculate additional info
        const duration = calculateDuration(startDate, estimatedEndDate);
        const daysRemaining =
            estimatedEndDate - new Date() > 0
                ? Math.ceil((estimatedEndDate - new Date()) / (1000 * 60 * 60 * 24))
                : 0;

        res.status(200).json({
            success: true,
            message: "Project berhasil diambil",
            data: {
                id: project._id.$oid || project._id,
                projectCode: project.projectCode,
                projectName: project.projectName,
                description: project.description,
                projectType: project.projectType,
                customerName: project.customerName,
                customerEmail: project.customerEmail,
                customerPhone: project.customerPhone,
                customerAddress: project.customerAddress,
                budget: project.budget,
                actualCost: project.actualCost,
                startDate: startDate,
                estimatedEndDate: estimatedEndDate,
                actualEndDate: actualEndDate,
                status: project.status,
                progress: project.progress,
                notes: project.notes,
                createdBy: project.createdBy,
                createdByName: project.createdByName,
                milestones: project.milestones,
                documents: project.documents,
                activities: project.activities,
                createdAt: createdAt,
                updatedAt: updatedAt,
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

        // Update using raw MongoDB command
        data.updatedAt = new Date();
        await prisma.$runCommandRaw({
            update: 'projects',
            updates: [{
                q: { projectCode },
                u: { $set: data }
            }]
        });

        // Get updated project for response
        const updatedResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1
        });
        const updated = updatedResult.cursor.firstBatch[0];

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
        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Delete
        await prisma.$runCommandRaw({
            delete: "projects",
            deletes: [{
                q: { projectCode },
                limit: 1
            }]
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

        // Update using raw MongoDB command
        const updateData = {
            status,
            actualEndDate: status === "completed" ? new Date() : null,
            updatedAt: new Date()
        };

        await prisma.$runCommandRaw({
            update: 'projects',
            updates: [{
                q: { projectCode },
                u: { $set: updateData }
            }]
        });

        // Get updated project for response
        const updatedResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1
        });
        const updated = updatedResult.cursor.firstBatch[0];

        // Clean ObjectId and date formats
        const startDate = updated.startDate?.$date ? new Date(updated.startDate.$date) : new Date(updated.startDate);
        const estimatedEndDate = updated.estimatedEndDate?.$date ? new Date(updated.estimatedEndDate.$date) : new Date(updated.estimatedEndDate);
        const actualEndDate = updated.actualEndDate?.$date ? new Date(updated.actualEndDate.$date) : (updated.actualEndDate ? new Date(updated.actualEndDate) : null);
        const createdAt = updated.createdAt?.$date ? new Date(updated.createdAt.$date) : new Date(updated.createdAt);
        const updatedAt = updated.updatedAt?.$date ? new Date(updated.updatedAt.$date) : new Date(updated.updatedAt);

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
            data: {
                id: updated._id?.$oid || updated._id,
                projectCode: updated.projectCode,
                projectName: updated.projectName,
                projectType: updated.projectType,
                customerName: updated.customerName,
                customerEmail: updated.customerEmail,
                customerPhone: updated.customerPhone,
                customerAddress: updated.customerAddress,
                budget: updated.budget,
                startDate: startDate.toISOString(),
                estimatedEndDate: estimatedEndDate.toISOString(),
                actualEndDate: actualEndDate ? actualEndDate.toISOString() : null,
                status: updated.status,
                progress: updated.progress,
                createdBy: updated.createdBy,
                createdByName: updated.createdByName,
                milestones: updated.milestones || [],
                documents: updated.documents || [],
                activities: updated.activities || [],
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
            },
        });
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};