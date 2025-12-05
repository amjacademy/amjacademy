const express = require("express");
const router = express.Router();
const messagesController = require("../../controllers/teacher/messagesControllers");
const asyncHandler = require("../../utils/asyncHandler");
const messagesModel = require("../../models/teacher/messagesModels");
const { userAuth } = require("../../utils/authController");

// MY STUDENTS LIST FOR TEACHER
router.get(
  "/my-students",
  userAuth("teacher"),
  asyncHandler(messagesController.getMyStudents)
);

// CREATE / GET CONVERSATION
router.post(
  "/conversation",
  userAuth("teacher"),
  asyncHandler(messagesController.createOrGetConversation)
);

// FETCH MESSAGES
router.get(
  "/messages/:conversationId",
  userAuth("teacher"),
  asyncHandler(messagesController.getMessages)
);

// SEND MESSAGE
router.post(
  "/send",
  userAuth("teacher"),
  asyncHandler(messagesController.sendMessage)
);

// MARK DELIVERED
router.post(
  "/delivered",
  userAuth("teacher"),
  asyncHandler(messagesController.markDelivered)
);

// MARK READ
router.post(
  "/read",
  userAuth("teacher"),
  asyncHandler(messagesController.markRead)
);

// UPDATE TYPING
router.post(
  "/typing",
  userAuth("teacher"),
  asyncHandler(messagesController.setTyping)
);

// UPDATE LAST SEEN
router.post(
  "/last-seen",
  userAuth("teacher"),
  asyncHandler(messagesController.updateLastSeen)
);

router.get(
  "/my-chats",
  userAuth("teacher"),
  asyncHandler(messagesController.getMyChatsForTeacher)
);

router.get(
  "/unread-count",
  userAuth("teacher"),
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const count = await messagesModel.getTotalUnreadCount(userId);
    res.json({ success: true, unreadCount: count });
  })
);

router.get(
  "/presence/:userId",
  userAuth("teacher"),
  asyncHandler(async (req, res) => {
    const data = await messagesModel.getPresence(req.params.userId);
    res.json(data);
  })
);

router.get(
  "/message/:id",
  userAuth("teacher"),
  messagesController.getMessageById
);

module.exports = router;
