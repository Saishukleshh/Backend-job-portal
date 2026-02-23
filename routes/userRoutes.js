const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    uploadResume,
} = require("../controllers/userController");
const { authUser } = require("../middlewares/authUser");
const { uploadResume: uploadResumeMiddleware } = require("../middlewares/multer");

// ─── All routes require Clerk authentication ─────
router.get("/profile", authUser, getUserProfile);
router.put("/profile", authUser, updateUserProfile);
router.post("/resume", authUser, uploadResumeMiddleware, uploadResume);

module.exports = router;
