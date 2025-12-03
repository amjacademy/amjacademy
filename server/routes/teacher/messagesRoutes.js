const express = require("express");
const router = express.Router();
const messagesController = require("../../controllers/teacher/messagesControllers");
const asyncHandler = require("../../utils/asyncHandler");
const messagesModel = require("../../models/teacher/messagesModels");

// MY STUDENTS LIST FOR TEACHER
router.get("/my-students", asyncHandler(messagesController.getMyStudents));

// CREATE / GET CONVERSATION
router.post(
  "/conversation",
  asyncHandler(messagesController.createOrGetConversation)
);

// FETCH MESSAGES
router.get(
  "/messages/:conversationId",
  asyncHandler(messagesController.getMessages)
);

// SEND MESSAGE
router.post("/send", asyncHandler(messagesController.sendMessage));

// MARK DELIVERED
router.post("/delivered", asyncHandler(messagesController.markDelivered));

// MARK READ
router.post("/read", asyncHandler(messagesController.markRead));

// UPDATE TYPING
router.post("/typing", asyncHandler(messagesController.setTyping));

// UPDATE LAST SEEN
router.post("/last-seen", asyncHandler(messagesController.updateLastSeen));

router.get("/my-chats", asyncHandler(messagesController.getMyChatsForTeacher));

router.get(
  "/unread-count",
  asyncHandler(async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const count = await messagesModel.getTotalUnreadCount(userId);
    res.json({ success: true, unreadCount: count });
  })
);

router.get(
  "/presence/:userId",
  asyncHandler(async (req, res) => {
    const data = await messagesModel.getPresence(req.params.userId);
    res.json(data);
  })
);

router.get("/message/:id", messagesController.getMessageById);

module.exports = router;
