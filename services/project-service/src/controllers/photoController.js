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

        // Get project using raw MongoDB command
        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const project = projectResult.cursor.firstBatch[0];

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

        // Add photo to milestone using raw MongoDB command
        const newMilestones = [...project.milestones];
        newMilestones[milestoneIndex].photos.push(photo);
        newMilestones[milestoneIndex].updatedAt = new Date();

        // Update project
        const updated = await prisma.$runCommandRaw({
            update: 'projects',
            updates: [{
                q: { projectCode },
                u: {
                    $set: {
                        milestones: newMilestones,
                        updatedAt: new Date()
                    },
                    $push: {
                        activities: {
                            id: require("crypto").randomUUID(),
                            userId: req.user.id.toString(),
                            userName: req.user.name || req.user.email,
                            action: "photo_uploaded",
                            description: `Photo uploaded to milestone "${project.milestones[milestoneIndex].title}"`,
                            metadata: { milestoneId, photoId: photo.id },
                            createdAt: new Date(),
                        }
                    }
                }
            }]
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

        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const project = projectResult.cursor.firstBatch[0];

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

        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project tidak ditemukan",
            });
        }

        const project = projectResult.cursor.firstBatch[0];

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

        // Handle user ID from JWT token
        let userId = null;
        if (req.user && req.user.id) {
            userId = typeof req.user.id === 'object' && req.user.id.$oid ? req.user.id.$oid : req.user.id;
        }

        // Update project using raw MongoDB
        await prisma.$runCommandRaw({
            update: "projects",
            updates: [{
                q: { projectCode },
                u: {
                    $set: {
                        milestones: project.milestones
                    },
                    $push: {
                        activities: {
                            userId: userId,
                            userName: req.user.name || req.user.email,
                            action: "photo_deleted",
                            description: `Photo deleted from milestone "${project.milestones[milestoneIndex].title}"`,
                            metadata: { milestoneId, photoId },
                            createdAt: new Date(),
                        }
                    }
                }
            }]
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