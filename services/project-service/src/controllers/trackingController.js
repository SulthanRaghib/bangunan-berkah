/**
 * Tracking Controller
 * Handles public project tracking endpoints
 */

const trackingService = require("../services/trackingService");
const { asyncHandler, sendSuccess } = require("../../../shared");

/**
 * TRACK PROJECT (PUBLIC)
 * GET /api/projects/track/:projectCode
 */
exports.trackProject = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const tracking = await trackingService.getProjectTracking(projectCode);

    return sendSuccess(res, tracking, "Project tracking data berhasil diambil");
});

/**
 * GET PROJECT SUMMARY (PUBLIC)
 * GET /api/projects/summary/:projectCode
 */
exports.getProjectSummary = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const tracking = await trackingService.getProjectTracking(projectCode);

    return sendSuccess(
        res,
        {
            projectCode: tracking.projectCode,
            projectName: tracking.projectName,
            customerName: tracking.customerName,
            projectType: tracking.projectType,
            status: tracking.status,
            progress: tracking.progress,
            startDate: tracking.startDate,
            estimatedEndDate: tracking.estimatedEndDate,
            actualEndDate: tracking.actualEndDate,
        },
        "Project summary berhasil diambil"
    );
});
