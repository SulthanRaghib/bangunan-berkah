/**
 * Milestone Controller (Refactored)
 * Handles milestone-related HTTP requests using services
 */

const milestoneService = require("../services/milestoneService");
const { asyncHandler, sendSuccess, sendCreated } = require("../../../shared");
const { logProjectActivity } = require("../services/activityLogger");

/**
 * ADD MILESTONE
 * POST /api/projects/:projectCode/milestones
 */
exports.addMilestone = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;
    const { title, name, description, detail, targetDate, status, progress, photos } = req.body;

    const result = await milestoneService.addMilestone(projectCode, {
        title,
        name,
        description,
        detail,
        targetDate,
        status,
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
            projectProgress: result.projectProgress,
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
    const { title, name, description, detail, status, progress, targetDate, actualCompletionDate } = req.body;

    const result = await milestoneService.updateMilestone(
        projectCode,
        milestoneId,
        {
            title,
            name,
            description,
            detail,
            status,
            progress,
            targetDate,
            actualCompletionDate,
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
            projectProgress: result.projectProgress,
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

    const result = await milestoneService.deleteMilestone(projectCode, milestoneId);

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "milestone_deleted",
        description: `Milestone deleted`,
    });

    return sendSuccess(
        res,
        {
            projectProgress: result.projectProgress,
        },
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