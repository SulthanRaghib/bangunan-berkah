/**
 * Dashboard Service
 * Handles dashboard data aggregation
 */

const projectRepository = require("../repositories/projectRepository");
const { AppError, NotFoundError } = require("../utils/errors");

class DashboardService {
    /**
     * Get global dashboard stats
     */
    async getDashboardStats() {
        try {
            const result = await projectRepository.getAll(
                {},
                { page: 1, limit: 1000, sortBy: "createdAt", order: "desc" }
            );

            const projects = result.data || [];
            const totalProjects = projects.length;
            const activeProjects = projects.filter(
                (project) => project.status && project.status !== "completed"
            ).length;
            const completedProjects = projects.filter(
                (project) => project.status === "completed"
            ).length;
            const totalBudget = projects.reduce(
                (sum, project) => sum + (Number(project.budget) || 0),
                0
            );

            return {
                totalProjects,
                activeProjects,
                completedProjects,
                totalBudget,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get project activities for dashboard
     */
    async getProjectActivities(projectCode) {
        try {
            const project = await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const activities = (project.activities || [])
                .slice(-20)
                .reverse()
                .map((activity) => ({
                    id: activity.id,
                    action: activity.action,
                    description: activity.description,
                    userName: activity.userName,
                    userId: activity.userId,
                    metadata: activity.metadata || {},
                    createdAt: activity.createdAt,
                }));

            return {
                projectCode: project.projectCode,
                projectName: project.projectName,
                activities,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get project dashboard
     */
    async getProjectDashboard(projectCode) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestones = project.milestones || [];
            const activities = project.activities || [];

            return {
                projectCode: project.projectCode,
                projectName: project.projectName,
                description: project.projectDescription,
                status: project.status,
                progress: project.progress,
                budget: {
                    total: project.budget,
                    spent: project.actualCost || 0,
                    remaining: (project.budget || 0) - (project.actualCost || 0),
                    percentageUsed: project.budget
                        ? Math.round(
                            ((project.actualCost || 0) /
                                project.budget) *
                            100
                        )
                        : 0,
                },
                timeline: {
                    startDate: project.startDate,
                    estimatedEndDate: project.estimatedEndDate,
                    actualEndDate: project.actualEndDate,
                    daysRemaining: Math.max(
                        0,
                        Math.ceil(
                            (project.estimatedEndDate - new Date()) /
                            (1000 * 60 * 60 * 24)
                        )
                    ),
                },
                milestones: {
                    total: milestones.length,
                    completed: milestones.filter(
                        (m) => m.status === "completed"
                    ).length,
                    list: milestones
                        .slice(-5)
                        .reverse()
                        .map((m) => ({
                            id: m.id,
                            title: m.title,
                            progress: m.progress,
                            status: m.status,
                            targetDate: m.targetDate,
                        })),
                },
                team: {
                    createdBy: project.createdByName,
                    totalDocuments: (project.documents || []).length,
                },
                recentActivities: activities
                    .slice(-10)
                    .reverse()
                    .map((a) => ({
                        id: a.id,
                        action: a.action,
                        description: a.description,
                        userName: a.userName,
                        createdAt: a.createdAt,
                    })),
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get summary stats
     */
    async getSummaryStats(projectCode) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestones = project.milestones || [];
            const documents = project.documents || [];
            const activities = project.activities || [];

            return {
                projectCode: project.projectCode,
                projectName: project.projectName,
                status: project.status,
                stats: {
                    totalMilestones: milestones.length,
                    completedMilestones: milestones.filter(
                        (m) => m.status === "completed"
                    ).length,
                    progressPercentage: project.progress,
                    totalDocuments: documents.length,
                    totalActivities: activities.length,
                    budgetUtilization: project.budget
                        ? Math.round(
                            ((project.actualCost || 0) /
                                project.budget) *
                            100
                        )
                        : 0,
                },
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }
}

module.exports = new DashboardService();
