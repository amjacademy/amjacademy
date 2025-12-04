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
const {userAuth} = require("../../utils/authController");
// PROFILE
router.get("/:userId",userAuth("teacher"),  getProfile);

// MEDIA UPLOAD
router.post("/media/:userId/upload",userAuth("teacher"),  parser.single("file"), uploadMedia);

// AVATAR UPLOAD
router.post("/avatar/:userId",userAuth("teacher"),  upload.single("avatar"), uploadAvatar);

// GET MEDIA LIST
router.get("/media/:userId",userAuth("teacher"),  getMedia);

module.exports = router;
