const mongoose = require("mongoose");

/**
 * Job Application Schema
 * Bridge model connecting User, Job, and Company
 * Tracks application status: pending → accepted / rejected
 */
const jobApplicationSchema = new mongoose.Schema(
    {
        userId: {
            type: String, // Clerk user ID (matches User._id)
            ref: "User",
            required: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate applications: one user can apply to a job only once
jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Index for company dashboard queries
jobApplicationSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
