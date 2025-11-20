const fs = require("fs");
const path = require("path");

function generateFileName(originalName) {
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext).replace(/[^a-z0-9_-]/gi, "_");
    const unique = Date.now();
    return `${base}-${unique}${ext}`;
}

async function deleteFile(relativePath) {
    try {
        const p = path.isAbsolute(relativePath) ? relativePath : path.join(process.cwd(), relativePath);
        if (fs.existsSync(p)) {
            await fs.promises.unlink(p);
        }
    } catch (err) {
        // log but don't throw
        console.warn("deleteFile warning:", err.message);
    }
}

module.exports = {
    generateFileName,
    deleteFile,
};
