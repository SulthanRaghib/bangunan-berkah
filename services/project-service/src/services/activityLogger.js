const prisma = require("../config/prisma");
const crypto = require("crypto");

/**
 * Create an activity object
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.userName
 * @param {string} params.action
 * @param {string} [params.description]
 * @param {Object} [params.metadata]
 * @returns {Object} activity
 */
function createActivity({ userId = "system", userName = "system", action = "unknown", description = "", metadata = null }) {
    return {
        id: crypto.randomUUID(),
        userId,
        userName,
        action,
        description,
        metadata,
        createdAt: new Date(),
    };
}

/**
 * Log an activity for a project by projectCode.
 * This pushes an activity into the project's embedded `activities` array.
 *
 * @param {string} projectCode - projectCode to attach activity to
 * @param {Object} activityPayload - fields for activity (userId,userName,action,description,metadata)
 * @returns {Promise<Object|null>} inserted activity or null if project not found
 */
async function logProjectActivity(projectCode, activityPayload = {}) {
    if (!projectCode) throw new Error("projectCode is required to log activity");

    const activity = createActivity(activityPayload);

    try {
        const res = await prisma.project.update({
            where: { projectCode },
            data: {
                activities: { push: activity },
                updatedAt: new Date(),
            },
        });

        return activity;
    } catch (err) {
        // If project not found or other error, return null but log error
        console.error("activityLogger: failed to log activity", err?.message || err);
        return null;
    }
}

module.exports = { createActivity, logProjectActivity, logActivity: logProjectActivity };
