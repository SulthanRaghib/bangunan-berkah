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
                description: projectData.description || null,
                projectType: projectData.projectType,
                customerName: projectData.customerName,
                customerEmail: projectData.customerEmail || null,
                customerPhone: projectData.customerPhone || null,
                customerAddress: projectData.customerAddress,
                budget: projectData.budget ? parseFloat(projectData.budget) : null,
                actualCost: 0,
                startDate: projectData.startDate ? new Date(projectData.startDate) : null,
                estimatedEndDate: projectData.estimatedEndDate ? new Date(projectData.estimatedEndDate) : null,
                notes: projectData.notes || null,
                photos: [],
                createdBy: userId || null,
                createdByName: userName || null,
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
     * Upload project photos (documentation)
     * Appends new photo URLs to existing photos array
     */
    async uploadProjectPhotos(projectCode, photoUrls) {
        try {
            if (!photoUrls || photoUrls.length === 0) {
                throw new ValidationError("Minimal satu foto harus diupload");
            }

            return await projectRepository.addPhotos(projectCode, photoUrls);
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Get project photos
     */
    async getProjectPhotos(projectCode) {
        try {
            const project = await projectRepository.findByCode(projectCode);
            return project.photos || [];
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(error.message, 500);
        }
    }

    /**
     * Delete a project photo by URL
     */
    async deleteProjectPhoto(projectCode, photoUrl) {
        try {
            if (!photoUrl) {
                throw new ValidationError("URL foto wajib diisi");
            }

            return await projectRepository.removePhoto(projectCode, photoUrl);
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
