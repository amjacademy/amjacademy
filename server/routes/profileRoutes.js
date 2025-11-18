// profileRoutes.js
const express = require("express");
const router = express.Router();

const {
  getProfile,
  getStoryCharacters,
  uploadMedia,
  uploadAvatar,
  getMedia,
} = require("../controllers/profileControllers");

const multer = require("multer");
const memoryStorage = multer.memoryStorage(); // keep files in memory
const upload = multer({ memoryStorage });
const { parser } = require("../config/cloudinaryConfig");

// PROFILE
router.get("/profile/:userId", getProfile);

// STORY CHARACTERS
router.get("/story-characters", getStoryCharacters);

// MEDIA UPLOAD
router.post("/media/:userId/upload", parser.single("file"), uploadMedia);

// AVATAR UPLOAD
router.post("/profile/:userId/avatar", upload.single("avatar"), uploadAvatar);

// GET MEDIA LIST
router.get("/media/:userId", getMedia);

module.exports = router;
