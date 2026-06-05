/**
 * Milestone Service
 * Handles all milestone business logic
 * NOTE: Milestone progress is independent from project progress.
 *       Project progress is updated directly via the progress endpoint.
 */

const { v4: uuidv4 } = require("uuid");
const projectRepository = require("../repositories/projectRepository");
const { ValidationError, AppError, NotFoundError } = require("../utils/errors");
const { normalizeMilestoneStatus, getMilestoneProgressFromStatus } = require("../utils/milestoneHelper");

class MilestoneService {
    /**
     * Add milestone to project
     */
    async addMilestone(projectCode, milestoneData) {
        try {
            // Get project to verify existence
            const project = await projectRepository.findByCodeOptional(
                projectCode
            );
            if (!project) {
                throw new NotFoundError("Project");
            }

            const status = normalizeMilestoneStatus(milestoneData.status || "menunggu");
            const progress = getMilestoneProgressFromStatus(status);

            const milestone = {
                id: uuidv4(),
                title: milestoneData.title || milestoneData.name,
                description:
                    milestoneData.description ||
                    milestoneData.detail ||
                    "",
                targetDate: new Date(milestoneData.targetDate),
                status,
                progress,
                actualCompletionDate: status === "selesai"
                    ? (milestoneData.actualCompletionDate ? new Date(milestoneData.actualCompletionDate) : new Date())
                    : null,
                photos: milestoneData.photos || [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Add to project
            await projectRepository.addMilestone(projectCode, milestone);

            return {
                milestone,
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

            const status = normalizeMilestoneStatus(milestoneData.status || milestone.status);
            const progress = getMilestoneProgressFromStatus(status);

            let actualCompletionDate = null;
            if (status === "selesai") {
                if (normalizeMilestoneStatus(milestone.status) !== "selesai") {
                    actualCompletionDate = milestoneData.actualCompletionDate
                        ? new Date(milestoneData.actualCompletionDate)
                        : new Date();
                } else {
                    actualCompletionDate = milestoneData.actualCompletionDate
                        ? new Date(milestoneData.actualCompletionDate)
                        : milestone.actualCompletionDate;
                }
            }

            // Merge photos if new photos are uploaded
            const photos = milestoneData.photos !== undefined
                ? [...(milestone.photos || []), ...milestoneData.photos]
                : (milestone.photos || []);

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
                status,
                progress,
                actualCompletionDate,
                photos,
            };

            // Update milestone
            await projectRepository.updateMilestone(
                projectCode,
                milestoneId,
                updatedMilestoneData
            );

            return {
                milestone: { id: milestoneId, ...updatedMilestoneData },
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

            return {
                deleted: true,
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
