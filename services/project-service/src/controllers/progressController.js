/**
 * Progress Controller (Refactored)
 * Handles progress-related HTTP requests using services
 */

const progressService = require("../services/progressService");
const { asyncHandler, sendSuccess } = require("../../../shared");
const { logProjectActivity } = require("../services/activityLogger");

/**
 * GET MILESTONE PROGRESS
 * GET /api/projects/:projectCode/milestones/:milestoneId/progress
 */
exports.getMilestoneProgress = asyncHandler(async (req, res) => {
    const { projectCode, milestoneId } = req.params;

    const progress = await progressService.getMilestoneProgress(
        projectCode,
        milestoneId
    );

    return sendSuccess(res, progress, "Milestone progress berhasil diambil");
});

/**
 * UPDATE PROJECT PROGRESS
 * PUT /api/projects/:projectCode/progress
 */
exports.updateProjectProgress = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const progress = await progressService.updateProjectProgress(projectCode);

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user.id.toString(),
        userName: req.user.name || req.user.email,
        action: "progress_updated",
        description: `Project progress updated to ${progress.progress}%`,
    });

    return sendSuccess(res, progress, "Project progress berhasil diperbarui");
});

/**
 * GET PROGRESS REPORT
 * GET /api/projects/:projectCode/progress/report
 */
exports.getProgressReport = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const report = await progressService.getProgressReport(projectCode);

    return sendSuccess(res, report, "Progress report berhasil diambil");
});
