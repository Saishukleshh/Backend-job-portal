const Sentry = require("@sentry/node");

/**
 * Initialize Sentry for error monitoring & performance tracking
 * Call this BEFORE any other middleware or route setup
 */
const initSentry = (app) => {
    if (!process.env.SENTRY_DSN) {
        console.warn("⚠️  Sentry DSN not provided. Sentry monitoring is disabled.");
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",

        // Performance monitoring – sample 100% in dev, 20% in prod
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

        // Capture unhandled promise rejections
        integrations: [
            Sentry.mongooseIntegration(),
        ],
    });

    console.log("✅ Sentry initialized");
};

module.exports = { Sentry, initSentry };
