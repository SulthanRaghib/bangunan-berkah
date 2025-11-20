const prisma = require("../config/prisma")

/**
 * Generate unique project code
 * Format: PRJ-YYYY-XXX
 * Example: PRJ-2025-001
 */
async function generateProjectCode() {
    const year = new Date().getFullYear()
    const prefix = `PRJ-${year}`

    // Get last project code for current year
    const lastProject = await prisma.project.findFirst({
        where: {
            projectCode: {
                startsWith: prefix
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    let sequence = 1;

    if (lastProject) {
        // Extract sequence number from last code
        const lastCode = lastProject.projectCode
        const lastSequence = parseInt(lastCode.split("-")[2])
        sequence = lastSequence + 1;
    }

    //  Format sequence with leading zeros (001, 002, ...)
    const sequenceStr = sequence.toString().padStart(3, '0')

    return `${prefix}-${sequenceStr}`
}

/**
 * Check if project code exists
 */
async function isProjectCodeExists(projectCode) {
    const project = await prisma.project.findUnique({
        where: { projectCode }
    })

    return project !== null
}

module.exports = {
    generateProjectCode,
    isProjectCodeExists,
}