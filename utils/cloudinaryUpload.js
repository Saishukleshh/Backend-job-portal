const { cloudinary } = require("../config/cloudinary");

/**
 * Upload a file buffer to Cloudinary
 *
 * @param {Buffer}  buffer     - File buffer from Multer memory storage
 * @param {string}  folder     - Cloudinary folder name (e.g., "company-logos", "resumes")
 * @param {string}  resourceType - "image" or "raw" (for PDFs)
 * @returns {Promise<string>}  - The secure URL of the uploaded file
 */
const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `job-portal/${folder}`,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    reject(new Error(`Cloudinary upload failed: ${error.message}`));
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        stream.end(buffer);
    });
};

/**
 * Delete a file from Cloudinary by its public URL
 *
 * @param {string} url          - The Cloudinary URL
 * @param {string} resourceType - "image" or "raw"
 */
const deleteFromCloudinary = async (url, resourceType = "image") => {
    if (!url) return;

    try {
        // Extract public_id from the URL
        const parts = url.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) return;

        // public_id is everything after "upload/vXXXXX/" without the extension
        const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    } catch (error) {
        console.error("Cloudinary delete error:", error.message);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
