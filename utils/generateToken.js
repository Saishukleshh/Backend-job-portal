const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for company / recruiter authentication
 *
 * @param {string} companyId - The MongoDB _id of the company
 * @returns {string} Signed JWT token valid for 30 days
 */
const generateToken = (companyId) => {
    return jwt.sign({ companyId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = generateToken;
