/**
 * ============================================
 * IMAGE OPTIMIZER UTILITY
 * ============================================
 * Compress & resize uploaded images using sharp.
 * Reduces file size significantly while maintaining visual quality.
 *
 * Typical results:
 * - 8MB photo from phone → ~300-500KB (90%+ reduction)
 * - 1920px max width, JPEG quality 80
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// ── Configuration ──────────────────────────
const CONFIG = {
    maxWidth: 1920,          // Max width in pixels (Full HD)
    maxHeight: 1920,         // Max height in pixels
    jpegQuality: 80,         // JPEG quality (1-100, 80 = good balance)
    webpQuality: 80,         // WebP quality (if converting)
    pngCompressionLevel: 8,  // PNG compression (0-9)
    outputFormat: null,      // null = keep original format, "jpeg" | "webp" | "png"
};

/**
 * Optimize a single image file in-place.
 * Overwrites the original file with the compressed version.
 *
 * @param {string} filePath - Absolute path to the image file
 * @returns {Promise<{originalSize: number, optimizedSize: number, reduction: string}>}
 */
async function optimizeImage(filePath) {
    const originalSize = (await fs.promises.stat(filePath)).size;
    const ext = path.extname(filePath).toLowerCase();

    // Skip non-image files
    const supportedFormats = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (!supportedFormats.includes(ext)) {
        return { originalSize, optimizedSize: originalSize, reduction: "0%" };
    }

    try {
        // Read the original file
        const inputBuffer = await fs.promises.readFile(filePath);

        // Build the sharp pipeline
        let pipeline = sharp(inputBuffer, { failOn: "none" })
            .rotate() // Auto-rotate based on EXIF orientation
            .resize({
                width: CONFIG.maxWidth,
                height: CONFIG.maxHeight,
                fit: "inside",        // Maintain aspect ratio, fit within bounds
                withoutEnlargement: true, // Don't upscale small images
            });

        // Apply format-specific compression
        const outputFormat = CONFIG.outputFormat || getFormatFromExt(ext);

        switch (outputFormat) {
            case "jpeg":
            case "jpg":
                pipeline = pipeline.jpeg({
                    quality: CONFIG.jpegQuality,
                    mozjpeg: true,     // Use mozjpeg for better compression
                });
                break;
            case "png":
                pipeline = pipeline.png({
                    compressionLevel: CONFIG.pngCompressionLevel,
                    adaptiveFiltering: true,
                });
                break;
            case "webp":
                pipeline = pipeline.webp({
                    quality: CONFIG.webpQuality,
                });
                break;
            case "gif":
                // GIF: just resize, minimal processing
                pipeline = pipeline.gif();
                break;
            default:
                pipeline = pipeline.jpeg({ quality: CONFIG.jpegQuality, mozjpeg: true });
        }

        // Process and overwrite
        const outputBuffer = await pipeline.toBuffer();

        // Only overwrite if the optimized file is actually smaller
        if (outputBuffer.length < originalSize) {
            await fs.promises.writeFile(filePath, outputBuffer);
            const reduction = ((1 - outputBuffer.length / originalSize) * 100).toFixed(1);
            return {
                originalSize,
                optimizedSize: outputBuffer.length,
                reduction: `${reduction}%`,
            };
        }

        // Original was already smaller (rare, but possible for tiny images)
        return { originalSize, optimizedSize: originalSize, reduction: "0% (sudah optimal)" };
    } catch (err) {
        // If sharp fails, keep the original file untouched
        console.warn(`⚠️ Image optimization failed for ${path.basename(filePath)}:`, err.message);
        return { originalSize, optimizedSize: originalSize, reduction: "0% (gagal)" };
    }
}

/**
 * Optimize multiple image files (from req.files).
 *
 * @param {Array<{path: string, filename: string}>} files - Multer file objects
 * @returns {Promise<Array<{filename: string, originalSize: number, optimizedSize: number, reduction: string}>>}
 */
async function optimizeUploadedFiles(files) {
    if (!files || files.length === 0) return [];

    const results = await Promise.all(
        files.map(async (file) => {
            const result = await optimizeImage(file.path);
            return {
                filename: file.filename,
                ...result,
            };
        })
    );

    // Log summary
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalReduction = totalOriginal > 0
        ? ((1 - totalOptimized / totalOriginal) * 100).toFixed(1)
        : 0;

    console.log(
        `📸 Image optimization: ${files.length} files | ` +
        `${formatBytes(totalOriginal)} → ${formatBytes(totalOptimized)} ` +
        `(${totalReduction}% smaller)`
    );

    return results;
}

/**
 * Get image format from file extension
 */
function getFormatFromExt(ext) {
    const map = {
        ".jpg": "jpeg",
        ".jpeg": "jpeg",
        ".png": "png",
        ".webp": "webp",
        ".gif": "gif",
    };
    return map[ext] || "jpeg";
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
    optimizeImage,
    optimizeUploadedFiles,
    CONFIG,
};
