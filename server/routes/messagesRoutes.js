// routes/messagesRoutes.js
const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesControllers");
// const auth = require("../middleware/auth"); // if you add auth later
const multer = require("multer");

// memoryStorage → file.buffer
const upload = multer({ storage: multer.memoryStorage() });

// If you enable auth later:
// router.use(auth);

// Get teachers assigned to student
router.get("/my-teachers", messagesController.getMyTeachers);

// Get conversation messages
router.get("/:conversationId", messagesController.getMessages);

// Send a message
router.post("/send", messagesController.sendMessage);

// Mark message as read
router.post("/read", messagesController.markAsRead);

// Mark messages as delivered for a user in a conversation
router.post("/delivered", messagesController.markAsDelivered);

// Create or get conversation between logged in user & other user
router.post("/conversation", messagesController.createOrGetConversation);

// Upload file for message
router.post("/upload", upload.single("file"), messagesController.uploadFile);

module.exports = router;
