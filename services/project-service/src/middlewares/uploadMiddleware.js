/**
 * ============================================
 * UPLOAD MIDDLEWARE (Multer)
 * ============================================
 * Uses memoryStorage — files are kept in memory as Buffer
 * and uploaded directly to Cloudinary (no disk I/O).
 *
 * If Cloudinary is not configured, falls back to diskStorage.
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Detect storage mode ──────────────────────
const useCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// ── Memory storage (for Cloudinary) ──────────
const memoryStorage = multer.memoryStorage();

// ── Disk storage (fallback) ──────────────────
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isPhoto = req.originalUrl.includes("photos") || file.fieldname === "photos";
        const folderName = isPhoto ? "photos" : "documents";
        const uploadDir = path.join(__dirname, "../../uploads", folderName);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");

        const timestamp = [
            now.getFullYear(),
            pad(now.getMonth() + 1),
            pad(now.getDate()),
            "_",
            pad(now.getHours()),
            pad(now.getMinutes()),
            pad(now.getSeconds()),
        ].join("");

        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 50);

        cb(null, `${timestamp}_${baseName}${ext}`);
    },
});

// ── File filter ──────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedImages = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

    if (allowedImages.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Format file '${ext}' tidak diperbolehkan. Gunakan: jpg, png, gif, atau webp`));
    }
};

// ── Export ────────────────────────────────────
const upload = multer({
    storage: useCloudinary ? memoryStorage : diskStorage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
    },
});

// Expose storage mode for logging
upload.storageMode = useCloudinary ? "cloudinary" : "disk";

module.exports = upload;
