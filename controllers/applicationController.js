const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");

/**
 * @desc    Apply for a job
 * @route   POST /api/applications/:jobId
 * @access  Private (User / Clerk)
 */
const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.userId; // Set by authUser middleware (Clerk)

        // Check if the job exists and is visible
        const job = await Job.findById(jobId);
        if (!job || !job.visible) {
            return res.status(404).json({
                success: false,
                message: "Job not found or is no longer accepting applications.",
            });
        }

        // Check if user already applied
        const existingApplication = await JobApplication.findOne({
            userId,
            jobId,
        });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job.",
            });
        }

        // Create the application
        const application = await JobApplication.create({
            userId,
            jobId: job._id,
            companyId: job.companyId,
        });

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            application,
        });
    } catch (error) {
        console.error("Apply for job error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Could not submit application.",
        });
    }
};

/**
 * @desc    Get all applications for the logged-in user
 * @route   GET /api/applications/user
 * @access  Private (User / Clerk)
 */
const getUserApplications = async (req, res) => {
    try {
        const userId = req.userId;

        const applications = await JobApplication.find({ userId })
            .populate({
                path: "jobId",
                select: "title location category level salary date companyId",
                populate: {
                    path: "companyId",
                    select: "name image",
                },
            })
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            applications,
            total: applications.length,
        });
    } catch (error) {
        console.error("Get user applications error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Get all applications for a specific job (recruiter view)
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Company)
 */
const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.company._id;

        // Verify the job belongs to this company
        const job = await Job.findById(jobId);
        if (!job || job.companyId.toString() !== companyId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view applications for this job.",
            });
        }

        const applications = await JobApplication.find({ jobId })
            .populate("userId", "name email image resume")
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            applications,
            total: applications.length,
        });
    } catch (error) {
        console.error("Get job applications error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Get all applications for the logged-in company (across all jobs)
 * @route   GET /api/applications/company
 * @access  Private (Company)
 */
const getCompanyApplications = async (req, res) => {
    try {
        const companyId = req.company._id;

        const applications = await JobApplication.find({ companyId })
            .populate("userId", "name email image resume")
            .populate("jobId", "title location category level")
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            applications,
            total: applications.length,
        });
    } catch (error) {
        console.error("Get company applications error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Update application status (accept / reject)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Company)
 */
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const companyId = req.company._id;

        // Validate status
        if (!["accepted", "rejected", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'pending', 'accepted', or 'rejected'.",
            });
        }

        const application = await JobApplication.findById(id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }

        // Ensure the company owns this application
        if (application.companyId.toString() !== companyId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this application.",
            });
        }

        application.status = status;
        await application.save();

        return res.status(200).json({
            success: true,
            message: `Application ${status}.`,
            application,
        });
    } catch (error) {
        console.error("Update application status error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

module.exports = {
    applyForJob,
    getUserApplications,
    getJobApplications,
    getCompanyApplications,
    updateApplicationStatus,
};
