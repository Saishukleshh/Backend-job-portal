const multer = require("multer");
const path = require("path");

/**
 * Multer configuration for file uploads
 * - Uses memory storage (files stored as buffer for Cloudinary upload)
 * - Separate upload handlers for images and resumes
 */

const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed."));
    }
};

// File filter for resumes (PDF only)
const resumeFilter = (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = file.mimetype === "application/pdf";

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed for resumes."));
    }
};

// Upload middleware for company logo images (max 5MB)
const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("image");

// Upload middleware for user resumes (max 10MB)
const uploadResume = multer({
    storage,
    fileFilter: resumeFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single("resume");

/**
 * Wrapper to handle Multer errors gracefully
 */
const handleMulterError = (uploadFn) => {
    return (req, res, next) => {
        uploadFn(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File too large.",
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`,
                });
            }
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
            next();
        });
    };
};

module.exports = {
    uploadImage: handleMulterError(uploadImage),
    uploadResume: handleMulterError(uploadResume),
};
