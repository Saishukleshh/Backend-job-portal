require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// ─── Config Imports ───────────────────────────────
const connectDB = require("./config/db");
const { connectCloudinary } = require("./config/cloudinary");
const { Sentry, initSentry } = require("./config/sentry");
const { clerkMiddleware } = require("./middlewares/authUser");

// ─── Route Imports ────────────────────────────────
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const userRoutes = require("./routes/userRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// ─── Initialize Express App ──────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Initialize Sentry (MUST be first) ───────────
initSentry(app);

// ─── Webhook Route (needs RAW body, before JSON parser) ──
app.use(
    "/api/webhooks",
    express.raw({ type: "application/json" }),
    webhookRoutes
);

// ─── Global Middlewares ──────────────────────────
app.use(helmet()); // Security headers
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev")); // HTTP request logger

// ─── Clerk Middleware (parses Clerk session on every request) ──
app.use(clerkMiddleware());

// ─── API Routes ──────────────────────────────────
app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

// ─── Health Check ────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Job Portal API is running",
        version: "1.0.0",
        endpoints: {
            company: "/api/company",
            jobs: "/api/jobs",
            applications: "/api/applications",
            users: "/api/users",
            webhooks: "/api/webhooks",
        },
    });
});

// ─── 404 Handler ─────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
    });
});

// ─── Sentry Error Handler (must be after all routes) ──
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}

// ─── Global Error Handler ────────────────────────
app.use((err, req, res, next) => {
    console.error("💥 Unhandled Error:", err);

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Internal server error."
            : err.message;

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
});

// ─── Start Server ────────────────────────────────
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Configure Cloudinary
        connectCloudinary();

        // Start listening
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`──────────────────────────────────────────\n`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
