const { supabase } = require("../../config/supabaseClient");
const { v4: uuidv4 } = require("uuid");

// ----------------------------------------------------------
// GET STUDENTS FOR TEACHER (USING users TABLE)
// ----------------------------------------------------------
exports.getStudentsForTeacher = async (teacherId) => {
  const { data: rows, error } = await supabase
    .from("arrangements")
    .select("student1_id, student2_id")
    .eq("teacher_id", teacherId);

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const studentIds = [
    ...new Set(
      rows.flatMap((r) => [r.student1_id, r.student2_id].filter(Boolean))
    ),
  ];

  if (studentIds.length === 0) return [];

  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id, name, username, role")
    .in("id", studentIds)
    .eq("role", "student");

  if (usersError) throw new Error(usersError.message);

  const { data: profilesData, error: profilesError } = await supabase
    .from("students")
    .select("id, profile")
    .in("id", studentIds);

  if (profilesError) throw new Error(profilesError.message);

  const profileMap = {};
  profilesData.forEach((p) => {
    profileMap[p.id] = p.profile;
  });

  const finalStudents = usersData.map((u) => ({
    ...u,
    profile: profileMap[u.id] || null,
  }));

  return finalStudents;
};

// ----------------------------------------------------------
// GET OR CREATE CONVERSATION (FIXED)
// ----------------------------------------------------------
exports.getOrCreateConversation = async (teacherId, studentId) => {
  const { data: existing, error: existingErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("user_id", [teacherId, studentId]);

  if (existingErr) throw new Error(existingErr.message);

  const convMap = {};
  existing.forEach((row) => {
    if (!convMap[row.conversation_id]) convMap[row.conversation_id] = new Set();
    convMap[row.conversation_id].add(row.user_id);
  });

  const found = Object.entries(convMap).find(
    ([_, users]) => users.has(teacherId) && users.has(studentId)
  );

  if (found) return found[0];

  const convId = uuidv4();

  await supabase.from("conversations").insert([{ id: convId }]);

  await supabase.from("conversation_participants").insert([
    {
      id: uuidv4(),
      conversation_id: convId,
      user_id: teacherId,
      role: "teacher",
      is_typing: false,
    },
    {
      id: uuidv4(),
      conversation_id: convId,
      user_id: studentId,
      role: "student",
      is_typing: false,
    },
  ]);

  return convId;
};

// ----------------------------------------------------------
// GET MESSAGES FOR CONVERSATION (FIXED: includes message_statuses)
// ----------------------------------------------------------
exports.getMessagesByConversation = async (conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, message_statuses(*)") // ⭐ REQUIRED FIX
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// ----------------------------------------------------------
// SEND MESSAGE (FIXED: unread via RPC, real-time safe)
// ----------------------------------------------------------
exports.sendMessage = async ({
  conversation_id,
  sender_id,
  content,
  type,
  file_url,
  thumbnail_url,
  file_name,
  file_size,
}) => {
  const msgId = uuidv4();

  const { error } = await supabase.from("messages").insert([
    {
      id: msgId,
      conversation_id,
      sender_id,
      content,
      type,
      file_url,
      thumbnail_url,
      file_name,
      file_size,
    },
  ]);

  if (error) throw new Error(error.message);

  // Create statuses
  await supabase.rpc("create_message_status_for_participants", {
    messageid: msgId,
  });

  // ⭐ FIX — update unread correctly using RPC
  await supabase.rpc("increment_unread", {
    conv_id: conversation_id,
    sender_id: sender_id,
  });

  return msgId;
};

// ----------------------------------------------------------
// MARK DELIVERED
// ----------------------------------------------------------
exports.markDelivered = async (messageId, userId) => {
  const { error } = await supabase
    .from("message_statuses")
    .update({ delivered_at: new Date() })
    .eq("message_id", messageId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

// ----------------------------------------------------------
// MARK READ
// ----------------------------------------------------------
exports.markRead = async (conversationId, userId, messageId) => {
  const nowIso = new Date().toISOString();

  // If messageId is provided, mark that specific message as read
  if (messageId) {
    // Use upsert to create or update message_statuses
    const { error: statusErr } = await supabase.from("message_statuses").upsert(
      {
        message_id: messageId,
        user_id: userId,
        read_at: nowIso,
        delivered_at: nowIso,
      },
      {
        onConflict: "message_id,user_id",
      }
    );

    if (statusErr) {
      console.error("🔥 Supabase error (markRead - statuses):", statusErr);
    }

    // Update last_read_message_id on conversation_participants
    await supabase
      .from("conversation_participants")
      .update({
        last_read_message_id: messageId,
        last_read_at: nowIso,
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  } else {
    // Fallback: mark the last message as read
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lastMsg) return;

    // Use upsert for the last message
    await supabase.from("message_statuses").upsert(
      {
        message_id: lastMsg.id,
        user_id: userId,
        read_at: nowIso,
        delivered_at: nowIso,
      },
      {
        onConflict: "message_id,user_id",
      }
    );

    await supabase
      .from("conversation_participants")
      .update({
        last_read_message_id: lastMsg.id,
        last_read_at: nowIso,
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  }
};

// ----------------------------------------------------------
// SET TYPING
// ----------------------------------------------------------
exports.setTyping = async (conversationId, userId, isTyping) => {
  const { error } = await supabase
    .from("conversation_participants")
    .update({ is_typing: isTyping })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

// ----------------------------------------------------------
// UPDATE LAST SEEN - Updates ALL conversations for user
// ----------------------------------------------------------
exports.updateLastSeen = async (conversationId, userId) => {
  // Update all conversation_participants rows for this user
  const { error } = await supabase
    .from("conversation_participants")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

// ----------------------------------------------------------
// PRESENCE API (FIXED WRONG COLUMN)
// ----------------------------------------------------------
exports.getPresence = async (userId) => {
  return await supabase
    .from("conversation_participants")
    .select("is_typing, last_seen_at") // ⭐ FIXED
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false })
    .limit(1)
    .single();
};

// ----------------------------------------------------------
// CHAT HISTORY (unchanged but uses indexes)
// ----------------------------------------------------------
// OPTIMIZED VERSION WITH PROPER NULL HANDLING

exports.getTeacherChatHistory = async (teacherId) => {
  console.log("🟦 getTeacherChatHistory called with:", teacherId);

  try {
    // <CHANGE> Step 1: Get all conversation IDs - add proper null check
    const { data: convList, error: convErr } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", teacherId);

    if (convErr) {
      console.error("[v0] Error fetching conversations:", convErr);
      throw convErr;
    }

    // <CHANGE> Handle null or empty response
    if (!convList || convList.length === 0) {
      console.log("[v0] No conversations found for teacher:", teacherId);
      return [];
    }

    const convIds = convList.map((c) => c.conversation_id);
    console.log("[v0] Found conversations:", convIds);

    // <CHANGE> Step 2: Fetch all data in parallel with error handling
    const [
      { data: allParticipants, error: pErr },
      { data: allMessages, error: mErr },
    ] = await Promise.all([
      supabase
        .from("conversation_participants")
        .select("conversation_id, user_id, role")
        .in("conversation_id", convIds),

      supabase
        .from("messages")
        .select("conversation_id, id, content, created_at, sender_id")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false }),
    ]);

    // <CHANGE> Check for errors from parallel queries
    if (pErr) throw pErr;
    if (mErr) throw mErr;

    // <CHANGE> Handle null responses safely
    const participants = allParticipants || [];
    const messages = allMessages || [];

    console.log(
      "[v0] Fetched participants:",
      participants.length,
      "messages:",
      messages.length
    );

    // <CHANGE> Get unique student IDs
    const studentIds = new Set();
    for (const participant of participants) {
      if (participant.user_id !== teacherId) {
        studentIds.add(participant.user_id);
      }
    }

    if (studentIds.size === 0) {
      console.log("[v0] No students found in conversations");
      return [];
    }

    // <CHANGE> Fetch user data and profiles in parallel
    const [
      { data: allUsers, error: userErr },
      { data: allProfiles, error: profileErr },
    ] = await Promise.all([
      supabase
        .from("users")
        .select("id, name")
        .in("id", Array.from(studentIds)),

      supabase
        .from("students")
        .select("id, profile")
        .in("id", Array.from(studentIds)),
    ]);

    if (userErr) throw userErr;
    if (profileErr) throw profileErr;

    // <CHANGE> Create lookup maps with null safety
    const userMap = new Map((allUsers || []).map((u) => [u.id, u]));
    const profileMap = new Map((allProfiles || []).map((p) => [p.id, p]));

    // <CHANGE> Build message map - get latest message per conversation
    const messageMap = new Map();
    for (const msg of messages) {
      if (!messageMap.has(msg.conversation_id)) {
        messageMap.set(msg.conversation_id, msg);
      }
    }

    // <CHANGE> Calculate unread count per conversation from message_statuses
    const unreadMap = new Map();
    for (const convId of convIds) {
      // Get messages not sent by teacher
      const convMessages = messages.filter(
        (m) => m.conversation_id === convId && m.sender_id !== teacherId
      );

      let unreadCount = 0;
      for (const msg of convMessages) {
        const { data: statusData } = await supabase
          .from("message_statuses")
          .select("read_at")
          .eq("message_id", msg.id)
          .eq("user_id", teacherId)
          .maybeSingle();

        if (!statusData || !statusData.read_at) {
          unreadCount++;
        }
      }
      unreadMap.set(convId, unreadCount);
    }

    // <CHANGE> Build participants map
    const participantMap = new Map();
    for (const participant of participants) {
      if (!participantMap.has(participant.conversation_id)) {
        participantMap.set(participant.conversation_id, []);
      }
      participantMap.get(participant.conversation_id).push(participant);
    }

    // <CHANGE> Build chat list from maps
    const chatList = [];
    for (const conv of convList) {
      const convId = conv.conversation_id;

      const convParticipants = participantMap.get(convId) || [];
      const student = convParticipants.find((p) => p.user_id !== teacherId);
      if (!student) continue;

      const stuUser = userMap.get(student.user_id);
      const stuProfile = profileMap.get(student.user_id);

      if (!stuUser) {
        console.warn("[v0] User not found:", student.user_id);
        continue;
      }

      const lastMsg = messageMap.get(convId);
      if (!lastMsg) {
        console.warn("[v0] No messages found for conversation:", convId);
        continue;
      }

      chatList.push({
        studentId: stuUser.id,
        studentName: stuUser.name,
        avatar: stuProfile?.profile || "/placeholder.svg",
        lastMessage: lastMsg.content,
        lastMessageTime: lastMsg.created_at,
        unreadCount: unreadMap.get(convId) || 0,
        conversationId: convId,
      });
    }

    // <CHANGE> Sort by latest message time
    chatList.sort((a, b) => {
      const t1 = new Date(a.lastMessageTime).getTime();
      const t2 = new Date(b.lastMessageTime).getTime();
      return t2 - t1;
    });

    console.log("[v0] Final chat list length:", chatList.length);
    return chatList;
  } catch (error) {
    console.error("[v0] getTeacherChatHistory error:", error);
    throw error;
  }
};

exports.getMessageById = async (id) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

// ─────────────────────────────────────────────
// Get total unread message count for a user
// ─────────────────────────────────────────────
exports.getTotalUnreadCount = async (userId) => {
  try {
    // Get all conversations where user participates
    const { data: convList, error: convErr } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (convErr) throw convErr;
    if (!convList || convList.length === 0) return 0;

    let totalUnread = 0;

    // For each conversation, count unread messages
    for (const conv of convList) {
      const { data: messages, error: msgErr } = await supabase
        .from("messages")
        .select("id, sender_id")
        .eq("conversation_id", conv.conversation_id)
        .neq("sender_id", userId); // Only count messages sent by others

      if (msgErr) continue;
      if (!messages || messages.length === 0) continue;

      // Check which messages are unread by this user
      for (const msg of messages) {
        const { data: status, error: statusErr } = await supabase
          .from("message_statuses")
          .select("read_at")
          .eq("message_id", msg.id)
          .eq("user_id", userId)
          .maybeSingle();

        if (statusErr) continue;
        if (!status || !status.read_at) {
          totalUnread++;
        }
      }
    }

    return totalUnread;
  } catch (error) {
    console.error("🔥 Error fetching unread counts:", error);
    return 0; // Return 0 instead of throwing to prevent frontend errors
  }
};
