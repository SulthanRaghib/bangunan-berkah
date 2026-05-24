/**
 * Milestone Helper Utility
 * Normalizes milestone status strings and maps status to progress values.
 */

function normalizeMilestoneStatus(status) {
    if (!status) return "PENDING";
    const s = status.trim().toUpperCase();
    if (s === "PENDING" || s === "MENUNGGU") return "PENDING";
    if (s === "ON_PROGRESS" || s === "IN_PROGRESS" || s === "BERJALAN") return "ON_PROGRESS";
    if (s === "COMPLETED" || s === "SELESAI") return "COMPLETED";
    return s;
}

function getMilestoneProgressFromStatus(status) {
    const normStatus = normalizeMilestoneStatus(status);
    if (normStatus === "COMPLETED") return 100;
    if (normStatus === "ON_PROGRESS") return 50;
    return 0; // PENDING or others
}

module.exports = {
    normalizeMilestoneStatus,
    getMilestoneProgressFromStatus,
};
