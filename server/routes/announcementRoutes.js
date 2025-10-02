const express = require("express");
const router = express.Router();

const { send, receive, remove } = require("../controllers/announcementController");

// POST: create announcement
router.post("/send", send);

// GET: fetch announcements for role
router.get("/receive/:role", receive);

// DELETE: delete announcement by ID
router.delete("/remove/:id", remove);

module.exports = router;
