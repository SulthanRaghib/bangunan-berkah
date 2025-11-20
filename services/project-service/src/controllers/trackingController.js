const prisma = require("../config/prisma");
const { getDaysRemaining, calculateDuration } = require("../utils/dateHelper");

// ========================================
// TRACK PROJECT (PUBLIC - Customer)
// ========================================
exports.trackProject = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: {
                projectCode: true,
                projectName: true,
                description: true,
                projectType: true,
                customerName: true,
                status: true,
                progress: true,
                startDate: true,
                estimatedEndDate: true,
                actualEndDate: true,
                milestones: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        order: true,
                        startDate: true,
                        endDate: true,
                        actualStartDate: true,
                        actualEndDate: true,
                        progress: true,
                        status: true,
                        photos: {
                            select: {
                                id: true,
                                url: true,
                                caption: true,
                                uploadedAt: true,
                            },
                        },
                        notes: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan. Pastikan kode project benar.",
            });
        }

        // Calculate additional info
        const duration = calculateDuration(project.startDate, project.estimatedEndDate);
        const daysRemaining = getDaysRemaining(project.estimatedEndDate);
        const isOverdue = daysRemaining === 0 && project.status !== "completed";

        // Sort milestones by order
        const sortedMilestones = project.milestones
            .sort((a, b) => a.order - b.order)
            .map((milestone) => ({
                ...milestone,
                photos: milestone.photos.sort(
                    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
                ),
            }));

        // Count completed milestones
        const completedMilestones = project.milestones.filter((m) => m.status === "completed").length;
        const totalMilestones = project.milestones.length;

        res.status(200).json({
            success: true,
            message: "Data project berhasil diambil",
            data: {
                projectInfo: {
                    projectCode: project.projectCode,
                    projectName: project.projectName,
                    description: project.description,
                    projectType: project.projectType,
                    customerName: project.customerName,
                    status: project.status,
                    progress: project.progress,
                    startDate: project.startDate,
                    estimatedEndDate: project.estimatedEndDate,
                    actualEndDate: project.actualEndDate,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                },
                timeline: {
                    duration: `${duration} hari`,
                    daysRemaining,
                    isOverdue,
                    completedMilestones,
                    totalMilestones,
                    milestoneProgress: `${completedMilestones}/${totalMilestones}`,
                },
                milestones: sortedMilestones,
            },
        });
    } catch (err) {
        console.error("Track project error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// GET PROJECT SUMMARY (PUBLIC)
// ========================================
exports.getProjectSummary = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: {
                projectCode: true,
                projectName: true,
                projectType: true,
                status: true,
                progress: true,
                startDate: true,
                estimatedEndDate: true,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (err) {
        console.error("Get summary error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};