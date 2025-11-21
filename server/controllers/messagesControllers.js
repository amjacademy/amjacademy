// controllers/messagesControllers.js
const messagesModel = require("../models/messagesModels");
const asyncHandler = require("../utils/asyncHandler");
const { streamUpload } = require("../config/cloudinaryConfig");

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
  fileUrl,        // ADD THIS
  thumbnailUrl,
  fileName,
  fileSize
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
  fileUrl,        // ADD THIS
  thumbnailUrl,
  fileName,
  fileSize
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
  const studentId = req.query.studentId;

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

    // Upload to Cloudinary using buffer
    const cloudinaryResult = await streamUpload(req.file.buffer);

    const secureUrl = cloudinaryResult.secure_url;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const mime = req.file.mimetype;

    return res.json({
      fileUrl: secureUrl,
      fileName: originalName,
      fileSize: fileSize,
      mimeType: mime,
    });
  } catch (err) {
    console.error("Message File Upload Error:", err);
    return res.status(500).json({ error: "Failed to upload file" });
  }
};
