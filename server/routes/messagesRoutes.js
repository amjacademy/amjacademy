// routes/messagesRoutes.js
const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesControllers");
const multer = require("multer");
const {userAuth} = require("../utils/authController");
const upload = multer({ storage: multer.memoryStorage() });

// STATIC ROUTES FIRST — ALWAYS FIRST
router.get("/my-chats",userAuth("student"), messagesController.getMyChats);
router.get("/my-teachers",userAuth("student"), messagesController.getMyTeachers);
router.get("/unread-count",userAuth(), messagesController.getUnreadCount);

// Send message
router.post("/send",userAuth("student"), messagesController.sendMessage);
// Mark read
router.post("/read",userAuth("student"), messagesController.markAsRead);

// Mark delivered
router.post("/delivered",userAuth("student"), messagesController.markAsDelivered);

// Create or get conversation
router.post("/conversation",userAuth("student"), messagesController.createOrGetConversation);

// Upload file
router.post("/upload", userAuth("student"), upload.single("file"), messagesController.uploadFile);

// Update last seen (for presence/online status)
router.post("/last-seen",userAuth("student"), messagesController.updateLastSeen);

// Update typing status
router.post("/typing",userAuth("student"), messagesController.setTyping);

// Get presence info
router.get("/presence/:userId",userAuth("student"), messagesController.getPresence);

// ⛔ MUST BE LAST — DYNAMIC ROUTE
router.get("/:conversationId",userAuth("student"),messagesController.getMessages);

module.exports = router;
