const express = require("express");
const router = express.Router();
const {
    applyForJob,
    getUserApplications,
    getJobApplications,
    getCompanyApplications,
    updateApplicationStatus,
} = require("../controllers/applicationController");
const { authUser } = require("../middlewares/authUser");
const authCompany = require("../middlewares/authCompany");

// ─── User Routes (Clerk Auth) ────────────────────
router.post("/:jobId", authUser, applyForJob);
router.get("/user", authUser, getUserApplications);

// ─── Company Routes (JWT Auth) ───────────────────
router.get("/company", authCompany, getCompanyApplications);
router.get("/job/:jobId", authCompany, getJobApplications);
router.patch("/:id/status", authCompany, updateApplicationStatus);

module.exports = router;
