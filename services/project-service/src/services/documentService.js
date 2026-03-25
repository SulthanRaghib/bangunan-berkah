/**
 * Document Service
 * Handles all document business logic
 */

const { v4: uuidv4 } = require("uuid");
const projectRepository = require("../repositories/projectRepository");
const { ValidationError, AppError, NotFoundError } = require("../utils/errors");

class DocumentService {
    /**
     * Add document to project
     */
    async addDocument(projectCode, documentData) {
        try {
            // Verify project exists
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const document = {
                id: uuidv4(),
                name: documentData.name,
                type: documentData.type,
                fileUrl: documentData.fileUrl,
                fileSize: documentData.fileSize || null,
                uploadedBy: documentData.uploadedBy,
                uploadedByName: documentData.uploadedByName,
                description: documentData.description || "",
                uploadedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await projectRepository.addDocument(projectCode, document);

            return document;
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Update document
     */
    async updateDocument(projectCode, documentId, documentData) {
        try {
            // Verify project exists
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            // Find document
            const document = project.documents?.find(
                (d) => d.id === documentId
            );
            if (!document) {
                throw new NotFoundError("Document");
            }

            // Prepare update data
            const updatedDocumentData = {
                name: documentData.name || document.name,
                type: documentData.type || document.type,
                fileUrl: documentData.fileUrl || document.fileUrl,
                fileSize: documentData.fileSize || document.fileSize,
                description:
                    documentData.description !== undefined
                        ? documentData.description
                        : document.description,
                uploadedBy: documentData.uploadedBy || document.uploadedBy,
                uploadedByName:
                    documentData.uploadedByName ||
                    document.uploadedByName,
                uploadedAt: documentData.uploadedAt
                    ? new Date(documentData.uploadedAt)
                    : document.uploadedAt,
            };

            await projectRepository.updateDocument(
                projectCode,
                documentId,
                updatedDocumentData
            );

            return { id: documentId, ...updatedDocumentData };
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Delete document
     */
    async deleteDocument(projectCode, documentId) {
        try {
            // Verify project exists
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            // Find document to verify it exists
            const document = project.documents?.find(
                (d) => d.id === documentId
            );
            if (!document) {
                throw new NotFoundError("Document");
            }

            await projectRepository.deleteDocument(projectCode, documentId);

            return true;
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get document
     */
    async getDocument(projectCode, documentId) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            const document = project.documents?.find(
                (d) => d.id === documentId
            );
            if (!document) {
                throw new NotFoundError("Document");
            }

            return document;
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }

    /**
     * Get all documents for project
     */
    async getDocuments(projectCode) {
        try {
            const project =
                await projectRepository.findByCodeOptional(projectCode);
            if (!project) {
                throw new NotFoundError("Project");
            }

            return project.documents || [];
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new AppError(error.message, 500);
        }
    }
}

module.exports = new DocumentService();
