const bcrypt = require("bcryptjs");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

/**
 * @desc    Register a new company / recruiter
 * @route   POST /api/company/register
 * @access  Public
 */
const registerCompany = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password.",
            });
        }

        // Check if company already exists
        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "A company with this email already exists.",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload company logo if provided
        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, "company-logos");
        }

        // Create company
        const company = await Company.create({
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
        });

        // Generate JWT
        const token = generateToken(company._id);

        return res.status(201).json({
            success: true,
            message: "Company registered successfully.",
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
            },
            token,
        });
    } catch (error) {
        console.error("Register company error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Could not register company.",
        });
    }
};

/**
 * @desc    Login company / recruiter
 * @route   POST /api/company/login
 * @access  Public
 */
const loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password.",
            });
        }

        // Find company (include password for comparison)
        const company = await Company.findOne({ email }).select("+password");
        if (!company) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        // Generate JWT
        const token = generateToken(company._id);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
            },
            token,
        });
    } catch (error) {
        console.error("Login company error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Could not login.",
        });
    }
};

/**
 * @desc    Get logged-in company profile
 * @route   GET /api/company/profile
 * @access  Private (Company)
 */
const getCompanyProfile = async (req, res) => {
    try {
        const company = req.company; // Attached by authCompany middleware

        return res.status(200).json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
                createdAt: company.createdAt,
            },
        });
    } catch (error) {
        console.error("Get company profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

/**
 * @desc    Update company profile (name, logo)
 * @route   PUT /api/company/profile
 * @access  Private (Company)
 */
const updateCompanyProfile = async (req, res) => {
    try {
        const company = req.company;
        const { name } = req.body;

        if (name) company.name = name;

        // Upload new logo if provided
        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer, "company-logos");
            company.image = imageUrl;
        }

        await company.save();

        return res.status(200).json({
            success: true,
            message: "Company profile updated.",
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
            },
        });
    } catch (error) {
        console.error("Update company profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

module.exports = {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
};
