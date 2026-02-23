const express = require("express");
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobById,
    getCompanyJobs,
    updateJob,
    deleteJob,
    toggleJobVisibility,
} = require("../controllers/jobController");
const authCompany = require("../middlewares/authCompany");

// ─── Public Routes ────────────────────────────────
router.get("/", getJobs); // GET /api/jobs?category=...&level=...&search=...
router.get("/:id", getJobById);

// ─── Protected Routes (Company Auth) ─────────────
router.post("/", authCompany, createJob);
router.get("/company/list", authCompany, getCompanyJobs);
router.put("/:id", authCompany, updateJob);
router.delete("/:id", authCompany, deleteJob);
router.patch("/:id/visibility", authCompany, toggleJobVisibility);

module.exports = router;
