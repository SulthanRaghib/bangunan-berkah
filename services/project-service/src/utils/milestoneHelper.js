/**
 * Milestone Helper Utility
 * Normalizes milestone status strings and maps status to progress values.
 */

const { ValidationError } = require("./errors");

function normalizeMilestoneStatus(status) {
    if (!status) return "PENDING";
    const s = status.trim().toUpperCase();
    if (s === "PENDING" || s === "MENUNGGU") return "PENDING";
    if (s === "ON_PROGRESS" || s === "IN_PROGRESS" || s === "BERJALAN") return "ON_PROGRESS";
    if (s === "COMPLETED" || s === "SELESAI") return "COMPLETED";
    throw new ValidationError("Status milestone tidak valid. Harus salah satu dari: 'menunggu', 'berjalan', atau 'selesai'");
}

function getMilestoneProgressFromStatus(status) {
    const normStatus = normalizeMilestoneStatus(status);
    if (normStatus === "COMPLETED") return 100;
    if (normStatus === "ON_PROGRESS") return 50;
    return 0; // PENDING
}

module.exports = {
    normalizeMilestoneStatus,
    getMilestoneProgressFromStatus,
};
