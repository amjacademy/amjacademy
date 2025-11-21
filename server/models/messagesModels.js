// models/messagesModels.js
const { supabase } = require("../config/supabaseClient.js");

// ─────────────────────────────────────────────
// 1. Create or Get Conversation
// ─────────────────────────────────────────────
exports.getOrCreateConversation = async (userA, userB) => {
  console.log("🟦 getOrCreateConversation called with:", userA, userB);

  // Find all conversations where userA participates
  const { data: conversations, error: convErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userA);

  if (convErr) {
    console.error("🔥 Supabase error (find conversations):", convErr);
    throw convErr;
  }

  console.log("🟩 found existing conversations:", conversations);

  // Check if any of those conversations also include userB
  for (const conv of conversations || []) {
    const { count, error } = await supabase
      .from("conversation_participants")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conv.conversation_id)
      .eq("user_id", userB);

    if (error) {
      console.error("🔥 Supabase error (check participant):", error);
      throw error;
    }

    if (count === 1) {
      console.log("🟩 Conversation exists:", conv.conversation_id);
      return { conversation_id: conv.conversation_id };
    }
  }

  // Create new conversation
  console.log("🟧 Creating new conversation...");

  const { data: newConv, error: newErr } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single();

  if (newErr) {
    console.error("🔥 Supabase error (create conversation):", newErr);
    throw newErr;
  }

  console.log("🟩 New conversation created:", newConv);

  // Insert participants (userA: student, userB: teacher) – roles are for display only
  const { error: partErr } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: newConv.id, user_id: userA, role: "student" },
      { conversation_id: newConv.id, user_id: userB, role: "teacher" },
    ]);

  if (partErr) {
    console.error("🔥 Supabase error (insert participants):", partErr);
    throw partErr;
  }

  console.log("🟩 Participants inserted");

  return { conversation_id: newConv.id };
};

// ─────────────────────────────────────────────
// 2. Get all messages of a conversation
// ─────────────────────────────────────────────
exports.getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("🔥 Supabase error (getMessages):", error);
    throw error;
  }

  return data || [];
};

// ─────────────────────────────────────────────
// 3. Send a Message
// ─────────────────────────────────────────────
exports.sendMessage = async (msg) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: msg.conversationId,
        sender_id: msg.senderId,
        content: msg.content,
        type: msg.type,
        file_url: msg.fileUrl,
        thumbnail_url: msg.thumbnailUrl,
        file_name: msg.fileName,
        file_size: msg.fileSize,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("🔥 Supabase error (sendMessage):", error);
    throw error;
  }

  // Create message_status rows for all participants (RPC defined in your DB)
  await supabase.rpc("create_message_status_for_participants", {
    messageid: data.id,
  });

  return data;
};

// ─────────────────────────────────────────────
// 4. Mark specific message as read
// ─────────────────────────────────────────────
exports.markRead = async (userId, messageId, conversationId) => {
  const nowIso = new Date().toISOString();

  // Update message_statuses
  const { error: statusErr } = await supabase
    .from("message_statuses")
    .update({ read_at: nowIso })
    .eq("message_id", messageId)
    .eq("user_id", userId);

  if (statusErr) {
    console.error("🔥 Supabase error (markRead - statuses):", statusErr);
    throw statusErr;
  }

  // Update last_read_message_id on conversation_participants
  const { error: partErr } = await supabase
    .from("conversation_participants")
    .update({
      last_read_message_id: messageId,
      last_read_at: nowIso,
    })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (partErr) {
    console.error("🔥 Supabase error (markRead - participants):", partErr);
    throw partErr;
  }
};

// ─────────────────────────────────────────────
// 5. Mark all messages as delivered for a user
// ─────────────────────────────────────────────
exports.markDelivered = async (userId, conversationId) => {
  const nowIso = new Date().toISOString();

  // Get message ids in this conversation
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId);

  if (error) {
    console.error("🔥 Supabase error (markDelivered - get messages):", error);
    throw error;
  }

  if (!messages || messages.length === 0) return;

  // For each message, mark delivered for this user
  for (const msg of messages) {
    const { error: updErr } = await supabase
      .from("message_statuses")
      .update({ delivered_at: nowIso })
      .eq("message_id", msg.id)
      .eq("user_id", userId);

    if (updErr) {
      console.error(
        `🔥 Supabase error (markDelivered - message ${msg.id}):`,
        updErr
      );
      throw updErr;
    }
  }
};

// ─────────────────────────────────────────────
// 6. Get teachers for a student
// ─────────────────────────────────────────────
exports.getTeachersForStudent = async (studentId) => {
  console.log("🟦 getTeachersForStudent called with:", studentId);

  // arrangements: teacher_id, student1_id, student2_id
  const { data, error } = await supabase
    .from("arrangements")
    .select("teacher_id, student1_id, student2_id")
    .or(`student1_id.eq.${studentId},student2_id.eq.${studentId}`);

  if (error) {
    console.error("🔥 SUPABASE QUERY ERROR (arrangements):", error);
    throw error;
  }

  console.log("🟩 arrangements result:", data);

  if (!data || data.length === 0) return [];

  const teacherIds = [...new Set(data.map((r) => r.teacher_id))];

  if (teacherIds.length === 0) return [];

  const { data: teachers, error: err2 } = await supabase
    .from("users")
    .select("id, name")
    .in("id", teacherIds);

  if (err2) {
    console.error("🔥 USERS TABLE ERROR:", err2);
    throw err2;
  }

  console.log("🟩 teachers result:", teachers);

  return teachers || [];
};
