const User = require("../models/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private (User / Clerk)
 */
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please complete registration.",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Update user profile (name, image)
 * @route   PUT /api/users/profile
 * @access  Private (User / Clerk)
 */
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const { name } = req.body;
        if (name) user.name = name;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user,
        });
    } catch (error) {
        console.error("Update user profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Upload / update user resume (PDF)
 * @route   POST /api/users/resume
 * @access  Private (User / Clerk)
 */
const uploadResume = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file.",
            });
        }

        // Delete old resume from Cloudinary if it exists
        if (user.resume) {
            await deleteFromCloudinary(user.resume, "raw");
        }

        // Upload new resume to Cloudinary as raw file
        const resumeUrl = await uploadToCloudinary(
            req.file.buffer,
            "resumes",
            "raw"
        );

        user.resume = resumeUrl;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully.",
            resume: resumeUrl,
        });
    } catch (error) {
        console.error("Upload resume error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Could not upload resume.",
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    uploadResume,
};
