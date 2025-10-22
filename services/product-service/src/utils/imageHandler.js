const path = require("path");
const fs = require("fs").promises;

/**
 * Generate unique filename
 */
function generateFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = path.extname(originalName);
  const name = path
    .basename(originalName, ext)
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();
  return `${name}-${timestamp}-${random}${ext}`;
}

/**
 * Delete image file
 */
async function deleteImage(imagePath) {
  try {
    const fullPath = path.join(__dirname, "../../uploads/products", imagePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Get image URL
 */
function getImageUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/products/${filename}`;
}

module.exports = {
  generateFileName,
  deleteImage,
  getImageUrl,
};
