const prisma = require("../config/prisma");
const { deleteFile } = require("../utils/fileHandler");

// ========================================
// UPLOAD DOCUMENT TO PROJECT
// ========================================
exports.uploadDocument = async (req, res) => {
    try {
        const { projectCode } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "File dokumen wajib diupload" });
        }

        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            // remove uploaded file
            await deleteFile(req.file.path);
            return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
        }

        const project = projectResult.cursor.firstBatch[0];

        // Handle user ID from JWT token
        let userId = null;
        if (req.user && req.user.id) {
            userId = typeof req.user.id === 'object' && req.user.id.$oid ? req.user.id.$oid : req.user.id;
        }

        const document = {
            id: require("crypto").randomUUID(),
            filename: req.file.filename,
            originalname: req.file.originalname,
            url: `${req.protocol}://${req.get("host")}/uploads/documents/${req.file.filename}`,
            uploadedBy: userId,
            uploadedAt: new Date(),
            description: req.body.description || null,
        };

        const activity = {
            userId: userId,
            userName: req.user ? req.user.name || req.user.email : "system",
            action: "document_uploaded",
            description: `Document uploaded: ${req.file.originalname}`,
            metadata: { projectCode, documentId: document.id },
            createdAt: new Date(),
        };

        await prisma.$runCommandRaw({
            update: "projects",
            updates: [{
                q: { projectCode },
                u: {
                    $push: {
                        documents: document,
                        activities: activity
                    }
                }
            }]
        });

        res.status(201).json({ success: true, message: "Document berhasil diupload", data: document });
    } catch (err) {
        console.error("Upload document error:", err);
        res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
};

// ========================================
// LIST DOCUMENTS BY PROJECT
// ========================================
exports.getDocumentsByProject = async (req, res) => {
    try {
        const { projectCode } = req.params;
        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
            projection: { documents: 1 }
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
        }

        const project = projectResult.cursor.firstBatch[0];
        res.status(200).json({ success: true, message: "Documents berhasil diambil", data: project.documents || [] });
    } catch (err) {
        console.error("Get documents error:", err);
        res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
};

// ========================================
// DELETE DOCUMENT
// ========================================
exports.deleteDocument = async (req, res) => {
    try {
        const { projectCode, documentId } = req.params;
        const projectResult = await prisma.$runCommandRaw({
            find: "projects",
            filter: { projectCode },
            limit: 1,
        });

        if (projectResult.cursor.firstBatch.length === 0) {
            return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
        }

        const project = projectResult.cursor.firstBatch[0];
        const idx = project.documents.findIndex((d) => d.id === documentId);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: "Document tidak ditemukan" });
        }

        const doc = project.documents[idx];

        // remove file
        await deleteFile(`uploads/documents/${doc.filename}`);

        // Remove document from array using MongoDB $pull
        await prisma.$runCommandRaw({
            update: "projects",
            updates: [{
                q: { projectCode },
                u: {
                    $pull: {
                        documents: { id: documentId }
                    }
                }
            }]
        });

        res.status(200).json({ success: true, message: "Document berhasil dihapus" });
    } catch (err) {
        console.error("Delete document error:", err);
        res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
};
