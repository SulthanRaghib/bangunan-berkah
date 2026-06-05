/**
 * Milestone Controller (Refactored)
 * Handles milestone-related HTTP requests using services
 * NOTE: Milestone CRUD no longer returns projectProgress.
 *       Project progress is managed separately via the progress endpoint.
 */

const milestoneService = require("../services/milestoneService");
const { asyncHandler, validate, sendSuccess, sendCreated } = require("../../../shared");
const { logProjectActivity } = require("../services/activityLogger");
const { addMilestoneSchema, updateMilestoneSchema, normalizeMilestoneStatus } = require("../utils/validation");
const cloudinaryService = require("../utils/cloudinary");

const cleanEmptyStrings = (body) => {
    if (!body || typeof body !== "object") return body;
    const cleaned = { ...body };
    Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === "") {
            delete cleaned[key];
        }
    });
    return cleaned;
};

/**
 * ADD MILESTONE
 * POST /api/projects/:projectCode/milestones
 */
exports.addMilestone = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    // Validate request body after cleaning empty values
    const cleanedBody = cleanEmptyStrings(req.body);
    const validatedData = await validate(addMilestoneSchema, cleanedBody);
    const { title, name, description, detail, targetDate, status, progress, photos } = validatedData;
    const normalizedStatus = status ? normalizeMilestoneStatus(status) : undefined;

    const result = await milestoneService.addMilestone(projectCode, {
        title,
        name,
        description,
        detail,
        targetDate,
        status: normalizedStatus,
        progress,
        photos,
    });

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "milestone_added",
        description: `Milestone added: ${result.milestone.title}`,
    });

    return sendCreated(
        res,
        {
            milestone: result.milestone,
        },
        "Milestone berhasil ditambahkan"
    );
});

/**
 * UPDATE MILESTONE
 * PUT /api/projects/:projectCode/milestones/:milestoneId
 */
exports.updateMilestone = asyncHandler(async (req, res) => {
    const { projectCode, milestoneId } = req.params;

    // Validate request body after cleaning empty values
    const cleanedBody = cleanEmptyStrings(req.body);
    const validatedData = await validate(updateMilestoneSchema, cleanedBody);
    const { title, name, description, detail, status, progress, targetDate, actualCompletionDate } = validatedData;
    const normalizedStatus = status ? normalizeMilestoneStatus(status) : undefined;

    // Handle photo uploads if any
    let photoUrls = undefined;
    if (req.files && req.files.length > 0) {
        if (cloudinaryService.isConfigured()) {
            const folder = `projects/${projectCode}/milestones`;
            const { urls } = await cloudinaryService.uploadMultipleImages(req.files, folder);
            photoUrls = urls;
        } else {
            const publicHost = req.get("x-forwarded-host") || req.get("host");
            const publicProto = req.get("x-forwarded-proto") || req.protocol;
            photoUrls = req.files.map(
                (file) => `${publicProto}://${publicHost}/uploads/photos/${file.filename}`
            );
        }
    }

    const result = await milestoneService.updateMilestone(
        projectCode,
        milestoneId,
        {
            title,
            name,
            description,
            detail,
            status: normalizedStatus,
            progress,
            targetDate,
            actualCompletionDate,
            photos: photoUrls,
        }
    );

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "milestone_updated",
        description: `Milestone updated: ${result.milestone.title}`,
    });

    return sendSuccess(
        res,
        {
            milestone: result.milestone,
        },
        "Milestone berhasil diperbarui"
    );
});

/**
 * DELETE MILESTONE
 * DELETE /api/projects/:projectCode/milestones/:milestoneId
 */
exports.deleteMilestone = asyncHandler(async (req, res) => {
    const { projectCode, milestoneId } = req.params;

    await milestoneService.deleteMilestone(projectCode, milestoneId);

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "milestone_deleted",
        description: `Milestone deleted`,
    });

    return sendSuccess(
        res,
        null,
        "Milestone berhasil dihapus"
    );
});

/**
 * GET MILESTONES
 * GET /api/projects/:projectCode/milestones
 */
exports.getMilestones = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const milestones = await milestoneService.getMilestones(projectCode);

    return sendSuccess(res, milestones, "Milestones berhasil diambil");
});

/**
 * GET SINGLE MILESTONE
 * GET /api/projects/:projectCode/milestones/:milestoneId
 */
exports.getMilestone = asyncHandler(async (req, res) => {
    const { projectCode, milestoneId } = req.params;

    const milestone = await milestoneService.getMilestone(projectCode, milestoneId);

    return sendSuccess(res, milestone, "Milestone berhasil diambil");
});