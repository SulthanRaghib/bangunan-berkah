const prisma = require("../config/prisma");

// ========================================
// GET DASHBOARD STATS
// ========================================
exports.getDashboardStats = async (req, res) => {
    try {
        // Get project counts using aggregation
        const countsResult = await prisma.$runCommandRaw({
            aggregate: "projects",
            pipeline: [
                {
                    $facet: {
                        totalProjects: [{ $count: "count" }],
                        activeProjects: [{ $match: { status: "in_progress" } }, { $count: "count" }],
                        completedProjects: [{ $match: { status: "completed" } }, { $count: "count" }],
                        pendingProjects: [{ $match: { status: "pending" } }, { $count: "count" }],
                        konstruksiProjects: [{ $match: { projectType: "konstruksi" } }, { $count: "count" }],
                        furnitureProjects: [{ $match: { projectType: "furniture" } }, { $count: "count" }]
                    }
                }
            ],
            cursor: {}
        });

        const counts = countsResult.cursor.firstBatch[0];
        const totalProjects = counts.totalProjects[0]?.count || 0;
        const activeProjects = counts.activeProjects[0]?.count || 0;
        const completedProjects = counts.completedProjects[0]?.count || 0;
        const pendingProjects = counts.pendingProjects[0]?.count || 0;
        const konstruksiProjects = counts.konstruksiProjects[0]?.count || 0;
        const furnitureProjects = counts.furnitureProjects[0]?.count || 0;

        // Get recent projects
        const recentProjectsResult = await prisma.$runCommandRaw({
            find: "projects",
            sort: { createdAt: -1 },
            limit: 5,
            projection: {
                projectCode: 1,
                projectName: 1,
                customerName: 1,
                projectType: 1,
                status: 1,
                progress: 1,
                createdAt: 1,
            },
        });

        const recentProjects = recentProjectsResult.cursor.firstBatch.map(project => ({
            id: project._id.$oid || project._id,
            projectCode: project.projectCode,
            projectName: project.projectName,
            customerName: project.customerName,
            projectType: project.projectType,
            status: project.status,
            progress: project.progress,
            createdAt: project.createdAt?.$date ? new Date(project.createdAt.$date) : new Date(project.createdAt),
        }));

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

        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
            projection: {
                projectCode: 1,
                projectName: 1,
                activities: 1,
            },
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const project = projectResult.cursor.firstBatch[0];

        // Sort activities by date (newest first)
        const sortedActivities = (project.activities || []).sort(
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