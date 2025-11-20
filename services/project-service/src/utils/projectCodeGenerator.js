const prisma = require("../config/prisma")

/**
 * Generate unique project code
 * Format: PRJ-YYYY-XXX
 * Example: PRJ-2025-001
 */
async function generateProjectCode() {
    const year = new Date().getFullYear()
    const prefix = `PRJ-${year}`

    // Get all projects for current year and find the highest sequence number
    const result = await prisma.$runCommandRaw({
        find: "projects",
        filter: {
            projectCode: {
                $regex: `^${prefix}`
            }
        },
        projection: {
            projectCode: 1
        }
    });

    let sequence = 1;

    if (result.cursor.firstBatch.length > 0) {
        // Extract all sequence numbers and find the highest
        const sequences = result.cursor.firstBatch.map(project => {
            const parts = project.projectCode.split("-");
            return parseInt(parts[2]) || 0;
        });

        const maxSequence = Math.max(...sequences);
        sequence = maxSequence + 1;
    }

    //  Format sequence with leading zeros (001, 002, ...)
    const sequenceStr = sequence.toString().padStart(3, '0')

    return `${prefix}-${sequenceStr}`
}

/**
 * Check if project code exists
 */
async function isProjectCodeExists(projectCode) {
    const result = await prisma.$runCommandRaw({
        find: "projects",
        filter: { projectCode },
        limit: 1,
        projection: { _id: 1 }
    });

    return result.cursor.firstBatch.length > 0;
}

module.exports = {
    generateProjectCode,
    isProjectCodeExists,
}