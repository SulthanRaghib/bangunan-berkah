/**
 * Project Repository
 * Handles all database operations for projects collection
 */

const BaseRepository = require("./BaseRepository");
const { NotFoundError, AppError } = require("../utils/errors");
const { calculateDuration } = require("../utils/dateHelper");

class ProjectRepository extends BaseRepository {
    constructor() {
        super("projects");
    }

    /**
     * Create new project
     */
    async createProject(projectData) {
        try {
            const success = await this.insertOne({
                ...projectData,
                status: "pending",
                progress: 0,
                milestones: [],
                reports: [],
                documents: [],
                activities: [],
            });

            if (!success) {
                throw new AppError("Gagal membuat project", 500);
            }

            return await this.findByCode(projectData.projectCode);
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Find project by code
     */
    async findByCode(projectCode) {
        const project = await this.findOne({ projectCode });

        if (!project) {
            throw new NotFoundError("Project");
        }

        return this.formatProject(project);
    }

    /**
     * Find project by code (without throw error)
     */
    async findByCodeOptional(projectCode) {
        const project = await this.findOne({ projectCode });
        return project ? this.formatProject(project) : null;
    }

    /**
     * Get all projects with filters and pagination
     */
    async getAll(filters = {}, options = {}) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            projectType,
            sortBy = "createdAt",
            order = "desc",
        } = { ...filters, ...options };

        // Build filter
        const filter = {};

        if (search) {
            filter.$or = [
                { projectCode: { $regex: search, $options: "i" } },
                { projectName: { $regex: search, $options: "i" } },
                { customerName: { $regex: search, $options: "i" } },
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (projectType) {
            filter.projectType = projectType;
        }

        // Get paginated results
        const sort = { [sortBy]: order === "desc" ? -1 : 1 };
        const result = await this.findPaginated(filter, {
            page,
            limit,
            sort,
        });

        return {
            data: result.data.map((project) => this.formatProjectForList(project)),
            pagination: result.pagination,
        };
    }

    /**
     * Update project
     */
    async updateProject(projectCode, updateData) {
        const exists = await this.exists({ projectCode });

        if (!exists) {
            throw new NotFoundError("Project");
        }

        // Filter only updatable fields
        const allowedFields = [
            "projectName",
            "description",
            "projectType",
            "customerName",
            "customerEmail",
            "customerPhone",
            "customerAddress",
            "budget",
            "actualCost",
            "startDate",
            "estimatedEndDate",
            "status",
            "notes",
        ];

        const filteredData = {};
        allowedFields.forEach((field) => {
            if (field in updateData) {
                let value = updateData[field];
                // Convert string dates to Date objects
                if (
                    ["startDate", "estimatedEndDate", "actualEndDate"].includes(
                        field
                    ) &&
                    value
                ) {
                    value = new Date(value);
                }
                if (field === "budget" && value) {
                    value = parseFloat(value);
                }
                filteredData[field] = value;
            }
        });

        const success = await this.updateOne(
            { projectCode },
            filteredData
        );

        if (!success) {
            throw new AppError("Gagal mengupdate project", 500);
        }

        return await this.findByCode(projectCode);
    }

    /**
     * Update project status
     */
    async updateStatus(projectCode, status) {
        const exists = await this.exists({ projectCode });

        if (!exists) {
            throw new NotFoundError("Project");
        }

        const updateData = {
            status,
            updatedAt: new Date(),
        };

        if (status === "completed") {
            updateData.actualEndDate = new Date();
        }

        const success = await this.updateOne({ projectCode }, updateData);

        if (!success) {
            throw new AppError("Gagal mengupdate status project", 500);
        }

        return await this.findByCode(projectCode);
    }

    /**
     * Delete project
     */
    async deleteProject(projectCode) {
        const exists = await this.exists({ projectCode });

        if (!exists) {
            throw new NotFoundError("Project");
        }

        const success = await this.deleteOne({ projectCode });

        if (!success) {
            throw new AppError("Gagal menghapus project", 500);
        }

        return true;
    }

    /**
     * Add milestone to project (array operation)
     */
    async addMilestone(projectCode, milestone) {
        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: { $push: { milestones: milestone } },
                },
            ],
        });

        if (result.n === 0) {
            throw new NotFoundError("Project");
        }

        return result.nModified > 0;
    }

    /**
     * Update milestone in project
     */
    async updateMilestone(projectCode, milestoneId, milestoneData) {
        // Find project and get milestone index
        const project = await this.findOne({ projectCode });

        if (!project) {
            throw new NotFoundError("Project");
        }

        const milestoneIndex = project.milestones?.findIndex(
            (m) => m.id === milestoneId
        );

        if (milestoneIndex === undefined || milestoneIndex === -1) {
            throw new NotFoundError("Milestone");
        }

        const updatePath = `milestones.${milestoneIndex}`;
        const updateData = {
            [`${updatePath}.title`]: milestoneData.title,
            [`${updatePath}.description`]: milestoneData.description,
            [`${updatePath}.targetDate`]: new Date(milestoneData.targetDate),
            [`${updatePath}.progress`]: milestoneData.progress,
            [`${updatePath}.status`]: milestoneData.status,
            [`${updatePath}.updatedAt`]: new Date(),
        };

        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: { $set: updateData },
                },
            ],
        });

        if (result.nModified === 0) {
            throw new AppError("Gagal mengupdate milestone", 500);
        }

        return result.nModified > 0;
    }

    /**
     * Delete milestone from project
     */
    async deleteMilestone(projectCode, milestoneId) {
        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: {
                        $pull: {
                            milestones: { id: milestoneId },
                        },
                    },
                },
            ],
        });

        if (result.n === 0) {
            throw new NotFoundError("Project");
        }

        return result.nModified > 0;
    }

    /**
     * Add document to project
     */
    async addDocument(projectCode, document) {
        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: { $push: { documents: document } },
                },
            ],
        });

        if (result.n === 0) {
            throw new NotFoundError("Project");
        }

        return result.nModified > 0;
    }

    /**
     * Update document in project
     */
    async updateDocument(projectCode, documentId, documentData) {
        const project = await this.findOne({ projectCode });

        if (!project) {
            throw new NotFoundError("Project");
        }

        const docIndex = project.documents?.findIndex(
            (d) => d.id === documentId
        );

        if (docIndex === undefined || docIndex === -1) {
            throw new NotFoundError("Document");
        }

        const updatePath = `documents.${docIndex}`;
        const updateData = {
            [`${updatePath}.name`]: documentData.name,
            [`${updatePath}.type`]: documentData.type,
            [`${updatePath}.fileUrl`]: documentData.fileUrl,
            [`${updatePath}.uploadedBy`]: documentData.uploadedBy,
            [`${updatePath}.uploadedAt`]: new Date(documentData.uploadedAt),
        };

        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: { $set: updateData },
                },
            ],
        });

        if (result.nModified === 0) {
            throw new AppError("Gagal mengupdate document", 500);
        }

        return result.nModified > 0;
    }

    /**
     * Delete document from project
     */
    async deleteDocument(projectCode, documentId) {
        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: {
                        $pull: {
                            documents: { id: documentId },
                        },
                    },
                },
            ],
        });

        if (result.n === 0) {
            throw new NotFoundError("Project");
        }

        return result.nModified > 0;
    }

    /**
     * Add activity to project
     */
    async addActivity(projectCode, activity) {
        const result = await this.runCommand({
            update: this.collectionName,
            updates: [
                {
                    q: { projectCode },
                    u: { $push: { activities: activity } },
                },
            ],
        });

        if (result.n === 0) {
            throw new NotFoundError("Project");
        }

        return result.nModified > 0;
    }

    /**
     * Get project progress
     */
    async getProjectProgress(projectCode) {
        const project = await this.findOne({ projectCode });

        if (!project) {
            throw new NotFoundError("Project");
        }

        const milestones = project.milestones || [];
        const progress =
            milestones.length > 0
                ? Math.round(
                    milestones.reduce((sum, m) => sum + (m.progress || 0), 0) /
                    milestones.length
                )
                : 0;

        return {
            projectCode,
            progress,
            milestoneCount: milestones.length,
            completedCount: milestones.filter((m) => m.status === "completed")
                .length,
        };
    }

    /**
     * Check if project exists
     */
    async projectExists(projectCode) {
        return await this.exists({ projectCode });
    }

    /**
     * Format project data for detailed response
     */
    formatProject(project) {
        if (!project) return null;

        const startDate = this.deserializeDate(project.startDate);
        const estimatedEndDate = this.deserializeDate(
            project.estimatedEndDate
        );
        const actualEndDate = this.deserializeDate(project.actualEndDate);
        const createdAt = this.deserializeDate(project.createdAt);
        const updatedAt = this.deserializeDate(project.updatedAt);

        // Sort milestones by target date
        const sortedMilestones = (project.milestones || [])
            .map((m) => {
                const milestoneDate = this.deserializeDate(m.targetDate);
                return {
                    ...m,
                    targetDate: milestoneDate,
                };
            })
            .sort((a, b) => a.targetDate - b.targetDate);

        // Calculate additional info
        const duration = calculateDuration(startDate, estimatedEndDate);
        const daysRemaining = Math.max(
            0,
            Math.ceil((estimatedEndDate - new Date()) / (1000 * 60 * 60 * 24))
        );

        return {
            id: project._id?.$oid || project._id,
            projectCode: project.projectCode,
            projectName: project.projectName,
            description: project.description,
            projectType: project.projectType,
            customerName: project.customerName,
            customerEmail: project.customerEmail,
            customerPhone: project.customerPhone,
            customerAddress: project.customerAddress,
            budget: project.budget,
            actualCost: project.actualCost,
            startDate,
            estimatedEndDate,
            actualEndDate,
            status: project.status,
            progress: project.progress,
            milestones: sortedMilestones,
            notes: project.notes,
            createdBy: project.createdBy,
            createdByName: project.createdByName,
            reports: project.reports || [],
            documents: project.documents || [],
            activities: project.activities || [],
            createdAt,
            updatedAt,
            duration: `${duration} hari`,
            daysRemaining,
            isOverdue: daysRemaining === 0 && project.status !== "completed",
        };
    }

    /**
     * Format project data for list response
     */
    formatProjectForList(project) {
        if (!project) return null;

        const startDate = this.deserializeDate(project.startDate);
        const estimatedEndDate = this.deserializeDate(
            project.estimatedEndDate
        );
        const actualEndDate = this.deserializeDate(project.actualEndDate);
        const createdAt = this.deserializeDate(project.createdAt);
        const updatedAt = this.deserializeDate(project.updatedAt);

        return {
            id: project._id?.$oid || project._id,
            projectCode: project.projectCode,
            projectName: project.projectName,
            customerName: project.customerName,
            customerEmail: project.customerEmail,
            customerPhone: project.customerPhone,
            projectType: project.projectType,
            status: project.status,
            progress: project.progress,
            budget: project.budget,
            actualCost: project.actualCost,
            startDate,
            estimatedEndDate,
            actualEndDate,
            createdAt,
            updatedAt,
        };
    }
}

module.exports = new ProjectRepository();
