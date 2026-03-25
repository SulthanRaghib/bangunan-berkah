/**
 * Milestone Service
 * Handles all milestone business logic
 */

const { v4: uuidv4 } = require("uuid");
const projectRepository = require("../repositories/projectRepository");
const { ValidationError, AppError, NotFoundError } = require("../utils/errors");

class MilestoneService {
    /**
     * Calculate project progress from milestones
     */
    calculateProjectProgress(milestones) {
        if (!milestones || milestones.length === 0) return 0;

        const totalProgress = milestones.reduce(
            (sum, m) => sum + (m.progress || 0),
            0
        );
        return Math.round(totalProgress / milestones.length);
    }

    /**
     * Add milestone to project
     */
    async addMilestone(projectCode, milestoneData) {
        try {
            // Validate progress
            if (
                milestoneData.progress < 0 ||
                milestoneData.progress > 100
            ) {
                throw new ValidationError("Progress harus antara 0 dan 100");
            }

            // Get project to verify existence
            const project = await projectRepository.findByCodeOptional(
                projectCode
            );
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestone = {
                id: uuidv4(),
                title: milestoneData.title || milestoneData.name,
                description:
                    milestoneData.description ||
                    milestoneData.detail ||
                    "",
                targetDate: new Date(milestoneData.targetDate),
                status: milestoneData.status || "PENDING",
                progress: parseInt(milestoneData.progress) || 0,
                actualCompletionDate: milestoneData.actualCompletionDate
                    ? new Date(milestoneData.actualCompletionDate)
                    : null,
                photos: milestoneData.photos || [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Add to project
            await projectRepository.addMilestone(projectCode, milestone);

            // Recalculate project progress
            const updatedProject =
                await projectRepository.findByCodeOptional(projectCode);
            const newProgress = this.calculateProjectProgress(
                updatedProject.milestones
            );

            // Update project progress if changed
            if (newProgress !== project.progress) {
                await projectRepository.updateProject(projectCode, {
                    progress: newProgress,
                });
            }

            return {
                milestone,
                projectProgress: newProgress,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Update milestone
     */
    async updateMilestone(
        projectCode,
        milestoneId,
        milestoneData
    ) {
        try {
            // Validate progress
            if (
                milestoneData.progress !== undefined &&
                (milestoneData.progress < 0 || milestoneData.progress > 100)
            ) {
                throw new ValidationError("Progress harus antara 0 dan 100");
            }

            // Get project
            const project = await projectRepository.findByCodeOptional(
                projectCode
            );
            if (!project) {
                throw new NotFoundError("Project");
            }

            // Find milestone
            const milestone = project.milestones?.find(
                (m) => m.id === milestoneId
            );
            if (!milestone) {
                throw new NotFoundError("Milestone");
            }

            // Prepare update data
            const updatedMilestoneData = {
                title:
                    milestoneData.title ||
                    milestoneData.name ||
                    milestone.title,
                description:
                    milestoneData.description !== undefined
                        ? milestoneData.description
                        : milestone.description,
                targetDate: milestoneData.targetDate
                    ? new Date(milestoneData.targetDate)
                    : milestone.targetDate,
                status: milestoneData.status || milestone.status,
                progress:
                    milestoneData.progress !== undefined
                        ? parseInt(milestoneData.progress)
                        : milestone.progress,
                actualCompletionDate: milestoneData.actualCompletionDate
                    ? new Date(milestoneData.actualCompletionDate)
                    : milestone.actualCompletionDate,
            };

            // Update milestone
            await projectRepository.updateMilestone(
                projectCode,
                milestoneId,
                updatedMilestoneData
            );

            // Recalculate project progress
            const updatedProject =
                await projectRepository.findByCodeOptional(projectCode);
            const newProgress = this.calculateProjectProgress(
                updatedProject.milestones
            );

            // Update project progress if changed
            if (newProgress !== project.progress) {
                await projectRepository.updateProject(projectCode, {
                    progress: newProgress,
                });
            }

            return {
                milestone: { id: milestoneId, ...updatedMilestoneData },
                projectProgress: newProgress,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Delete milestone
     */
    async deleteMilestone(projectCode, milestoneId) {
        try {
            // Get project
            const project = await projectRepository.findByCodeOptional(
                projectCode
            );
            if (!project) {
                throw new NotFoundError("Project");
            }

            // Find milestone to verify it exists
            const milestone = project.milestones?.find(
                (m) => m.id === milestoneId
            );
            if (!milestone) {
                throw new NotFoundError("Milestone");
            }

            // Delete milestone
            await projectRepository.deleteMilestone(projectCode, milestoneId);

            // Recalculate project progress
            const updatedProject =
                await projectRepository.findByCodeOptional(projectCode);
            const newProgress = this.calculateProjectProgress(
                updatedProject.milestones
            );

            // Update project progress if changed
            if (newProgress !== project.progress) {
                await projectRepository.updateProject(projectCode, {
                    progress: newProgress,
                });
            }

            return {
                projectProgress: newProgress,
            };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get milestone by ID
     */
    async getMilestone(projectCode, milestoneId) {
        try {
            const project = await projectRepository.findByCodeOptional(
                projectCode
            );
            if (!project) {
                throw new NotFoundError("Project");
            }

            const milestone = project.milestones?.find(
                (m) => m.id === milestoneId
            );
            if (!milestone) {
                throw new NotFoundError("Milestone");
            }

            return milestone;
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get all milestones for project
     */
    async getMilestones(projectCode) {
        try {
            const project = await projectRepository.findByCodeOptional(
                projectCode
            );
            if (!project) {
                throw new NotFoundError("Project");
            }

            return (project.milestones || []).sort(
                (a, b) => a.targetDate - b.targetDate
            );
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }
}

module.exports = new MilestoneService();
