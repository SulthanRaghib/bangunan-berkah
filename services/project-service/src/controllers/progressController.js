const prisma = require("../config/prisma");
const fs = require("fs");
const path = require("path");

const addWeeklyReport = async (req, res) => {
    try {
        const { projectCode } = req.params;
        const { weekNumber, progress, description } = req.body;
        const files = req.files || [];

        // 1. Validate Input
        if (!weekNumber || progress === undefined || !description) {
            return res.status(400).json({ message: "Week number, progress, and description are required" });
        }

        // 2. Check if project exists
        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 3. Check if week number already exists
        const existingReport = project.reports?.find((r) => r.weekNumber === parseInt(weekNumber));
        if (existingReport) {
            return res.status(400).json({ message: `Report for week ${weekNumber} already exists` });
        }

        // 4. Process Files
        const photoUrls = files.map((file) => `/uploads/photos/${file.filename}`);

        // 5. Construct Report Object for MongoDB Raw Command
        const newReportRaw = {
            weekNumber: parseInt(weekNumber),
            progress: parseFloat(progress),
            description,
            photos: photoUrls,
            createdAt: { $date: new Date().toISOString() },
        };

        // 6. Atomic Update using runCommandRaw
        const result = await prisma.$runCommandRaw({
            update: "projects",
            updates: [
                {
                    q: { projectCode: projectCode },
                    u: {
                        $push: { reports: newReportRaw },
                        $set: {
                            progress: parseFloat(progress),
                            updatedAt: { $date: new Date().toISOString() }
                        },
                    },
                },
            ],
        });

        // Check result
        // MongoDB update command returns { n: 1, nModified: 1, ok: 1 }
        if (result.nModified === 0) {
            return res.status(500).json({ message: "Failed to update project" });
        }

        // 7. Return Response
        res.status(201).json({
            message: "Weekly report added successfully",
            data: {
                weekNumber: parseInt(weekNumber),
                progress: parseFloat(progress),
                description,
                photos: photoUrls,
                createdAt: new Date()
            },
        });

    } catch (error) {
        console.error(error);
        // Cleanup files if error
        if (req.files) {
            req.files.forEach((file) => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Failed to delete file:", err);
                });
            });
        }
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    addWeeklyReport,
};
