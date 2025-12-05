// controllers/messagesControllers.js
const messagesModel = require("../models/messagesModels");
const asyncHandler = require("../utils/asyncHandler");
const { messageUploadFile } = require("../config/cloudinaryConfig");

// Create or get conversation between two users
exports.createOrGetConversation = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body;
  const userId = req.user?.id || req.body.userId || req.query.userId;

  if (!userId || !otherUserId) {
    return res
      .status(400)
      .json({ error: "userId and otherUserId are required" });
  }

  console.log(
    "🟦 createOrGetConversation | userId:",
    userId,
    "otherUserId:",
    otherUserId
  );

  const conversation = await messagesModel.getOrCreateConversation(
    userId,
    otherUserId
  );

  console.log("🟩 conversation result:", conversation);

  res.json(conversation);
});

// Send a message
exports.sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user?.id || req.body.senderId;

  if (!senderId) {
    return res.status(400).json({ error: "senderId is required" });
  }

  const {
    conversationId,
    content,
    type,
    fileUrl, // ADD THIS
    thumbnailUrl,
    fileName,
    fileSize,
  } = req.body;

  if (!conversationId || !type) {
    return res
      .status(400)
      .json({ error: "conversationId and type are required" });
  }

  const msg = await messagesModel.sendMessage({
    senderId,
    conversationId,
    content,
    type,
    fileUrl, // ADD THIS
    thumbnailUrl,
    fileName,
    fileSize,
  });

  res.status(201).json(msg);
});

// Mark message as read
exports.markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { messageId, conversationId } = req.body;

  if (!userId || !messageId || !conversationId) {
    return res.status(400).json({
      error: "userId, messageId and conversationId are required",
    });
  }

  await messagesModel.markRead(userId, messageId, conversationId);
  res.json({ ok: true });
});

// Mark all messages in a conversation as delivered for a user
exports.markAsDelivered = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId || req.query.userId;
  const { conversationId } = req.body;

  if (!userId || !conversationId) {
    return res
      .status(400)
      .json({ error: "userId and conversationId are required" });
  }

  await messagesModel.markDelivered(userId, conversationId);
  res.json({ ok: true });
});

// Get all teachers assigned to student (based on arrangements table)
exports.getMyTeachers = asyncHandler(async (req, res) => {
  const studentId = req.userId;

  if (!studentId) {
    return res.status(400).json({ error: "studentId required" });
  }

  try {
    const teachers = await messagesModel.getTeachersForStudent(studentId);
    res.json(teachers);
  } catch (err) {
    console.error("🔥 REAL SUPABASE ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages of a conversation
exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ error: "conversationId is required" });
  }

  const messages = await messagesModel.getMessages(conversationId);
  res.json(messages);
});

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const cloudinaryResult = await messageUploadFile(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
    console.log("CLOUDINARY RESULT:", cloudinaryResult);
    res.json({
      fileUrl: cloudinaryResult.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    console.error("Message File Upload Error:", err);
    return res.status(500).json({ error: "Failed to upload file" });
  }
};

// Get chat history for a user (only teachers student has chatted with)
exports.getMyChats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const chats = await messagesModel.getChatHistory(userId);
    res.json(chats);
  } catch (err) {
    console.error("🔥 getMyChats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------------------------------------
// UPDATE LAST SEEN (used for "Online / last seen")
// --------------------------------------------------
exports.updateLastSeen = asyncHandler(async (req, res) => {
  const userId=req.userId;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  await messagesModel.updateLastSeen(userId);
  res.json({ success: true });
});

// --------------------------------------------------
// SET TYPING STATUS
// --------------------------------------------------
exports.setTyping = asyncHandler(async (req, res) => {
  const { conversationId, userId, isTyping } = req.body;

  if (!conversationId || !userId) {
    return res
      .status(400)
      .json({ error: "conversationId and userId are required" });
  }

  await messagesModel.setTyping(conversationId, userId, isTyping);
  res.json({ success: true });
});

// --------------------------------------------------
// GET PRESENCE (is_typing, last_seen_at)
// --------------------------------------------------
exports.getPresence = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const data = await messagesModel.getPresence(userId);
  res.json(data);
});

// --------------------------------------------------
// GET TOTAL UNREAD MESSAGE COUNT
// --------------------------------------------------
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const count = await messagesModel.getTotalUnreadCount(userId);
  res.json({ success: true, unreadCount: count });
});
