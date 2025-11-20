const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(["admin"]));

// Document operations
router.post("/:projectCode/documents", upload.single("document"), documentController.uploadDocument);
router.get("/:projectCode/documents", documentController.getDocumentsByProject);
router.delete("/:projectCode/documents/:documentId", documentController.deleteDocument);

module.exports = router;
