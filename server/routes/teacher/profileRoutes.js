// profileRoutes.js
const express = require("express");
const router = express.Router();

const {
  getProfile,
  uploadMedia,
  uploadAvatar,
  getMedia,
} = require("../../controllers/teacher/profileControllers");

const multer = require("multer");
const memoryStorage = multer.memoryStorage(); // keep files in memory
const upload = multer({ memoryStorage });
const { parser } = require("../../config/cloudinaryConfig");

// PROFILE
router.get("/:userId", getProfile);

// MEDIA UPLOAD
router.post("/media/:userId/upload", parser.single("file"), uploadMedia);

// AVATAR UPLOAD
router.post("/avatar/:userId", upload.single("avatar"), uploadAvatar);

// GET MEDIA LIST
router.get("/media/:userId", getMedia);

module.exports = router;
