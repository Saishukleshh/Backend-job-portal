const mongoose = require("mongoose");

/**
 * Company Schema
 * Stores recruiter / company accounts with custom JWT auth
 * Passwords are hashed with bcrypt before saving (handled in controller)
 */
const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Company email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Never return password in queries by default
        },
        image: {
            type: String, // Cloudinary URL for company logo
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Company", companySchema);
