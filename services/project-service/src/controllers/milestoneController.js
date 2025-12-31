const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

// Helper: Calculate Project Progress
const calculateProjectProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;

    const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
    return Math.round(totalProgress / milestones.length);
};

// Add Milestone
const addMilestone = async (req, res) => {
    try {
        const { projectCode } = req.params;
        const { name, description, targetDate, status, progress } = req.body;

        // 1. Fetch Project (Select specific fields to avoid deserialization errors on other fields)
        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: { milestones: true, status: true }
        });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // 2. Create New Milestone Object
        const newMilestone = {
            id: uuidv4(),
            name,
            description: description || "",
            status: status || "PENDING",
            progress: parseInt(progress) || 0,
            targetDate: new Date(targetDate),
            actualCompletionDate: null,
            photos: [],
        };

        // Validate progress
        if (newMilestone.progress < 0 || newMilestone.progress > 100) {
            return res.status(400).json({ success: false, message: "Progress must be between 0 and 100" });
        }

        // 3. Add to array
        const currentMilestones = project.milestones || [];
        const updatedMilestones = [...currentMilestones, newMilestone];

        // 4. Recalculate Progress
        const newProjectProgress = calculateProjectProgress(updatedMilestones);

        // 5. Update Project
        const updatedProject = await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: updatedMilestones,
                progress: newProjectProgress,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                projectCode: true,
                progress: true,
                milestones: true
            }
        });

        res.status(201).json({
            success: true,
            message: "Milestone added successfully",
            data: {
                milestone: newMilestone,
                projectProgress: newProjectProgress,
            },
        });
    } catch (error) {
        console.error("Error adding milestone:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Update Milestone
const updateMilestone = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;
        const { name, description, status, progress, targetDate, actualCompletionDate } = req.body;

        // 1. Fetch Project
        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: { milestones: true, status: true }
        });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // 2. Find and Update Milestone
        const milestones = project.milestones || [];
        const milestoneIndex = milestones.findIndex((m) => m.id === milestoneId);

        if (milestoneIndex === -1) {
            return res.status(404).json({ success: false, message: "Milestone not found" });
        }

        const currentMilestone = milestones[milestoneIndex];

        // Update fields
        const updatedMilestone = {
            ...currentMilestone,
            name: name || currentMilestone.name,
            description: description !== undefined ? description : currentMilestone.description,
            status: status || currentMilestone.status,
            progress: progress !== undefined ? parseInt(progress) : currentMilestone.progress,
            targetDate: targetDate ? new Date(targetDate) : currentMilestone.targetDate,
            actualCompletionDate: actualCompletionDate ? new Date(actualCompletionDate) : currentMilestone.actualCompletionDate,
        };

        // Validate progress
        if (updatedMilestone.progress < 0 || updatedMilestone.progress > 100) {
            return res.status(400).json({ success: false, message: "Progress must be between 0 and 100" });
        }

        // Update array
        const updatedMilestones = [...milestones];
        updatedMilestones[milestoneIndex] = updatedMilestone;

        // 3. Recalculate Progress
        const newProjectProgress = calculateProjectProgress(updatedMilestones);

        // 4. Update Project
        await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: updatedMilestones,
                progress: newProjectProgress,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                projectCode: true,
                progress: true,
                milestones: true
            }
        });

        res.json({
            success: true,
            message: "Milestone updated successfully",
            data: {
                milestone: updatedMilestone,
                projectProgress: newProjectProgress,
            },
        });
    } catch (error) {
        console.error("Error updating milestone:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Delete Milestone
const deleteMilestone = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;

        // 1. Fetch Project (Raw)
        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: { milestones: true, status: true }
        });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // 2. Filter out the milestone
        const milestones = project.milestones || [];
        const updatedMilestones = milestones.filter((m) => m.id !== milestoneId);

        if (updatedMilestones.length === milestones.length) {
            return res.status(404).json({ success: false, message: "Milestone not found" });
        }

        // 3. Recalculate Progress
        const newProjectProgress = calculateProjectProgress(updatedMilestones);

        // 4. Update Project
        await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: updatedMilestones,
                progress: newProjectProgress,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                projectCode: true,
                progress: true,
                milestones: true
            }
        });

        res.json({
            success: true,
            message: "Milestone deleted successfully",
            data: {
                projectProgress: newProjectProgress,
            },
        });
    } catch (error) {
        console.error("Error deleting milestone:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Get Milestones
const getMilestones = async (req, res) => {
    try {
        const { projectCode } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
            select: { milestones: true },
        });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        } tones.sort((a, b) => {
            return new Date(a.targetDate) - new Date(b.targetDate);
        });

        res.json({
            success: true,
            data: sortedMilestones,
        });
    } catch (error) {
        console.error("Error fetching milestones:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    getMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
};
