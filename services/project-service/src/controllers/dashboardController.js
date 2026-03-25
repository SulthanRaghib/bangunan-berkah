/**
 * Dashboard Controller (Refactored)
 * Handles dashboard-related HTTP requests using services
 */

const dashboardService = require("../services/dashboardService");
const { asyncHandler, sendSuccess } = require("../../../shared");

/**
 * GET PROJECT DASHBOARD
 * GET /api/projects/:projectCode/dashboard
 */
exports.getProjectDashboard = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const dashboard = await dashboardService.getProjectDashboard(projectCode);

    return sendSuccess(res, dashboard, "Project dashboard berhasil diambil");
});

/**
 * GET SUMMARY STATS
 * GET /api/projects/:projectCode/summary
 */
exports.getSummaryStats = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const summary = await dashboardService.getSummaryStats(projectCode);

    return sendSuccess(res, summary, "Summary stats berhasil diambil");
});

/**
 * GET DASHBOARD STATS
 * GET /api/dashboard/stats
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();

    return sendSuccess(res, stats, "Dashboard stats berhasil diambil");
});

/**
 * GET PROJECT ACTIVITIES
 * GET /api/dashboard/activities/:projectCode
 */
exports.getProjectActivities = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const activityData = await dashboardService.getProjectActivities(projectCode);

    return sendSuccess(res, activityData, "Project activities berhasil diambil");
});