/**
 * ============================================
 * SHARED CLOUDINARY CDN SERVICE
 * ============================================
 * Centralized media utility for all microservices.
 * Supports memory buffer uploads (Multer) and base64 uploads (JSON API).
 */

const { v2: cloudinary } = require("cloudinary");

// Configure Cloudinary from environment
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Check if Cloudinary is configured
 */
function isConfigured() {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

function generatePublicId(index = null) {
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

    // Generate a random 4-character string to prevent collisions
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Build publicId: YYYYMMDD_HHmmss_RAND[_INDEX]
    const suffix = index !== null ? `${rand}_${index}` : rand;

    return `${timestamp}_${suffix}`;
}

async function uploadImage(buffer, options = {}) {
    const { folder = "uploads/photos", publicId = generatePublicId() } = options;
    const originalSize = buffer.length;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: "image",
                quality: "auto:good",
                fetch_format: "auto",
                transformation: [{ width: 1920, height: 1920, crop: "limit" }],
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
                });
            }
        );

        const { Readable } = require("stream");
        Readable.from(buffer).pipe(uploadStream);
    });
}

/**
 * Upload multiple memory buffers to Cloudinary
 */
async function uploadMultipleImages(files, folder = "uploads/photos") {
    if (!files || files.length === 0) {
        throw new Error("Tidak ada file untuk diupload");
    }

    const results = await Promise.all(
        files.map((file, index) => {
            const publicId = generatePublicId(index);
            return uploadImage(file.buffer, { folder, publicId });
        })
    );

    return {
        urls: results.map((r) => r.url),
        results,
    };
}

async function uploadBase64Image(base64String, options = {}) {
    const { folder = "uploads/photos", publicId = generatePublicId() } = options;

    if (!isConfigured()) {
        console.warn("⚠️ Cloudinary not configured, skipping base64 upload.");
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(base64String, {
            folder,
            public_id: publicId,
            resource_type: "image",
            quality: "auto:good",
            fetch_format: "auto",
            transformation: [{ width: 1920, height: 1920, crop: "limit" }],
            flags: "strip_profile",
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
        };
    } catch (error) {
        console.error("❌ Cloudinary base64 upload failed:", error.message);
        throw error;
    }
}

/**
 * Process a mix of base64 data and normal URLs.
 * Uploads any base64 images and replaces them with Cloudinary URLs.
 */
async function processPhotos(photos, folder) {
    if (!photos || !Array.isArray(photos)) return [];
    if (!isConfigured()) return photos;

    return await Promise.all(
        photos.map(async (photo, index) => {
            if (typeof photo === "string" && (photo.startsWith("data:image/") || photo.startsWith("data:application/"))) {
                const result = await uploadBase64Image(photo, {
                    folder,
                    publicId: generatePublicId(index),
                });
                return result ? result.url : photo;
            }
            return photo;
        })
    );
}

/**
 * Delete a single image from Cloudinary by URL or public_id
 */
async function deleteImage(urlOrPublicId) {
    try {
        const publicId = extractPublicId(urlOrPublicId);
        if (!publicId) return { success: false };

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
 * Delete multiple images from Cloudinary
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
 * Safely delete any photos that were removed during an update
 */
async function cleanupRemovedPhotos(oldPhotos, newPhotos) {
    if (!oldPhotos || !Array.isArray(oldPhotos) || !isConfigured()) return;
    const currentUrls = new Set(newPhotos || []);
    const removedUrls = oldPhotos.filter((url) => url && !currentUrls.has(url));

    const cloudinaryUrls = removedUrls.filter((url) => url.includes("cloudinary.com"));
    if (cloudinaryUrls.length > 0) {
        await deleteMultipleImages(cloudinaryUrls);
    }
}

/**
 * Extract public_id from Cloudinary URL
 */
function extractPublicId(input) {
    if (!input) return null;
    if (!input.startsWith("http")) return input;

    try {
        const match = input.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

module.exports = {
    cloudinary,
    isConfigured,
    generatePublicId,
    uploadImage,
    uploadMultipleImages,
    uploadBase64Image,
    processPhotos,
    deleteImage,
    deleteMultipleImages,
    cleanupRemovedPhotos,
    extractPublicId,
};
