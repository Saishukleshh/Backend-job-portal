const express = require("express");
const router = express.Router();
const { handleClerkWebhook } = require("../controllers/webhookController");

/**
 * Clerk Webhook Endpoint
 * NOTE: This route must receive the RAW body (not parsed JSON).
 *       The raw body parser is applied in server.js BEFORE the JSON parser.
 */
router.post("/clerk", handleClerkWebhook);

module.exports = router;
