/**
 * Progress Controller (Refactored)
 * Handles progress-related HTTP requests using services
 */

const progressService = require("../services/progressService");
const { asyncHandler, sendSuccess } = require("../../../shared");

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
 * GET PROGRESS REPORT
 * GET /api/projects/:projectCode/progress/report
 */
exports.getProgressReport = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const report = await progressService.getProgressReport(projectCode);

    return sendSuccess(res, report, "Progress report berhasil diambil");
});
