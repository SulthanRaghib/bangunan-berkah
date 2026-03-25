/**
 * Tracking Service
 * Handles project tracking and reporting
 */

const projectRepository = require("../repositories/projectRepository");
const { AppError, NotFoundError } = require("../utils/errors");

class TrackingService {
    /**
     * Get project tracking data
     */
    async getProjectTracking(projectCode) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestones = project.milestones || [];
            const documents = project.documents || [];

            return {
                projectCode: project.projectCode,
                projectName: project.projectName,
                customerName: project.customerName,
                projectType: project.projectType,
                status: project.status,
                progress: project.progress,
                startDate: project.startDate,
                estimatedEndDate: project.estimatedEndDate,
                actualEndDate: project.actualEndDate,
                budget: project.budget,
                actualCost: project.actualCost,
                milestones: milestones.map((m) => ({
                    id: m.id,
                    title: m.title,
                    progress: m.progress,
                    status: m.status,
                    targetDate: m.targetDate,
                    actualCompletionDate: m.actualCompletionDate,
                })),
                documents: documents.length,
                documentFiles: documents.map((d) => ({
                    id: d.id,
                    name: d.name,
                    type: d.type,
                    uploadedAt: d.uploadedAt,
                })),
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get activity log
     */
    async getActivityLog(projectCode, options = {}) {
        try {
            const { limit = 50, offset = 0 } = options;

            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const activities = project.activities || [];
            const sortedActivities = activities
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(offset, offset + limit);

            return {
                projectCode: project.projectCode,
                totalActivities: activities.length,
                activities: sortedActivities.map((a) => ({
                    id: a.id,
                    action: a.action,
                    description: a.description,
                    userName: a.userName,
                    userId: a.userId,
                    metadata: a.metadata || {},
                    createdAt: a.createdAt,
                })),
                pagination: {
                    offset,
                    limit,
                    total: activities.length,
                    hasMore: offset + limit < activities.length,
                },
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get milestone timeline
     */
    async getMilestoneTimeline(projectCode) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestones = (project.milestones || [])
                .sort((a, b) => a.targetDate - b.targetDate)
                .map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    targetDate: m.targetDate,
                    actualCompletionDate: m.actualCompletionDate,
                    status: m.status,
                    progress: m.progress,
                    daysStatus:
                        m.status === "completed"
                            ? `Completed on ${m.actualCompletionDate}`
                            : m.targetDate < new Date()
                                ? "Overdue"
                                : `Due in ${Math.ceil((m.targetDate - new Date()) / (1000 * 60 * 60 * 24))} days`,
                }));

            return {
                projectCode: project.projectCode,
                projectName: project.projectName,
                startDate: project.startDate,
                estimatedEndDate: project.estimatedEndDate,
                milestones,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }
}

module.exports = new TrackingService();
