const { Webhook } = require("svix");
const User = require("../models/User");

/**
 * Clerk Webhook Handler
 * Listens for user.created, user.updated, user.deleted events
 * and syncs the User collection in MongoDB accordingly.
 *
 * POST /api/webhooks/clerk
 */
const handleClerkWebhook = async (req, res) => {
    try {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            console.error("CLERK_WEBHOOK_SECRET is not set");
            return res.status(500).json({ message: "Webhook secret not configured" });
        }

        // Verify the webhook signature using Svix
        const wh = new Webhook(WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // req.body must be the raw body (string or buffer)
        const payload = req.body;
        let evt;

        try {
            evt = wh.verify(payload, headers);
        } catch (err) {
            console.error("Webhook verification failed:", err.message);
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        const { type, data } = evt;

        console.log(`📩 Clerk webhook received: ${type}`);

        switch (type) {
            // ─── User Created ───────────────────────────────
            case "user.created": {
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                    email: data.email_addresses?.[0]?.email_address || "",
                    image: data.image_url || "",
                };

                await User.create(userData);
                console.log(`✅ User created: ${userData._id}`);
                break;
            }

            // ─── User Updated ───────────────────────────────
            case "user.updated": {
                const updateData = {
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                    email: data.email_addresses?.[0]?.email_address || "",
                    image: data.image_url || "",
                };

                await User.findByIdAndUpdate(data.id, updateData, { new: true });
                console.log(`✅ User updated: ${data.id}`);
                break;
            }

            // ─── User Deleted ───────────────────────────────
            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                console.log(`✅ User deleted: ${data.id}`);
                break;
            }

            default:
                console.log(`Unhandled webhook event type: ${type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return res.status(500).json({ message: "Webhook processing failed" });
    }
};

module.exports = { handleClerkWebhook };
