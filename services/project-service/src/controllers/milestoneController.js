const prisma = require("../config/prisma");
const { validateCreateMilestone, validateUpdateMilestoneProgress } = require("../utils/validation");

// ========================================
// ADD MILESTONE TO PROJECT
// ========================================
exports.addMilestone = async (req, res) => {
    try {
        const { projectCode } = req.params;
        const { title, description, order, startDate, endDate, notes } = req.body;

        // Validation
        const { error } = validateCreateMilestone(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Check project exists
        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Check if order already exists
        const existingMilestone = project.milestones.find((m) => m.order === parseInt(order));
        if (existingMilestone) {
            return res.status(400).json({
                success: false,
                message: `Milestone dengan urutan ${order} sudah ada`,
            });
        }

        // Create new milestone
        const newMilestone = {
            id: require("crypto").randomUUID(),
            title,
            description,
            order: parseInt(order),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            actualStartDate: null,
            actualEndDate: null,
            progress: 0,
            status: "pending",
            photos: [],
            notes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Update project with new milestone
        const updated = await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: {
                    push: newMilestone,
                },
                activities: {
                    push: {
                        userId: req.user.id.toString(),
                        userName: req.user.name || req.user.email,
                        action: "milestone_added",
                        description: `Milestone "${title}" added to project`,
                        metadata: { milestoneId: newMilestone.id },
                        createdAt: new Date(),
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Milestone berhasil ditambahkan",
            data: newMilestone,
        });
    } catch (err) {
        console.error("Add milestone error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// GET ALL MILESTONES BY PROJECT
// ========================================
exports.getMilestonesByProject = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: {
                projectCode: true,
                projectName: true,
                milestones: true,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Sort milestones by order
        const sortedMilestones = project.milestones.sort((a, b) => a.order - b.order);

        res.status(200).json({
            success: true,
            message: "Milestones berhasil diambil",
            data: {
                projectCode: project.projectCode,
                projectName: project.projectName,
                milestones: sortedMilestones,
            },
        });
    } catch (err) {
        console.error("Get milestones error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// GET MILESTONE BY ID
// ========================================
exports.getMilestoneById = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const milestone = project.milestones.find((m) => m.id === milestoneId);

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Milestone berhasil diambil",
            data: milestone,
        });
    } catch (err) {
        console.error("Get milestone error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// UPDATE MILESTONE PROGRESS
// ========================================
exports.updateMilestoneProgress = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;
        const { progress, status, notes } = req.body;

        // Validation
        const { error } = validateUpdateMilestoneProgress(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Get project
        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Find and update milestone
        const milestoneIndex = project.milestones.findIndex((m) => m.id === milestoneId);

        if (milestoneIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Milestone tidak ditemukan",
            });
        }

        // Update milestone
        project.milestones[milestoneIndex].progress = parseInt(progress);

        if (status) {
            project.milestones[milestoneIndex].status = status;
        }

        if (notes !== undefined) {
            project.milestones[milestoneIndex].notes = notes;
        }

        project.milestones[milestoneIndex].updatedAt = new Date();

        // Update actual dates based on status
        if (status === "in_progress" && !project.milestones[milestoneIndex].actualStartDate) {
            project.milestones[milestoneIndex].actualStartDate = new Date();
        }

        if (status === "completed" || parseInt(progress) === 100) {
            project.milestones[milestoneIndex].status = "completed";
            project.milestones[milestoneIndex].progress = 100;
            project.milestones[milestoneIndex].actualEndDate = new Date();
        }

        // Calculate overall project progress
        const totalProgress = project.milestones.reduce((sum, m) => sum + m.progress, 0);
        const avgProgress = Math.round(totalProgress / project.milestones.length);

        // Update project
        const updated = await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: project.milestones,
                progress: avgProgress,
                activities: {
                    push: {
                        userId: req.user.id.toString(),
                        userName: req.user.name || req.user.email,
                        action: "milestone_progress_updated",
                        description: `Milestone "${project.milestones[milestoneIndex].title}" progress updated to ${progress}%`,
                        metadata: { milestoneId, progress: parseInt(progress), status },
                        createdAt: new Date(),
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: "Progress milestone berhasil diperbarui",
            data: {
                milestone: updated.milestones[milestoneIndex],
                projectProgress: updated.progress,
            },
        });
    } catch (err) {
        console.error("Update milestone progress error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// DELETE MILESTONE
// ========================================
exports.deleteMilestone = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const milestoneIndex = project.milestones.findIndex((m) => m.id === milestoneId);

        if (milestoneIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Milestone tidak ditemukan",
            });
        }

        const deletedMilestone = project.milestones[milestoneIndex];

        // Remove milestone
        project.milestones.splice(milestoneIndex, 1);

        // Recalculate project progress
        const totalProgress = project.milestones.reduce((sum, m) => sum + m.progress, 0);
        const avgProgress = project.milestones.length > 0
            ? Math.round(totalProgress / project.milestones.length)
            : 0;

        // Update project
        await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: project.milestones,
                progress: avgProgress,
                activities: {
                    push: {
                        userId: req.user.id.toString(),
                        userName: req.user.name || req.user.email,
                        action: "milestone_deleted",
                        description: `Milestone "${deletedMilestone.title}" deleted from project`,
                        metadata: { milestoneId },
                        createdAt: new Date(),
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: "Milestone berhasil dihapus",
        });
    } catch (err) {
        console.error("Delete milestone error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};