const mongoose = require("mongoose");

/**
 * Job Schema
 * Stores job listings posted by companies
 * References the Company model via companyId
 */
const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Job description is required"],
        },
        location: {
            type: String,
            required: [true, "Job location is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Job category is required"],
            enum: [
                "Programming",
                "Design",
                "Marketing",
                "Finance",
                "Management",
                "Data Science",
                "Sales",
                "Human Resources",
                "Engineering",
                "Other",
            ],
        },
        level: {
            type: String,
            required: [true, "Job level is required"],
            enum: ["Beginner", "Intermediate", "Senior", "Lead", "Director"],
        },
        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: [0, "Salary cannot be negative"],
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        visible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient filtering queries
jobSchema.index({ category: 1, level: 1, location: 1, visible: 1 });
jobSchema.index({ companyId: 1 });

module.exports = mongoose.model("Job", jobSchema);
