/**
 * Project Service
 * Handles all project business logic
 */

const projectRepository = require("../repositories/projectRepository");
const { generateProjectCode } = require("../utils/projectCodeGenerator");
const { ValidationError, AppError } = require("../utils/errors");

class ProjectService {
    /**
     * Create new project
     */
    async createProject(projectData, userId, userName) {
        try {
            const projectCode = await generateProjectCode();

            const newProject = await projectRepository.createProject({
                projectCode,
                projectName: projectData.projectName,
                description: projectData.description,
                projectType: projectData.projectType,
                customerName: projectData.customerName,
                customerEmail: projectData.customerEmail,
                customerPhone: projectData.customerPhone,
                customerAddress: projectData.customerAddress,
                budget: projectData.budget ? parseFloat(projectData.budget) : null,
                actualCost: 0,
                startDate: new Date(projectData.startDate),
                estimatedEndDate: new Date(projectData.estimatedEndDate),
                notes: projectData.notes,
                createdBy: userId,
                createdByName: userName,
            });

            return {
                projectCode: newProject.projectCode,
                projectName: newProject.projectName,
                customerName: newProject.customerName,
                startDate: newProject.startDate,
                estimatedEndDate: newProject.estimatedEndDate,
            };
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Get all projects with filters
     */
    async getAllProjects(filters = {}) {
        try {
            return await projectRepository.getAll(filters);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Get project by code
     */
    async getProjectByCode(projectCode) {
        try {
            return await projectRepository.findByCode(projectCode);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Update project
     */
    async updateProject(projectCode, updateData) {
        try {
            return await projectRepository.updateProject(projectCode, updateData);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Update project status
     */
    async updateProjectStatus(projectCode, status) {
        try {
            const validStatuses = [
                "pending",
                "in_progress",
                "on_hold",
                "completed",
                "cancelled",
            ];

            if (!validStatuses.includes(status)) {
                throw new ValidationError(
                    `Status harus salah satu dari: ${validStatuses.join(", ")}`
                );
            }

            return await projectRepository.updateStatus(projectCode, status);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Delete project
     */
    async deleteProject(projectCode) {
        try {
            return await projectRepository.deleteProject(projectCode);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Get project progress
     */
    async getProjectProgress(projectCode) {
        try {
            return await projectRepository.getProjectProgress(projectCode);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Check if project exists
     */
    async projectExists(projectCode) {
        try {
            return await projectRepository.projectExists(projectCode);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }
}

module.exports = new ProjectService();
