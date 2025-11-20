const prisma = require("../config/prisma");
const { deleteImage } = require("../utils/fileHandler");

// ========================================
// UPLOAD PHOTO TO MILESTONE
// ========================================
exports.uploadPhoto = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File foto wajib diupload",
            });
        }

        // Get project
        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        // Find milestone
        const milestoneIndex = project.milestones.findIndex((m) => m.id === milestoneId);

        if (milestoneIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Milestone tidak ditemukan",
            });
        }

        // Create photo object
        const photo = {
            id: require("crypto").randomUUID(),
            filename: req.file.filename,
            url: `${req.protocol}://${req.get("host")}/uploads/photos/${req.file.filename}`,
            caption: caption || null,
            uploadedBy: req.user.id.toString(),
            uploadedAt: new Date(),
        };

        // Add photo to milestone
        project.milestones[milestoneIndex].photos.push(photo);
        project.milestones[milestoneIndex].updatedAt = new Date();

        // Update project
        const updated = await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: project.milestones,
                activities: {
                    push: {
                        userId: req.user.id.toString(),
                        userName: req.user.name || req.user.email,
                        action: "photo_uploaded",
                        description: `Photo uploaded to milestone "${project.milestones[milestoneIndex].title}"`,
                        metadata: { milestoneId, photoId: photo.id },
                        createdAt: new Date(),
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Foto berhasil diupload",
            data: photo,
        });
    } catch (err) {
        console.error("Upload photo error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// GET PHOTOS BY MILESTONE
// ========================================
exports.getPhotosByMilestone = async (req, res) => {
    try {
        const { projectCode, milestoneId } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const milestone = project.milestones.find((m) => m.id === milestoneId);

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Foto berhasil diambil",
            data: {
                milestoneTitle: milestone.title,
                photos: milestone.photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
            },
        });
    } catch (err) {
        console.error("Get photos error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};

// ========================================
// DELETE PHOTO
// ========================================
exports.deletePhoto = async (req, res) => {
    try {
        const { projectCode, milestoneId, photoId } = req.params;

        const project = await prisma.project.findUnique({
            where: { projectCode },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const milestoneIndex = project.milestones.findIndex((m) => m.id === milestoneId);

        if (milestoneIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Milestone tidak ditemukan",
            });
        }

        const photoIndex = project.milestones[milestoneIndex].photos.findIndex((p) => p.id === photoId);

        if (photoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Foto tidak ditemukan",
            });
        }

        const photo = project.milestones[milestoneIndex].photos[photoIndex];

        // Delete file from server
        await deleteImage(photo.filename, "photos");

        // Remove photo from array
        project.milestones[milestoneIndex].photos.splice(photoIndex, 1);
        project.milestones[milestoneIndex].updatedAt = new Date();

        // Update project
        await prisma.project.update({
            where: { projectCode },
            data: {
                milestones: project.milestones,
                activities: {
                    push: {
                        userId: req.user.id.toString(),
                        userName: req.user.name || req.user.email,
                        action: "photo_deleted",
                        description: `Photo deleted from milestone "${project.milestones[milestoneIndex].title}"`,
                        metadata: { milestoneId, photoId },
                        createdAt: new Date(),
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: "Foto berhasil dihapus",
        });
    } catch (err) {
        console.error("Delete photo error:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};