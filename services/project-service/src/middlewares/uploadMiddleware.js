const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateFileName } = require("../utils/fileHandler");

// create generic storage that decides folder based on request path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // decide folder: photos or documents
        const isPhoto = req.originalUrl.includes("photos") || file.fieldname === "photo";
        const folderName = isPhoto ? "photos" : "documents";
        const uploadDir = path.join(__dirname, "../../uploads", folderName);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = generateFileName(file.originalname);
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    // Allow images and common document types
    const allowedImages = /jpeg|jpg|png|gif|webp/;
    const allowedDocs = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

    if (allowedImages.test(ext) || allowedDocs.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Jenis file tidak diperbolehkan"));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = upload;
