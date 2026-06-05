/**
 * Milestone Helper Utility
 * Normalizes milestone status strings and maps status to progress values.
 */

const { ValidationError } = require("./errors");

function normalizeMilestoneStatus(status) {
    if (!status) return "menunggu";

    // Normalize input: trim, lowercase, unify separators to underscore
    let s = String(status).trim().toLowerCase();
    s = s.replace(/[-\s]+/g, "_"); // replace spaces/dashes with underscore
    s = s.replace(/__+/g, "_"); // collapse multiple underscores

    if (s === "menunggu" || s === "pending") return "menunggu";
    if (
        s === "berjalan" ||
        s === "in_progress" ||
        s === "in-progress" ||
        s === "inprogress" ||
        s === "on_progress" ||
        s === "on-progress" ||
        s === "onprogress"
    )
        return "berjalan";
    if (s === "selesai" || s === "completed") return "selesai";

    throw new ValidationError(
        "Status milestone tidak valid. Harus salah satu dari: 'menunggu', 'berjalan', atau 'selesai'"
    );
}

function getMilestoneProgressFromStatus(status) {
    const normStatus = normalizeMilestoneStatus(status);
    if (normStatus === "selesai") return 100;
    if (normStatus === "berjalan") return 50;
    return 0; // menunggu
}

module.exports = {
    normalizeMilestoneStatus,
    getMilestoneProgressFromStatus,
};
