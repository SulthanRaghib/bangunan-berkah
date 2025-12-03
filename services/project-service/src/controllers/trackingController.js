const prisma = require("../config/prisma");
const { getDaysRemaining, calculateDuration } = require("../utils/dateHelper");

// ========================================
// TRACK PROJECT (PUBLIC - Customer)
// ========================================
exports.trackProject = async (req, res) => {
    try {
        const { projectCode } = req.params;

        // Use raw MongoDB command to avoid date conversion issues
        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            projection: {
                projectCode: 1,
                projectName: 1,
                description: 1,
                projectType: 1,
                customerName: 1,
                status: 1,
                progress: 1,
                startDate: 1,
                estimatedEndDate: 1,
                actualEndDate: 1,
                reports: 1,
                createdAt: 1,
                updatedAt: 1,
            },
            limit: 1
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan. Pastikan kode project benar.",
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
        const daysRemaining = getDaysRemaining(estimatedEndDate);
        const isOverdue = daysRemaining === 0 && project.status !== "completed";

        // Sort reports by weekNumber (descending - newest first)
        const sortedReports = (project.reports || [])
            .sort((a, b) => b.weekNumber - a.weekNumber)
            .map((report) => ({
                weekNumber: report.weekNumber,
                progress: report.progress,
                description: report.description,
                photos: report.photos || [],
                createdAt: report.createdAt?.$date ? new Date(report.createdAt.$date) : new Date(report.createdAt),
            }));

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
                    startDate: startDate,
                    estimatedEndDate: estimatedEndDate,
                    actualEndDate: actualEndDate,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                },
                timeline: {
                    duration: `${duration} hari`,
                    daysRemaining,
                    isOverdue,
                },
                reports: sortedReports,
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

        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
            projection: {
                projectCode: 1,
                projectName: 1,
                projectType: 1,
                status: 1,
                progress: 1,
                startDate: 1,
                estimatedEndDate: 1,
            },
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const project = projectResult.cursor.firstBatch[0];

        // Clean ObjectId and date formats
        const startDate = project.startDate?.$date ? new Date(project.startDate.$date) : new Date(project.startDate);
        const estimatedEndDate = project.estimatedEndDate?.$date ? new Date(project.estimatedEndDate.$date) : new Date(project.estimatedEndDate);

        res.status(200).json({
            success: true,
            data: {
                id: project._id?.$oid || project._id,
                projectCode: project.projectCode,
                projectName: project.projectName,
                projectType: project.projectType,
                status: project.status,
                progress: project.progress,
                startDate: startDate.toISOString(),
                estimatedEndDate: estimatedEndDate.toISOString(),
            },
        });
    } catch (err) {
        console.error("Get summary error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};