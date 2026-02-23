const { clerkMiddleware, getAuth } = require("@clerk/express");

/**
 * Clerk Auth Middleware for regular Users (Job Seekers)
 *
 * 1. clerkMiddleware() – parses and attaches Clerk session data to req
 * 2. authUser        – extracts userId from the session; rejects if missing
 */

/**
 * Protect routes for authenticated Clerk users
 * Attaches req.userId (Clerk ID) to the request
 */
const authUser = (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please log in.",
            });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error("Clerk auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};

module.exports = { clerkMiddleware, authUser };
