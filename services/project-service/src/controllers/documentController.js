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

        const project = await prisma.project.findUnique({ where: { projectCode } });
        if (!project) {
            // remove uploaded file
            await deleteFile(req.file.path);
            return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
        }

        const document = {
            id: require("crypto").randomUUID(),
            filename: req.file.filename,
            originalname: req.file.originalname,
            url: `${req.protocol}://${req.get("host")}/uploads/documents/${req.file.filename}`,
            uploadedBy: req.user ? req.user.id.toString() : null,
            uploadedAt: new Date(),
            description: req.body.description || null,
        };

        await prisma.project.update({
            where: { projectCode },
            data: {
                documents: { push: document },
                activities: {
                    push: {
                        userId: req.user ? req.user.id.toString() : null,
                        userName: req.user ? req.user.name || req.user.email : "system",
                        action: "document_uploaded",
                        description: `Document uploaded: ${req.file.originalname}`,
                        metadata: { projectCode, documentId: document.id },
                        createdAt: new Date(),
                    },
                },
            },
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
        const project = await prisma.project.findUnique({ where: { projectCode } });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
        }

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
        const project = await prisma.project.findUnique({ where: { projectCode } });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project tidak ditemukan" });
        }

        const idx = project.documents.findIndex((d) => d.id === documentId);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: "Document tidak ditemukan" });
        }

        const doc = project.documents[idx];

        // remove file
        await deleteFile(`uploads/documents/${doc.filename}`);

        project.documents.splice(idx, 1);

        await prisma.project.update({ where: { projectCode }, data: { documents: project.documents } });

        res.status(200).json({ success: true, message: "Document berhasil dihapus" });
    } catch (err) {
        console.error("Delete document error:", err);
        res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
};
