const jwt = require("jsonwebtoken");
const Company = require("../models/Company");

/**
 * Company / Recruiter Auth Middleware (Custom JWT)
 *
 * Expects: Authorization: Bearer <token>
 * Decodes the JWT, fetches the company document,
 * and attaches it to req.company
 */
const authCompany = async (req, res, next) => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Token missing.",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch company (excluding password)
        const company = await Company.findById(decoded.companyId);

        if (!company) {
            return res.status(401).json({
                success: false,
                message: "Company not found. Token invalid.",
            });
        }

        req.company = company;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please log in again.",
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }
        console.error("Company auth error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};

module.exports = authCompany;
