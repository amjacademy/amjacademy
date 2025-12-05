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
const {userAuth} = require("../utils/authController");

// PROFILE
router.get("/profile",userAuth("student"),  getProfile);

// STORY CHARACTERS
router.get("/story-characters",userAuth("student"), getStoryCharacters);

// MEDIA UPLOAD
router.post("/media/upload",userAuth("student"),  parser.single("file"), uploadMedia);

// AVATAR UPLOAD
router.post("/profile/avatar",userAuth("student"),  upload.single("avatar"), uploadAvatar);

// GET MEDIA LIST
router.get("/media",userAuth("student"),  getMedia);

module.exports = router;
