// routes/messagesRoutes.js
const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesControllers");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// STATIC ROUTES FIRST — ALWAYS FIRST
router.get("/my-chats", messagesController.getMyChats);
router.get("/my-teachers", messagesController.getMyTeachers);
router.get("/unread-count", messagesController.getUnreadCount);

// Send message
router.post("/send", messagesController.sendMessage);

// Mark read
router.post("/read", messagesController.markAsRead);

// Mark delivered
router.post("/delivered", messagesController.markAsDelivered);

// Create or get conversation
router.post("/conversation", messagesController.createOrGetConversation);

// Upload file
router.post("/upload", upload.single("file"), messagesController.uploadFile);

// Update last seen (for presence/online status)
router.post("/last-seen", messagesController.updateLastSeen);

// Update typing status
router.post("/typing", messagesController.setTyping);

// Get presence info
router.get("/presence/:userId", messagesController.getPresence);

// ⛔ MUST BE LAST — DYNAMIC ROUTE
router.get("/:conversationId", messagesController.getMessages);

module.exports = router;
