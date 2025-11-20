const prisma = require("../../src/config/prisma");

async function seedProjects() {
    console.log("Seeding project-service sample project...");

    const projectCode = "PRJ-2025-001";

    // Check existing
    const existing = await prisma.project.findUnique({ where: { projectCode } }).catch(() => null);
    if (existing) {
        console.log("Sample project already exists, skipping.");
        return;
    }

    const now = new Date();

    const sampleProject = {
        projectCode,
        projectName: "Pembangunan Rumah Pak Budi",
        description: "Rumah 2 lantai type 45",
        projectType: "konstruksi",
        customerName: "Budi Santoso",
        customerEmail: "budi@example.com",
        customerPhone: "081234567890",
        customerAddress: "Jl. Kenangan No. 1, Jakarta",
        budget: 500000000,
        actualCost: 0,
        startDate: new Date("2025-02-01"),
        estimatedEndDate: new Date("2025-08-01"),
        actualEndDate: null,
        status: "in_progress",
        progress: 0,
        contractDocument: null,
        notes: "Project seeded sample",
        createdBy: "system",
        createdByName: "System Seeder",
        createdAt: now,
        updatedAt: now,
        milestones: [
            {
                id: require("crypto").randomUUID(),
                title: "Pengerjaan Pondasi",
                description: "Penggalian dan pengecoran pondasi",
                order: 1,
                startDate: new Date("2025-02-01"),
                endDate: new Date("2025-02-15"),
                actualStartDate: null,
                actualEndDate: null,
                progress: 0,
                status: "pending",
                photos: [],
                notes: "",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: require("crypto").randomUUID(),
                title: "Pembangunan Struktur",
                description: "Pengerjaan struktur utama (kolom, sloof, balok)",
                order: 2,
                startDate: new Date("2025-02-16"),
                endDate: new Date("2025-04-15"),
                actualStartDate: null,
                actualEndDate: null,
                progress: 0,
                status: "pending",
                photos: [],
                notes: "",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: require("crypto").randomUUID(),
                title: "Finishing",
                description: "Pekerjaan finishing interior dan eksterior",
                order: 3,
                startDate: new Date("2025-04-16"),
                endDate: new Date("2025-08-01"),
                actualStartDate: null,
                actualEndDate: null,
                progress: 0,
                status: "pending",
                photos: [],
                notes: "",
                createdAt: now,
                updatedAt: now,
            },
        ],
        documents: [],
        activities: [
            {
                id: require("crypto").randomUUID(),
                userId: "system",
                userName: "System Seeder",
                action: "created",
                description: "Sample project created by seeder",
                metadata: null,
                createdAt: now,
            },
        ],
    };

    // Use raw insert to avoid Prisma transactions requirement on standalone MongoDB
    await prisma.$runCommandRaw({ insert: "projects", documents: [sampleProject] });

    console.log("Sample project created:", projectCode);
}

module.exports = { seedProjects };
