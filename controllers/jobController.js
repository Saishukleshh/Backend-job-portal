const Job = require("../models/Job");

/**
 * @desc    Create a new job listing
 * @route   POST /api/jobs
 * @access  Private (Company)
 */
const createJob = async (req, res) => {
    try {
        const { title, description, location, category, level, salary } = req.body;
        const companyId = req.company._id;

        // Validate required fields
        if (!title || !description || !location || !category || !level || salary === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: title, description, location, category, level, salary.",
            });
        }

        const job = await Job.create({
            title,
            description,
            location,
            category,
            level,
            salary: Number(salary),
            companyId,
        });

        return res.status(201).json({
            success: true,
            message: "Job created successfully.",
            job,
        });
    } catch (error) {
        console.error("Create job error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Could not create job.",
        });
    }
};

/**
 * @desc    Get all visible jobs (with optional filters)
 * @route   GET /api/jobs
 * @access  Public
 *
 * Query params:
 *   ?category=Programming&level=Senior&location=Remote&search=react&page=1&limit=10
 */
const getJobs = async (req, res) => {
    try {
        const { category, level, location, search, page = 1, limit = 10 } = req.query;

        // Build filter object
        const filter = { visible: true };

        if (category) {
            filter.category = category;
        }
        if (level) {
            filter.level = level;
        }
        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [jobs, total] = await Promise.all([
            Job.find(filter)
                .populate("companyId", "name image") // Populate company name & logo
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Job.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            jobs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Get jobs error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Could not fetch jobs.",
        });
    }
};

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate(
            "companyId",
            "name email image"
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }

        return res.status(200).json({
            success: true,
            job,
        });
    } catch (error) {
        console.error("Get job by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Get all jobs posted by the logged-in company
 * @route   GET /api/jobs/company
 * @access  Private (Company)
 */
const getCompanyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ companyId: req.company._id }).sort({
            date: -1,
        });

        return res.status(200).json({
            success: true,
            jobs,
            total: jobs.length,
        });
    } catch (error) {
        console.error("Get company jobs error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Update a job listing
 * @route   PUT /api/jobs/:id
 * @access  Private (Company – owner only)
 */
const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }

        // Ensure the company owns this job
        if (job.companyId.toString() !== req.company._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this job.",
            });
        }

        const allowedFields = [
            "title",
            "description",
            "location",
            "category",
            "level",
            "salary",
            "visible",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        await job.save();

        return res.status(200).json({
            success: true,
            message: "Job updated successfully.",
            job,
        });
    } catch (error) {
        console.error("Update job error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Delete a job listing
 * @route   DELETE /api/jobs/:id
 * @access  Private (Company – owner only)
 */
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }

        // Ensure the company owns this job
        if (job.companyId.toString() !== req.company._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this job.",
            });
        }

        await job.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Job deleted successfully.",
        });
    } catch (error) {
        console.error("Delete job error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Toggle job visibility
 * @route   PATCH /api/jobs/:id/visibility
 * @access  Private (Company – owner only)
 */
const toggleJobVisibility = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }

        if (job.companyId.toString() !== req.company._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized.",
            });
        }

        job.visible = !job.visible;
        await job.save();

        return res.status(200).json({
            success: true,
            message: `Job is now ${job.visible ? "visible" : "hidden"}.`,
            visible: job.visible,
        });
    } catch (error) {
        console.error("Toggle visibility error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    getCompanyJobs,
    updateJob,
    deleteJob,
    toggleJobVisibility,
};
