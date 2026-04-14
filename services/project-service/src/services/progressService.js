/**
 * Progress Service
 * Handles all progress tracking business logic
 */

const projectRepository = require("../repositories/projectRepository");
const { AppError, NotFoundError } = require("../utils/errors");

class ProgressService {
    /**
     * Get milestone progress
     */
    async getMilestoneProgress(projectCode, milestoneId) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestone = project.milestones?.find(
                (m) => m.id === milestoneId
            );
            if (!milestone) {
                throw new NotFoundError("Milestone");
            }

            return {
                milestoneId: milestone.id,
                title: milestone.title,
                progress: milestone.progress,
                status: milestone.status,
                targetDate: milestone.targetDate,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get detailed progress report
     */
    async getProgressReport(projectCode) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestones = project.milestones || [];
            const completedMilestones = milestones.filter(
                (m) => m.status === "completed"
            ).length;

            return {
                projectCode: project.projectCode,
                projectName: project.projectName,
                status: project.status,
                overallProgress: project.progress,
                estimatedCompletion: project.estimatedEndDate,
                actualCompletion: project.actualEndDate,
                milestones: {
                    total: milestones.length,
                    completed: completedMilestones,
                    inProgress: milestones.filter(
                        (m) => m.status === "in_progress"
                    ).length,
                    pending: milestones.filter(
                        (m) => m.status === "pending"
                    ).length,
                    onHold: milestones.filter(
                        (m) => m.status === "on_hold"
                    ).length,
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
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }
}

module.exports = new ProgressService();
