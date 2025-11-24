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

// FETCH TEACHER DETAILS FROM TEACHERS TABLE (NOT USERS)
const { data: teachers, error: err2 } = await supabase
  .from("teachers")
  .select("id, name, profile")
  .in("id", teacherIds);

if (err2) {
  console.error("🔥 TEACHERS TABLE ERROR:", err2);
  throw err2;
}

  console.log("🟩 teachers result:", teachers);

  return teachers || [];
};


// Get chat history for a user (teachers the student has chatted with before)
exports.getChatHistory = async (userId) => {
  console.log("🟦 getChatHistory called with:", userId);

  // 1. Get conversations where user participates
  const { data: convList, error: convErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  console.log("conversation_participants RESULT:", convList, "ERROR:", convErr);

  if (convErr) throw convErr;
  if (!convList || convList.length === 0) return [];

  const chatList = [];

  for (const conv of convList) {
    const convId = conv.conversation_id;

    // 2. Get BOTH participants of this conversation
    const { data: participants, error: participantsErr } = await supabase
      .from("conversation_participants")
      .select("user_id, role")
      .eq("conversation_id", convId);

    if (participantsErr) throw participantsErr;

    // Identify teacher (other user)
    const teacher = participants.find((p) => p.user_id !== userId);
    if (!teacher) continue;

    // 3. Get teacher details
   const { data: teacherInfo, error: teacherErr } = await supabase
  .from("teachers")
  .select("id, profile,name")
  .eq("id", teacher.user_id)
  .single();

if (teacherErr) throw teacherErr;


// 4. Last message (IMPORTANT: skip if none)
const { data: lastMsgArr, error: lastMsgErr } = await supabase
  .from("messages")
  .select("id, content, created_at, sender_id")
  .eq("conversation_id", convId)
  .order("created_at", { ascending: false })
  .limit(1);

if (lastMsgErr) throw lastMsgErr;

// ❗ Skip conversations with no messages
if (!lastMsgArr || lastMsgArr.length === 0) {
  continue;
}

const lastMsg = lastMsgArr[0];


    // 5. unread_count from conversation_unread_counts
    const { data: unreadObj, error: unreadErr } = await supabase
      .from("conversation_unread_counts")
      .select("unread_count")
      .eq("user_id", userId)
      .eq("conversation_id", convId)
      .single();

    if (unreadErr && unreadErr.code !== "PGRST116") {
      // ignore "row not found"
      throw unreadErr;
    }

    chatList.push({
      teacherId: teacherInfo.id,
      teacherName: teacherInfo.name,
      avatar: teacherInfo.profile || "/placeholder.svg",
      lastMessage: lastMsg ? lastMsg.content : "",
      lastMessageTime: lastMsg ? lastMsg.created_at : null,
      unreadCount: unreadObj?.unread_count || 0,
      conversationId: convId,
    });
  }

  // Sort by last message time (newest first)
chatList.sort((a, b) => {
  const t1 = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
  const t2 = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
  return t2 - t1; // descending order
});

return chatList;

};


