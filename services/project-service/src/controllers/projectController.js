/**
 * Project Controller (Refactored)
 * Handles project-related HTTP requests using services
 */

const projectService = require("../services/projectService");
const { asyncHandler, validate, sendSuccess, sendCreated } = require("../../../shared");
const { createProjectSchema, updateProjectSchema, updateProgressSchema, deletePhotoSchema } = require("../utils/validation");
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

/**
 * UPDATE PROJECT PROGRESS (DIRECT)
 * PATCH /api/projects/:projectCode/progress
 */
exports.updateProjectProgress = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;
    const value = await validate(updateProgressSchema, req.body);

    const updatedProject = await projectService.updateProjectProgress(
        projectCode,
        value.progress
    );

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "progress_updated",
        description: `Project progress updated to ${value.progress}%`,
        metadata: { progress: value.progress },
    });

    return sendSuccess(
        res,
        updatedProject,
        `Progress project berhasil diperbarui menjadi ${value.progress}%`
    );
});

/**
 * UPLOAD PROJECT PHOTOS
 * POST /api/projects/:projectCode/photos
 */
exports.uploadProjectPhotos = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    if (!req.files || req.files.length === 0) {
        throw new Error("Minimal satu foto harus diupload");
    }

    // Build photo URLs from uploaded files
    const photoUrls = req.files.map(
        (file) => `${req.protocol}://${req.get("host")}/uploads/photos/${file.filename}`
    );

    const updatedProject = await projectService.uploadProjectPhotos(
        projectCode,
        photoUrls
    );

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "photos_uploaded",
        description: `${req.files.length} foto dokumentasi diupload`,
        metadata: { photoCount: req.files.length },
    });

    return sendCreated(
        res,
        {
            uploadedPhotos: photoUrls,
            totalPhotos: updatedProject.photos?.length || 0,
            project: updatedProject,
        },
        `${req.files.length} foto berhasil diupload`
    );
});

/**
 * GET PROJECT PHOTOS
 * GET /api/projects/:projectCode/photos
 */
exports.getProjectPhotos = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const photos = await projectService.getProjectPhotos(projectCode);

    return sendSuccess(
        res,
        { photos, total: photos.length },
        "Foto dokumentasi berhasil diambil"
    );
});

/**
 * DELETE PROJECT PHOTO
 * DELETE /api/projects/:projectCode/photos
 */
exports.deleteProjectPhoto = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;
    const value = await validate(deletePhotoSchema, req.body);

    const updatedProject = await projectService.deleteProjectPhoto(
        projectCode,
        value.url
    );

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "photo_deleted",
        description: `Foto dokumentasi dihapus`,
    });

    return sendSuccess(
        res,
        updatedProject,
        "Foto berhasil dihapus"
    );
});