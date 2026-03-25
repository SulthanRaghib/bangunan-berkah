/**
 * Document Controller (Refactored)
 * Handles document-related HTTP requests using services
 */

const documentService = require("../services/documentService");
const { asyncHandler, sendSuccess, sendCreated } = require("../../../shared");
const { deleteFile } = require("../utils/fileHandler");
const { logProjectActivity } = require("../services/activityLogger");

/**
 * UPLOAD DOCUMENT TO PROJECT
 * POST /api/projects/:projectCode/documents
 */
exports.uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new Error("File dokumen wajib diupload");
    }

    const userId = req.user?.id?.toString() || req.user?.id || null;

    const document = await documentService.addDocument(req.params.projectCode, {
        name: req.file.originalname,
        type: req.file.mimetype,
        fileUrl: `${req.protocol}://${req.get("host")}/uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        uploadedBy: userId,
        uploadedByName: req.user?.name || req.user?.email || "system",
        description: req.body.description || null,
    });

    // Log activity
    await logProjectActivity(req.params.projectCode, {
        userId: userId,
        userName: req.user?.name || req.user?.email || "system",
        action: "document_uploaded",
        description: `Document uploaded: ${req.file.originalname}`,
    });

    return sendCreated(res, document, "Document berhasil diupload");
});

/**
 * GET DOCUMENTS BY PROJECT
 * GET /api/projects/:projectCode/documents
 */
exports.getDocumentsByProject = asyncHandler(async (req, res) => {
    const { projectCode } = req.params;

    const documents = await documentService.getDocuments(projectCode);

    return sendSuccess(res, documents, "Documents berhasil diambil");
});

/**
 * GET SINGLE DOCUMENT
 * GET /api/projects/:projectCode/documents/:documentId
 */
exports.getDocument = asyncHandler(async (req, res) => {
    const { projectCode, documentId } = req.params;

    const document = await documentService.getDocument(projectCode, documentId);

    return sendSuccess(res, document, "Document berhasil diambil");
});

/**
 * DELETE DOCUMENT
 * DELETE /api/projects/:projectCode/documents/:documentId
 */
exports.deleteDocument = asyncHandler(async (req, res) => {
    const { projectCode, documentId } = req.params;

    // Get document info first (to delete file)
    const document = await documentService.getDocument(projectCode, documentId);

    // Delete file from storage
    await deleteFile(`uploads/documents/${document.fileUrl?.split("/").pop() || document.filename}`);

    // Delete document from database
    await documentService.deleteDocument(projectCode, documentId);

    // Log activity
    await logProjectActivity(projectCode, {
        userId: req.user?.id?.toString() || req.user?.id || null,
        userName: req.user?.name || req.user?.email || "system",
        action: "document_deleted",
        description: `Document deleted: ${document.name}`,
    });

    return sendSuccess(res, null, "Document berhasil dihapus");
});
