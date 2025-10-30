const express = require("express");
const router = express.Router();
const { adminAuth } = require("../utils/authController");
const { send, receive, remove } = require("../controllers/announcementController");

// POST: create announcement
router.post("/send",adminAuth, send);

// GET: fetch announcements for role
router.get("/receive",adminAuth, receive);

// DELETE: delete announcement by ID
router.delete("/remove/:id",adminAuth, remove);

module.exports = router;
