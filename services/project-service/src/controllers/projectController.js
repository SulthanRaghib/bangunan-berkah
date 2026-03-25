/**
 * Project Controller (Refactored)
 * Handles project-related HTTP requests using services
 */

const projectService = require("../services/projectService");
const { asyncHandler, validate, sendSuccess, sendCreated } = require("../../../shared");
const { createProjectSchema, updateProjectSchema } = require("../utils/validation");
const { logProjectActivity } = require("../services/activityLogger");

/**
 * CREATE PROJECT
 * POST /api/projects
 */
exports.createProject = asyncHandler(async (req, res) => {
    const value = await validate(createProjectSchema, req.body);

    const newProject = await projectService.createProject(
        value,
        req.user.id.toString(),
        req.user.name || req.user.email
    );

    // Log activity
    await logProjectActivity(newProject.projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "created",
        description: `Project created by ${req.user.name || req.user.email}`,
    });

    return sendCreated(
        res,
        {
            ...newProject,
            trackingUrl: `${req.protocol}://${req.get("host")}/api/projects/track/${newProject.projectCode}`,
        },
        "Project berhasil dibuat"
    );
});

/**
 * GET ALL PROJECTS
 * GET /api/projects
 */
exports.getAllProjects = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        projectType,
        sortBy = "createdAt",
        order = "desc",
    } = req.query;

    const result = await projectService.getAllProjects({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        projectType,
        sortBy,
        order,
    });

    return sendSuccess(
        res,
        {
            data: result.data,
            pagination: result.pagination,
        },
        "Projects berhasil diambil"
    );
});

/**
 * GET PROJECT BY CODE
 * GET /api/projects/:projectCode
 */
exports.getProjectByCode = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const project = await projectService.getProjectByCode(projectCode);

    return sendSuccess(res, project, "Project berhasil diambil");
});

/**
 * UPDATE PROJECT
 * PUT /api/projects/:projectCode
 */
exports.updateProject = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;
    const value = await validate(updateProjectSchema, req.body);

    const updatedProject = await projectService.updateProject(
        projectCode,
        value
    );

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "updated",
        description: `Project updated by ${req.user.name || req.user.email}`,
        metadata: { updatedFields: Object.keys(value) },
    });

    return sendSuccess(res, updatedProject, "Project berhasil diperbarui");
});

/**
 * DELETE PROJECT
 * DELETE /api/projects/:projectCode
 */
exports.deleteProject = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    await projectService.deleteProject(projectCode);

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "deleted",
        description: `Project deleted by ${req.user.name || req.user.email}`,
    }).catch(() => {
        // Ignore if project already deleted
    });

    return sendSuccess(res, null, "Project berhasil dihapus");
});

/**
 * UPDATE PROJECT STATUS
 * PATCH /api/projects/:projectCode/status
 */
exports.updateProjectStatus = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;
    const { status } = req.body;

    const updatedProject = await projectService.updateProjectStatus(
        projectCode,
        status
    );

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "status_changed",
        description: `Project status changed to ${status}`,
        metadata: { newStatus: status },
    });

    return sendSuccess(
        res,
        updatedProject,
        `Status project berhasil diubah menjadi ${status}`
    );
});

/**
 * GET PROJECT PROGRESS
 * GET /api/projects/:projectCode/progress
 */
exports.getProjectProgress = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const progress = await projectService.getProjectProgress(projectCode);

    return sendSuccess(res, progress, "Project progress berhasil diambil");
});