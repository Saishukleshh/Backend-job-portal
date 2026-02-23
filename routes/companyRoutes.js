const express = require("express");
const router = express.Router();
const {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
} = require("../controllers/companyController");
const authCompany = require("../middlewares/authCompany");
const { uploadImage } = require("../middlewares/multer");

// ─── Public Routes ────────────────────────────────
router.post("/register", uploadImage, registerCompany);
router.post("/login", loginCompany);

// ─── Protected Routes (Company Auth) ─────────────
router.get("/profile", authCompany, getCompanyProfile);
router.put("/profile", authCompany, uploadImage, updateCompanyProfile);

module.exports = router;
