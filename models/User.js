const mongoose = require("mongoose");

/**
 * User Schema
 * Stores job seekers authenticated via Clerk
 * The _id matches the Clerk user ID for easy lookup
 */
const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true, // Clerk user ID (e.g., "user_2xYz...")
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        resume: {
            type: String, // Cloudinary URL to the uploaded PDF resume
            default: "",
        },
    },
    {
        timestamps: true,
        _id: false, // We manually set _id to the Clerk user ID
    }
);

module.exports = mongoose.model("User", userSchema);
