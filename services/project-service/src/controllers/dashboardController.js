const prisma = require("../config/prisma");

// ========================================
// GET DASHBOARD STATS
// ========================================
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalProjects,
            activeProjects,
            completedProjects,
            pendingProjects,
            konstruksiProjects,
            furnitureProjects,
        ] = await Promise.all([
            prisma.project.count(),
            prisma.project.count({ where: { status: "in_progress" } }),
            prisma.project.count({ where: { status: "completed" } }),
            prisma.project.count({ where: { status: "pending" } }),
            prisma.project.count({ where: { projectType: "konstruksi" } }),
            prisma.project.count({ where: { projectType: "furniture" } }),
        ]);

        // Get recent projects
        const recentProjects = await prisma.project.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                projectCode: true,
                projectName: true,
                customerName: true,
                projectType: true,
                status: true,
                progress: true,
                createdAt: true,
            },
        });

        // Get projects by status
        const projectsByStatus = {
            pending: pendingProjects,
            in_progress: activeProjects,
            completed: completedProjects,
        };

        // Get projects by type
        const projectsByType = {
            konstruksi: konstruksiProjects,
            furniture: furnitureProjects,
        };

        res.status(200).json({
            success: true,
            message: "Dashboard stats berhasil diambil",
            data: {
                overview: {
                    totalProjects,
                    activeProjects,
                    completedProjects,
                    pendingProjects,
                },
                projectsByStatus,
                projectsByType,
                recentProjects,
            },
        });
    } catch (err) {
        console.error("Get dashboard stats error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// GET PROJECT ACTIVITIES
// ========================================
exports.getProjectActivities = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: {
                projectCode: true,
                projectName: true,
                activities: true,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Sort activities by date (newest first)
        const sortedActivities = project.activities.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.status(200).json({
            success: true,
            message: "Activity log berhasil diambil",
            data: {
                projectCode: project.projectCode,
                projectName: project.projectName,
                activities: sortedActivities,
            },
        });
    } catch (err) {
        console.error("Get activities error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};