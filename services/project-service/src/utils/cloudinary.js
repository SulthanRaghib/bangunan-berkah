/**
 * ============================================
 * CLOUDINARY UPLOAD SERVICE
 * ============================================
 * Handles image upload, optimization, and deletion via Cloudinary CDN.
 *
 * Benefits over local storage:
 * - Public CDN URLs (no Docker hostname issues)
 * - Automatic image optimization & format conversion
 * - On-the-fly transformations (resize, crop, watermark)
 * - Global CDN delivery (fast load times)
 *
 * Environment variables required:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

const { v2: cloudinary } = require("cloudinary");

// ── Configuration ──────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate a timestamped filename for uploads.
 * Format: YYYYMMDD_HHmmss_originalname
 *
 * @param {string} originalName - Original filename from the upload
 * @returns {string} Formatted public_id for Cloudinary
 */
function generatePublicId(originalName) {
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

    // Sanitize original name: remove extension, replace non-alphanumeric
    const baseName = originalName
        .replace(/\.[^.]+$/, "")           // remove extension
        .replace(/[^a-zA-Z0-9_-]/g, "_")   // replace special chars
        .replace(/_+/g, "_")               // collapse multiple underscores
        .substring(0, 50);                  // limit length

    return `${timestamp}_${baseName}`;
}

/**
 * Upload a single image buffer to Cloudinary.
 *
 * @param {Buffer} buffer - Image buffer (from Multer memoryStorage)
 * @param {Object} options
 * @param {string} options.folder - Cloudinary folder path (e.g., "projects/photos")
 * @param {string} options.publicId - Custom public_id (filename without extension)
 * @returns {Promise<{url: string, publicId: string, originalSize: number, optimizedSize: number}>}
 */
async function uploadImage(buffer, options = {}) {
    const { folder = "projects/photos", publicId } = options;
    const originalSize = buffer.length;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: "image",
                // Cloudinary auto-optimizes:
                quality: "auto:good",       // auto quality optimization
                fetch_format: "auto",       // serve best format (webp/avif)
                transformation: [
                    {
                        width: 1920,
                        height: 1920,
                        crop: "limit",      // resize only if larger, maintain aspect ratio
                    },
                ],
                // Strip unnecessary metadata to reduce size
                flags: "strip_profile",
            },
            (error, result) => {
                if (error) {
                    console.error("❌ Cloudinary upload failed:", error.message);
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    originalSize,
                    optimizedSize: result.bytes,
                    reduction: originalSize > 0
                        ? `${((1 - result.bytes / originalSize) * 100).toFixed(1)}%`
                        : "0%",
                });
            }
        );

        // Pipe buffer to upload stream
        const { Readable } = require("stream");
        const readableStream = Readable.from(buffer);
        readableStream.pipe(uploadStream);
    });
}

/**
 * Upload multiple files to Cloudinary (from Multer req.files).
 *
 * @param {Array<{buffer: Buffer, originalname: string}>} files - Multer file objects (memoryStorage)
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{urls: string[], results: Array}>}
 */
async function uploadMultipleImages(files, folder = "projects/photos") {
    if (!files || files.length === 0) {
        throw new Error("Tidak ada file untuk diupload");
    }

    const results = await Promise.all(
        files.map((file) => {
            const publicId = generatePublicId(file.originalname);
            return uploadImage(file.buffer, { folder, publicId });
        })
    );

    // Log summary
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalReduction = totalOriginal > 0
        ? ((1 - totalOptimized / totalOriginal) * 100).toFixed(1)
        : 0;

    console.log(
        `☁️  Cloudinary upload: ${files.length} files | ` +
        `${formatBytes(totalOriginal)} → ${formatBytes(totalOptimized)} ` +
        `(${totalReduction}% smaller)`
    );

    return {
        urls: results.map((r) => r.url),
        results,
    };
}

/**
 * Delete a single image from Cloudinary by its public_id or URL.
 *
 * @param {string} urlOrPublicId - Cloudinary URL or public_id
 * @returns {Promise<{success: boolean}>}
 */
async function deleteImage(urlOrPublicId) {
    try {
        const publicId = extractPublicId(urlOrPublicId);

        if (!publicId) {
            console.warn("⚠️ Could not extract public_id from:", urlOrPublicId);
            return { success: false };
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        return { success: result.result === "ok" };
    } catch (error) {
        console.error("❌ Cloudinary delete failed:", error.message);
        return { success: false };
    }
}

/**
 * Delete multiple images from Cloudinary.
 *
 * @param {string[]} urlsOrPublicIds - Array of Cloudinary URLs or public_ids
 * @returns {Promise<{deleted: number, failed: number}>}
 */
async function deleteMultipleImages(urlsOrPublicIds) {
    const publicIds = urlsOrPublicIds
        .map(extractPublicId)
        .filter(Boolean);

    if (publicIds.length === 0) {
        return { deleted: 0, failed: urlsOrPublicIds.length };
    }

    try {
        const result = await cloudinary.api.delete_resources(publicIds, {
            resource_type: "image",
        });

        const deleted = Object.values(result.deleted || {})
            .filter((status) => status === "deleted").length;

        return { deleted, failed: publicIds.length - deleted };
    } catch (error) {
        console.error("❌ Cloudinary batch delete failed:", error.message);
        return { deleted: 0, failed: publicIds.length };
    }
}

/**
 * Extract Cloudinary public_id from a full URL.
 * Example URL: https://res.cloudinary.com/cloud_name/image/upload/v123/projects/photos/file.jpg
 * Returns: projects/photos/file
 *
 * @param {string} input - Full Cloudinary URL or public_id
 * @returns {string|null} public_id or null if extraction fails
 */
function extractPublicId(input) {
    if (!input) return null;

    // If it's already a public_id (no http), return as-is
    if (!input.startsWith("http")) {
        return input;
    }

    try {
        // Match pattern: /upload/v<version>/<public_id>.<ext>
        const match = input.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

/**
 * Check if Cloudinary is properly configured.
 * @returns {boolean}
 */
function isConfigured() {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

module.exports = {
    cloudinary,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteMultipleImages,
    extractPublicId,
    isConfigured,
    generatePublicId,
};
