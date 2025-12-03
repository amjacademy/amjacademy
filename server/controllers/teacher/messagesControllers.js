const messagesModel = require("../../models/teacher/messagesModels");
const supabase = require("../../config/supabaseClient");

// --------------------------------------------------
// MY STUDENTS LIST FOR TEACHER
// --------------------------------------------------
exports.getMyStudents = async (req, res) => {
  const { teacherId } = req.query;

  const students = await messagesModel.getStudentsForTeacher(teacherId);

  return res.json({
    success: true,
    students,
  });
};

// --------------------------------------------------
// CREATE OR GET CONVERSATION
// --------------------------------------------------
exports.createOrGetConversation = async (req, res) => {
  const { teacherId, studentId } = req.body;

  const convId = await messagesModel.getOrCreateConversation(
    teacherId,
    studentId
  );

  res.json({
    success: true,
    conversationId: convId,
  });
};

// --------------------------------------------------
// GET MESSAGES  (now includes message_statuses)
// --------------------------------------------------
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  const messages = await messagesModel.getMessagesByConversation(
    conversationId
  );

  res.json({
    success: true,
    messages,
  });
};

// --------------------------------------------------
// SEND MESSAGE (text/file)
// --------------------------------------------------
exports.sendMessage = async (req, res) => {
  const {
    conversation_id,
    sender_id,
    content,
    type,
    file_url,
    thumbnail_url,
    file_name,
    file_size,
  } = req.body;

  const msgId = await messagesModel.sendMessage({
    conversation_id,
    sender_id,
    content,
    type,
    file_url,
    thumbnail_url,
    file_name,
    file_size,
  });

  // ⭐ Return full message data so UI can display it properly
  res.json({
    success: true,
    messageId: msgId,
    id: msgId,
    conversation_id,
    sender_id,
    content,
    type: type || "text",
    file_url,
    thumbnail_url,
    file_name,
    file_size,
    created_at: new Date().toISOString(),
    message_statuses: [],
  });
};

// --------------------------------------------------
// MARK DELIVERED ✓✓
// --------------------------------------------------
exports.markDelivered = async (req, res) => {
  const { messageId, userId } = req.body;

  await messagesModel.markDelivered(messageId, userId);

  res.json({ success: true });
};

// --------------------------------------------------
// MARK READ ✓✓ blue
// --------------------------------------------------
exports.markRead = async (req, res) => {
  const { conversationId, userId, messageId } = req.body;

  await messagesModel.markRead(conversationId, userId, messageId);

  res.json({ success: true });
};

// --------------------------------------------------
// SET TYPING (realtime)
// --------------------------------------------------
exports.setTyping = async (req, res) => {
  const { conversationId, userId, isTyping } = req.body;

  await messagesModel.setTyping(conversationId, userId, isTyping);

  res.json({ success: true });
};

// --------------------------------------------------
// UPDATE LAST SEEN (used for “Online / last seen”)
// --------------------------------------------------
exports.updateLastSeen = async (req, res) => {
  const { conversationId, userId } = req.body;

  await messagesModel.updateLastSeen(conversationId, userId);

  res.json({ success: true });
};

// --------------------------------------------------
// PRESENCE (is_typing, last_seen_at)
// --------------------------------------------------
exports.getPresence = async (req, res) => {
  const { userId } = req.params;

  const data = await messagesModel.getPresence(userId);

  res.json({
    success: true,
    presence: data,
  });
};

// --------------------------------------------------
// MY CHATS HISTORY (left sidebar) — FAST + FIXED
// --------------------------------------------------
exports.getMyChatsForTeacher = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const chats = await messagesModel.getTeacherChatHistory(userId);
    res.json({
      success: true,
      chats,
    });
  } catch (err) {
    console.error("🔥 getMyChatsForTeacher error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessageById = async (req, res) => {
  const msgId = req.params.id;
  const msg = await messagesModel.getMessageById(msgId);
  res.json(msg);
};
