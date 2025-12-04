import { useState, useEffect, useRef } from "react";
import "./Message.css";
import { supabase } from "../../supabaseClient"; // FIX PATH IF NEEDED

const Message = ({ onMessagesRead }) => {
  const MAIN = import.meta.env.VITE_MAIN;
  const TEST = import.meta.env.VITE_TEST;
  const [chatContacts, setChatContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState("");
  const [messageText, setMessageText] = useState("");
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });
  const [isScreenshotAttempt, setIsScreenshotAttempt] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalType, setModalType] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesRef = useRef(null);
  const [modalFileName, setModalFileName] = useState("");
  const [modalMimeType, setModalMimeType] = useState("");
  const [tempContact, setTempContact] = useState(null);
  const [statusText, setStatusText] = useState("");
  const typingTimeout = useRef(null);

  // ---------- REALTIME STATE ----------
  const [otherTyping, setOtherTyping] = useState(false);
  const realtimeChannel = useRef(null);
  const globalRealtimeChannel = useRef(null);
  const presenceRealtimeChannel = useRef(null);
  const conversationIdRef = useRef(null); // Ref to track current conversation
  const selectedContactRef = useRef(null); // Ref to track selected contact for presence

  // Keep conversationIdRef in sync
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Keep selectedContactRef in sync
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    if (!selectedContact) return;

    // Initial fetch
    const fetchPresence = async () => {
      try {
        const res = await fetch(
          `${MAIN}/api/teacher/messages/presence/${selectedContact}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!data || !data.data) return;

        const p = data.data;

        // Use realtime otherTyping if available, otherwise use presence polling
        if (otherTyping) {
          setStatusText("typing…");
        } else if (p.is_typing) {
          setStatusText("typing…");
        } else if (isOnline(p.last_seen_at)) {
          setStatusText("Online");
        } else {
          setStatusText("last seen " + formatLastSeen(p.last_seen_at));
        }
      } catch (e) {
        // Ignore presence failures
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 3000);

    return () => clearInterval(interval);
  }, [selectedContact, otherTyping]);

  // Update status text when otherTyping changes from realtime
  useEffect(() => {
    if (otherTyping) {
      setStatusText("typing…");
    }
  }, [otherTyping]);

  function isOnline(lastSeen) {
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 10000; // 10sec rule
  }

  // Map backend message -> UI message
  function mapBackendMsgToUI(msg) {
    const isOwn = String(msg.sender_id) === String(currentUser.id);

    // Basic status: you can enhance later with message_statuses join
    let status = "sent";

    // If backend later returns statuses array, we can use it:
    if (msg.statuses || msg.message_statuses) {
      const statuses = msg.statuses || msg.message_statuses;
      const otherStatuses = statuses.filter((s) => s.user_id !== msg.sender_id);
      if (otherStatuses.length > 0) {
        const o = otherStatuses[0];
        if (o.read_at) status = "read";
        else if (o.delivered_at) status = "delivered";
        else if (o.sent_at) status = "sent";
      }
    }

    // Detect mimeType from file extension if not provided
    const detectMimeType = (fileName, fileType) => {
      if (!fileName) return "";
      const ext = fileName.split(".").pop()?.toLowerCase();
      const mimeMap = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        txt: "text/plain",
        csv: "text/csv",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
      };
      return mimeMap[ext] || "";
    };

    // Check if URL is a blob URL (temporary, won't work on reload)
    const isValidFileUrl = (url) => {
      if (!url) return false;
      if (url.startsWith("blob:")) return false; // Blob URLs are temporary
      return true;
    };

    const rawFileUrl = msg.file_url || msg.localFileUrl;
    const validFileUrl = isValidFileUrl(rawFileUrl) ? rawFileUrl : null;

    return {
      id: msg.id,
      sender: msg.sender_id,
      sender_id: msg.sender_id,
      text: msg.content || msg.message || msg.text || msg.raw?.content || "",
      content: msg.content || msg.message || msg.text || "",

      // ✔ store REAL created_at
      created_at:
        msg.created_at || msg.raw?.created_at || new Date().toISOString(),

      // ✔ preformat ONCE
      time: formatAMPM(
        new Date(msg.created_at || msg.raw?.created_at || Date.now())
      ),

      isOwn,
      status,
      isFile: msg.type !== "text",
      fileType: msg.type,
      fileUrl: validFileUrl,
      thumbnailUrl: isValidFileUrl(msg.thumbnail_url)
        ? msg.thumbnail_url
        : null,
      fileName: msg.file_name,
      fileSize: msg.file_size
        ? `${(msg.file_size / 1024 / 1024).toFixed(2)} MB`
        : null,
      mimeType: msg.mime_type || detectMimeType(msg.file_name, msg.type),
      raw: msg,
    };
  }

  // Load students from backend
  const loadStudents = async () => {
    const id = localStorage.getItem("user_id");

    if (!id) {
      console.error("No user_id found. Cannot load students.");
      return;
    }

    try {
      const res = await fetch(
        `${MAIN}/api/teacher/messages/my-students?teacherId=${encodeURIComponent(
          id
        )}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await res.json();
      console.log("RAW STUDENTS RESPONSE:", data);

      // ⭐ VERY IMPORTANT ⭐
      // Backend returns: { success: true, students: [...] }
      const students = Array.isArray(data.students) ? data.students : [];

      setContacts(
        students.map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.profile || "/placeholder.svg",
          lastMessage: "Start a conversation",
          time: "",
          unreadCount: 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  const loadChatHistory = async () => {
    const id = localStorage.getItem("user_id");
    if (!id) return;

    try {
      const res = await fetch(
        `${MAIN}/api/teacher/messages/my-chats?userId=${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("CHAT HISTORY RAW:", data);

      // ⭐ FIX: chatContacts must ALWAYS be an array
      const chatsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.chats)
        ? data.chats
        : Array.isArray(data.data)
        ? data.data
        : [];

      setChatContacts(chatsArray);
    } catch (err) {
      console.error("Chat history error:", err);
      setChatContacts([]); // fallback so UI never breaks
    }
  };

  // On mount: set current user from localStorage and load students
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const name = localStorage.getItem("username");

    setCurrentUser({ id: id || "", name: name || "" });
    loadStudents();
    loadChatHistory();

    // ⭐ IMPORTANT: default blank selection
    setSelectedContact("");
    setIsChatOpen(false);
  }, []);

  // Load announcements from localStorage (unchanged)
  useEffect(() => {
    const storedAnnouncements = JSON.parse(
      localStorage.getItem("announcements") || "[]"
    );
    const filtered = storedAnnouncements.filter(
      (a) => a.receiver === "Students" || a.receiver === "All"
    );
    setAnnouncements(filtered);
  }, []);

  // Screenshot detection (unchanged)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 44) {
        setIsScreenshotAttempt(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close upload options when clicking outside (unchanged)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUploadOptions &&
        !event.target.closest(".upload-options") &&
        !event.target.closest(".pin-button")
      ) {
        setShowUploadOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUploadOptions]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // ⭐ Cleanup realtime on component unmount
  useEffect(() => {
    return () => {
      if (realtimeChannel.current) {
        console.log("🔴 Component unmounting - cleaning up realtime");
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }
    };
  }, []);

  // ⭐ TEACHER PRESENCE HEARTBEAT - Update last_seen every 5 seconds
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const updatePresence = async () => {
      try {
        await fetch(`${MAIN}/api/teacher/messages/last-seen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        // Silently fail - presence is not critical
      }
    };

    // Update immediately on mount
    updatePresence();

    // Then update every 5 seconds
    const interval = setInterval(updatePresence, 5000);

    return () => clearInterval(interval);
  }, []);

  // ⭐ GLOBAL REALTIME SUBSCRIPTION - Listen to ALL messages for this teacher
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    console.log("🌐 Setting up global realtime subscription for user:", userId);

    // Subscribe to all messages table changes
    const globalChannel = supabase.channel("global-messages-" + userId);

    globalChannel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      async (payload) => {
        console.log("🌐 GLOBAL MESSAGE RECEIVED:", payload.new);

        // Check if this message is in one of our conversations
        try {
          // Fetch conversation to see if we're a participant
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", payload.new.conversation_id);

          const isOurConversation = participants?.some(
            (p) => String(p.user_id) === String(userId)
          );

          if (!isOurConversation) {
            console.log("Message not for us, ignoring");
            return;
          }

          console.log("🌐 Message IS for our conversation!");

          // If message is from us, skip (we already added it optimistically)
          if (String(payload.new.sender_id) === String(userId)) {
            console.log("Message from self, skipping");
            return;
          }

          // If this is the currently open conversation, add message to chat
          const currentConvId = conversationIdRef.current;
          console.log(
            "🌐 Current conversation:",
            currentConvId,
            "Message conversation:",
            payload.new.conversation_id
          );

          if (currentConvId === payload.new.conversation_id) {
            // Add the incoming message to the chat
            const newMsg = {
              id: payload.new.id,
              sender: payload.new.sender_id,
              sender_id: payload.new.sender_id,
              text: payload.new.content || "",
              content: payload.new.content || "",
              created_at: payload.new.created_at,
              time: new Date(payload.new.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isOwn: false,
              status: "delivered",
              isFile: payload.new.type !== "text",
              fileType: payload.new.type,
              fileUrl: payload.new.file_url,
              fileName: payload.new.file_name,
            };

            setMessages((prev) => {
              const exists = prev.some((m) => m.id === newMsg.id);
              if (exists) {
                console.log("Message already exists, skipping");
                return prev;
              }
              console.log("🌐 Adding new message to chat:", newMsg);
              return [...prev, newMsg];
            });

            // Mark as delivered
            fetch(`${MAIN}/api/teacher/messages/delivered`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                messageId: payload.new.id,
                recipientId: userId,
              }),
            }).catch((err) => console.error("Failed to mark delivered:", err));
          }

          // Update chat sidebar with new message info
          setChatContacts((prev) => {
            const existingChat = prev.find(
              (c) => c.conversationId === payload.new.conversation_id
            );

            if (existingChat) {
              // Update existing chat
              return prev.map((chat) =>
                chat.conversationId === payload.new.conversation_id
                  ? {
                      ...chat,
                      lastMessage: payload.new.content,
                      lastMessageTime: payload.new.created_at,
                      unreadCount:
                        currentConvId !== payload.new.conversation_id
                          ? (chat.unreadCount || 0) + 1
                          : chat.unreadCount,
                    }
                  : chat
              );
            } else {
              // New conversation - will be loaded on next chat history fetch
              console.log("🌐 New conversation detected, refreshing chat list");
              loadChatHistory();
              return prev;
            }
          });
        } catch (err) {
          console.error("Global realtime handler error:", err);
        }
      }
    );

    // Subscribe to message status updates (delivered/read)
    globalChannel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "message_statuses",
      },
      (payload) => {
        console.log("🌐 MESSAGE STATUS UPDATE:", payload.new);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === payload.new.message_id
              ? {
                  ...msg,
                  status: payload.new.read_at
                    ? "read"
                    : payload.new.delivered_at
                    ? "delivered"
                    : "sent",
                }
              : msg
          )
        );
      }
    );

    // Subscribe to user_presence updates (online/typing status)
    globalChannel.on(
      "postgres_changes",
      {
        event: "*", // Listen to INSERT and UPDATE
        schema: "public",
        table: "conversation_participants",
      },
      (payload) => {
        const presenceData = payload.new;
        const currentSelectedContact = selectedContactRef.current;

        console.log(
          "🌐 PRESENCE UPDATE:",
          presenceData,
          "Selected contact:",
          currentSelectedContact
        );

        // Only update if this is the currently selected contact
        if (String(presenceData.user_id) === String(currentSelectedContact)) {
          if (presenceData.is_typing) {
            setOtherTyping(true);
            setStatusText("typing…");
          } else {
            setOtherTyping(false);
            // Check if online (last_seen within 10 seconds)
            const lastSeen = presenceData.last_seen_at
              ? new Date(presenceData.last_seen_at)
              : null;

            if (!lastSeen) {
              setStatusText("");
              return;
            }

            const now = new Date();
            const diffMs = now - lastSeen;

            if (diffMs < 10000) {
              setStatusText("Online");
            } else {
              // Format last seen
              if (diffMs < 60000) {
                setStatusText("last seen just now");
              } else if (diffMs < 3600000) {
                setStatusText(
                  `last seen ${Math.floor(diffMs / 60000)} min ago`
                );
              } else if (diffMs < 86400000) {
                setStatusText(
                  `last seen ${Math.floor(diffMs / 3600000)} hrs ago`
                );
              } else {
                setStatusText(`last seen ${lastSeen.toLocaleDateString()}`);
              }
            }
          }
        }
      }
    );

    globalChannel.subscribe((status) => {
      console.log("🌐 Global realtime subscription status:", status);
    });

    globalRealtimeChannel.current = globalChannel;

    return () => {
      console.log("🌐 Cleaning up global realtime subscription");
      if (globalRealtimeChannel.current) {
        supabase.removeChannel(globalRealtimeChannel.current);
        globalRealtimeChannel.current = null;
      }
    };
  }, []); // Empty dependency - only run once on mount

  // Load messages for a conversation
  const loadMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await fetch(
        `${MAIN}/api/teacher/messages/messages/${convId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch messages");
        return;
      }
      const data = await res.json();
      const msgsArray = Array.isArray(data.messages) ? data.messages : [];
      const mapped = msgsArray.map(mapBackendMsgToUI);
      setMessages(mapped);

      // Mark ALL unread messages as read
      const unreadMessages = mapped.filter(
        (m) =>
          !m.isOwn &&
          m.raw &&
          (!m.raw.statuses || !m.raw.statuses.some((s) => s.read_at))
      );

      if (unreadMessages.length > 0 && currentUser.id) {
        // Mark each message as read
        for (const unreadMsg of unreadMessages) {
          try {
            await fetch(`${MAIN}/api/teacher/messages/read`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                messageId: unreadMsg.id,
                conversationId: convId,
                userId: currentUser.id,
              }),
            });
          } catch (err) {
            console.error("Failed to mark message as read:", err);
          }
        }

        // Update all unread messages status in UI
        setMessages((prev) =>
          prev.map((pm) =>
            unreadMessages.some((u) => u.id === pm.id)
              ? { ...pm, status: "read" }
              : pm
          )
        );

        // Notify dashboard to refresh unread count
        if (onMessagesRead) {
          onMessagesRead();
        }

        // Clear unread count in sidebar for this contact
        setChatContacts((prev) =>
          prev.map((c) =>
            c.conversationId === convId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (err) {
      console.error("loadMessages error", err);
    }
  };

  // When user selects a contact: create/get conversation, load messages, mark delivered
  useEffect(() => {
    if (!selectedContact || !currentUser.id) return;

    (async () => {
      try {
        const convRes = await fetch(
          `${MAIN}/api/teacher/messages/conversation`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              teacherId: currentUser.id,
              studentId: selectedContact,
            }),
          }
        );

        if (!convRes.ok) {
          console.error("Failed to create/get conversation");
          return;
        }

        const convBody = await convRes.json();
        const convId = convBody.conversationId;

        // ⭐ CRITICAL: Store conversationId in state for sending messages
        setConversationId(convId);
        setIsChatOpen(true);
        fetch(`${MAIN}/api/teacher/messages/last-seen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            conversationId: convId,
            userId: currentUser.id,
          }),
        });

        await loadMessages(convId);

        // ------------ REALTIME SUBSCRIBE ------------
        if (realtimeChannel.current) {
          supabase.removeChannel(realtimeChannel.current);
        }

        const channel = supabase.channel(`conversation-${convId}`);

        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${convId}`,
          },
          async (payload) => {
            try {
              // ⭐ SKIP if this is OUR OWN message (prevents duplicates)
              if (String(payload.new.sender_id) === String(currentUser.id)) {
                console.log("🔵 Skipping own message from realtime");
                return;
              }

              // Fetch FULL message record so UI never breaks
              const res = await fetch(
                `${MAIN}/api/teacher/messages/message/${payload.new.id}`,
                { credentials: "include" }
              );

              if (!res.ok) return;

              const fullMsgRaw = await res.json();
              console.log("🔥 REALTIME FULL MESSAGE RECEIVED:", fullMsgRaw);
              console.log("🔥 PAYLOAD.REALTIME:", payload.new);
              console.log("🔥 CURRENT USER ID:", currentUser.id);

              // 🔥 FIX 1: Ensure sender_id ALWAYS exists
              const senderId = String(
                fullMsgRaw.sender_id ||
                  fullMsgRaw.senderId ||
                  payload.new.sender_id ||
                  payload.new.senderId
              );

              // 🔥 FIX 2: Ensure message text ALWAYS exists
              const finalContent =
                fullMsgRaw.content ||
                fullMsgRaw.message ||
                payload.new.content ||
                fullMsgRaw.text ||
                payload.new.text ||
                "";

              // 🔥 FIX 3: Ensure created_at ALWAYS exists
              const createdAt =
                fullMsgRaw.created_at ||
                fullMsgRaw.createdAt ||
                payload.new.created_at ||
                new Date().toISOString();

              const fullMsg = {
                ...fullMsgRaw,
                sender_id: senderId,
                content: finalContent,
                created_at: createdAt,
              };
              // FULL message with created_at, sender_id, file info

              const mapped = mapBackendMsgToUI(fullMsg);

              // ⭐ Prevent duplicate messages
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === mapped.id);
                if (exists) return prev;
                return [...prev, mapped];
              });

              // auto delivered
              fetch(`${MAIN}/api/teacher/messages/delivered`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  messageId: payload.new.id,
                  userId: currentUser.id,
                }),
              });
            } catch (e) {
              console.error("Realtime mapping error:", e);
            }
          }
        );

        // MESSAGE_STATUS UPDATE = DELIVERED / READ TICKS
        channel.on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "message_statuses",
          },
          (payload) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.message_id
                  ? {
                      ...msg,
                      status: payload.new.read_at
                        ? "read"
                        : payload.new.delivered_at
                        ? "delivered"
                        : "sent",
                    }
                  : msg
              )
            );
          }
        );

        // TYPING INDICATOR
        channel.on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversation_participants",
            filter: `conversation_id=eq.${convId}`,
          },
          (payload) => {
            // Only show typing for the OTHER person
            if (String(payload.new.user_id) === String(selectedContact)) {
              setOtherTyping(payload.new.is_typing);
            }
          }
        );

        // ⭐ Subscribe with status callback
        channel.subscribe((status) => {
          console.log("🔔 Realtime subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("✅ Successfully subscribed to conversation:", convId);
          }
        });
        realtimeChannel.current = channel;
        // ------------ END REALTIME SUBSCRIBE ------------
      } catch (err) {
        console.error("selectContact error", err);
      }
    })();

    // ⭐ Cleanup on unmount or when contact changes
    return () => {
      if (realtimeChannel.current) {
        console.log("🔴 Cleaning up realtime channel");
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }
    };
  }, [selectedContact, currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restricted content check (unchanged)
  const checkRestrictedContent = (text) => {
    const restrictedWords = [
      "contact",
      "number",
      "mobile number",
      "no.",
      "whatsapp contact",
    ];
    const tenDigitRegex = /\b\d{10}\b/;
    const lowerText = (text || "").toLowerCase();
    for (const word of restrictedWords)
      if (lowerText.includes(word.toLowerCase())) return true;
    if (tenDigitRegex.test(text)) return true;
    return false;
  };

  function createDownloadUrl(url) {
    if (!url) return null;

    const split = url.split("/upload/");
    if (split.length < 2) return url;

    return `${split[0]}/upload/fl_attachment/${split[1]}`;
  }
  function formatLastSeen(ts) {
    if (!ts) return "long ago";
    const d = new Date(ts);
    const now = new Date();

    const diff = now - d;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hrs ago`;

    return d.toLocaleDateString();
  }

  // Upload file to server (Cloudinary via /api/upload)
  const uploadFileToServer = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${MAIN}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        console.error("Upload failed with status:", res.status);
        return null;
      }

      const data = await res.json();
      console.log("Upload response:", data);
      return data.url || data.fileUrl || null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Generate video thumbnail
  const generateVideoThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.currentTime = 1;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
          URL.revokeObjectURL(video.src);
          resolve(thumbnailUrl);
        } catch (e) {
          resolve(null);
        }
      };

      video.onerror = () => {
        resolve(null);
      };
    });
  };

  // Handle file upload (image / video / document)
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file || !currentUser.id) {
      console.error("No file or user not logged in");
      return;
    }

    // Create conversation if not exists
    let convId = conversationId;
    if (!convId && selectedContact) {
      try {
        const convRes = await fetch(
          `${MAIN}/api/teacher/messages/conversation`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              teacherId: currentUser.id,
              studentId: selectedContact,
            }),
          }
        );
        if (convRes.ok) {
          const convBody = await convRes.json();
          convId = convBody.conversationId || convBody.conversation_id;
          setConversationId(convId);
        }
      } catch (err) {
        console.error("Failed to create conversation:", err);
        return;
      }
    }

    if (!convId) {
      console.error("No conversation ID available");
      return;
    }

    const fileUrlLocal = URL.createObjectURL(file);
    let thumbnailUrl = null;

    if (type === "video") {
      thumbnailUrl = await generateVideoThumbnail(file);
    }

    // Show temp message immediately
    const tempMsgId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempMsgId,
      sender: currentUser.id,
      sender_id: currentUser.id,
      text: `${type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"} ${
        file.name
      }`,
      content: `${type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"} ${
        file.name
      }`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      created_at: new Date().toISOString(),
      isOwn: true,
      status: "sending",
      isFile: true,
      fileType: type,
      fileUrl: fileUrlLocal,
      thumbnailUrl: thumbnailUrl,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      mimeType: file.type,
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Upload to cloudinary
    const serverFileUrl = await uploadFileToServer(file);

    if (!serverFileUrl) {
      console.error("File upload failed - no URL returned");
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsgId ? { ...m, status: "failed" } : m))
      );
      return;
    }

    console.log("File uploaded successfully:", serverFileUrl);

    try {
      const res = await fetch(`${MAIN}/api/teacher/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversation_id: convId,
          sender_id: currentUser.id,
          content: `${
            type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"
          } ${file.name}`,
          type,
          file_url: serverFileUrl,
          thumbnail_url: thumbnailUrl,
          file_name: file.name,
          file_size: file.size,
        }),
      });

      if (!res.ok) throw new Error("send failed");
      const sentMsg = await res.json();

      // Update temp message with real data
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsgId
            ? {
                ...m,
                id: sentMsg.id || sentMsg.messageId,
                status: "sent",
                fileUrl: serverFileUrl,
                thumbnailUrl: sentMsg.thumbnail_url || thumbnailUrl,
              }
            : m
        )
      );

      // Update chat sidebar
      setChatContacts((prev) =>
        prev.map((chat) =>
          chat.studentId === selectedContact
            ? {
                ...chat,
                lastMessage: `${
                  type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"
                } ${file.name}`,
                lastMessageTime: new Date().toISOString(),
              }
            : chat
        )
      );
    } catch (err) {
      console.error("file send error", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsgId ? { ...m, status: "failed" } : m))
      );
    }

    // Reset file input
    event.target.value = "";
  };

  // Send text message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    if (!currentUser.id) return;

    if (checkRestrictedContent(messageText)) {
      setShowWarningModal(true);
      return;
    }

    let convId = conversationId;

    if (!convId) {
      const convRes = await fetch(`${MAIN}/api/teacher/messages/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          teacherId: currentUser.id,
          studentId: selectedContact,
        }),
      });
      if (!convRes.ok) {
        console.error("Failed to create/get conversation for sending");
        return;
      }
      const convBody = await convRes.json();
      convId =
        convBody.conversation_id || convBody.conversationId || convBody.id;
      setConversationId(convId);

      // ⭐ Convert temporary contact into real chat contact
      if (tempContact && tempContact.studentId === selectedContact) {
        setChatContacts((prev) => [
          {
            ...tempContact,
            conversationId: convId,
            lastMessage: messageText.trim(),
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
          },
          ...prev.filter((c) => c.studentId !== tempContact.studentId),
        ]);

        setTempContact(null); // remove temporary entry
      }
    }

    const outgoing = {
      conversationId: convId,
      content: messageText,
      type: "text",
    };

    const tempMsg = {
      id: "temp-" + Date.now(),
      sender_id: currentUser.id,
      content: messageText,
      type: "text",
      created_at: new Date().toISOString(),

      // For UI:
      sender: currentUser.id,
      text: messageText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
      isFile: false,
      fileType: null,
      fileUrl: null,
      thumbnailUrl: null,
      fileName: null,
      fileSize: null,

      // Raw backend-like structure
      raw: {
        id: "temp-" + Date.now(),
        sender_id: currentUser.id,
        created_at: new Date().toISOString(),
        message_statuses: [],
      },
    };

    setMessages((prev) => [...prev, tempMsg]);
    setMessageText("");

    try {
      const res = await fetch(`${MAIN}/api/teacher/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversation_id: convId,
          sender_id: currentUser.id,
          content: messageText,
          type: "text",
        }),
      });

      if (!res.ok) throw new Error("send failed");
      const sentMsg = await res.json();

      // ⭐ Update chat sidebar immediately
      setChatContacts((prev) =>
        prev.map((chat) =>
          chat.studentId === selectedContact
            ? {
                ...chat,
                lastMessage: messageText,
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
              }
            : chat
        )
      );

      // ⭐ FIX: Update temp message with real ID but keep our local data
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsg.id
            ? {
                ...m,
                id: sentMsg.messageId || sentMsg.id,
                status: "sent",
              }
            : m
        )
      );
    } catch (err) {
      console.error("sendMessage error", err);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleContactClick = (contactId) => {
    // If empty selection (default option), close the chat
    if (!contactId || contactId === "") {
      setSelectedContact("");
      setIsChatOpen(false);
      setConversationId(null);
      setMessages([]);
      setTempContact(null);
      setStatusText("");
      return;
    }

    setSelectedContact(contactId);
    setIsChatOpen(true);
    // 1️⃣ If this student already has a conversation → open it immediately
    const chat = chatContacts.find((c) => c.studentId === contactId);

    if (chat) {
      console.log("Opening existing conversation:", chat.conversationId);

      setConversationId(chat.conversationId); // ⭐ CRITICAL
      loadMessages(chat.conversationId); // ⭐ CRITICAL

      // ⭐ Mark messages as read on server
      if (chat.conversationId && currentUser.id) {
        fetch(`${MAIN}/api/teacher/messages/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            conversationId: chat.conversationId,
            userId: currentUser.id,
          }),
        });
      }
    }

    // Clear unread count in UI immediately
    setChatContacts((prev) =>
      prev.map((c) =>
        c.studentId === contactId ? { ...c, unreadCount: 0 } : c
      )
    );

    // Check if student exists in actual chat history
    const existsInChat = chatContacts.some((c) => c.studentId === contactId);

    if (!existsInChat) {
      // This is a NEW contact → show only this one temporarily
      const student = contacts.find((s) => s.id === contactId);
      if (student) {
        setTempContact({
          studentId: student.id,
          studentName: student.name,
          avatar: student.avatar || "/placeholder.svg",
          lastMessage: "Start a conversation",
          lastMessageTime: null,
          unreadCount: 0,
          conversationId: null,
        });
      }
    } else {
      // If exists in chat history → remove any temp contact
      setTempContact(null);
    }
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 300);

    if (chat?.lastMessageId) {
      fetch(`${MAIN}/api/teacher/messages/delivered`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messageId: chat.lastMessageId,
          userId: currentUser.id,
        }),
      });
    }
  };

  function ensureCorrectExtension(fileName, mimeType) {
    const extFromName = fileName.split(".").pop();

    // If filename already has an extension, keep it
    if (extFromName && extFromName.length <= 5 && fileName.includes(".")) {
      return fileName;
    }

    const map = {
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
      "text/plain": ".txt",
      "text/csv": ".csv",
    };

    const ext = map[mimeType] || "";
    return fileName + ext;
  }

  const getActiveTeacherInfo = () => {
    if (!selectedContact) {
      return { id: "", name: "Student", avatar: "/placeholder.svg" };
    }

    // 1. If student exists in chat history (has chatted before)
    const chat = chatContacts.find((c) => c.studentId === selectedContact);
    if (chat) {
      return {
        id: chat.studentId,
        name: chat.studentName,
        avatar: chat.avatar || "/placeholder.svg",
      };
    }

    // 2. If student exists in dropdown list (new student)
    const contact = contacts.find((s) => s.id === selectedContact);
    if (contact) {
      return {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar || "/placeholder.svg",
      };
    }

    // fallback
    return { id: "", name: "Student", avatar: "/placeholder.svg" };
  };
  function formatAMPM(date) {
    if (!date || isNaN(date.getTime())) return "Invalid time";

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 → 12
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
  }
  // HELPER: Safe date formatter - returns fallback if date is invalid
  function safeFormatTime(dateInput) {
    if (!dateInput) return "now";

    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    // <CHANGE> Check if date is valid before formatting
    if (!date || isNaN(date.getTime())) {
      return "now"; // fallback instead of "invalid time"
    }

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    minutes = String(minutes).padStart(2, "0");

    return `${hours}:${minutes} ${ampm}`;
  }
  return (
    <div className="message-container">
      <div className="content-header2">
        <h1>MESSAGE</h1>
        <div className="user-info">
          <span>Logged in as: {currentUser.name}</span>
        </div>
      </div>

      <div className="message-content">
        <div className="message-layout">
          {/* Contacts List */}
          <div
            className={`contacts-panel ${
              isChatOpen && window.innerWidth <= 768 ? "mobile-hidden" : ""
            }`}
          >
            <div className="contacts-header">
              <h3>Teacher: {currentUser.name}</h3>
              {contacts.filter((c) => c.unreadCount > 0).length > 0 && (
                <div className="total-unread-count">
                  Unread: {contacts.filter((c) => c.unreadCount > 0).length}
                </div>
              )}
            </div>

            <div className="search-container">
              <select
                value={selectedContact}
                onChange={(e) => handleContactClick(e.target.value)}
                className="search-input"
              >
                <option value="">Select a student to message</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="contacts-list">
              {/* ⭐ SHOW TEMP CONTACT (NEWLY SELECTED STUDENT) ⭐ */}
              {tempContact && (
                <div
                  className={`contact-item ${
                    selectedContact === tempContact.studentId ? "active" : ""
                  }`}
                  onClick={() => handleContactClick(tempContact.studentId)}
                >
                  <div className="contact-avatar">
                    <img
                      src={tempContact.avatar}
                      alt={tempContact.studentName}
                    />
                  </div>

                  <div className="contact-info">
                    <div className="contact-name">
                      {tempContact.studentName}
                    </div>
                    <div className="contact-last-message">
                      {tempContact.lastMessage}
                    </div>
                  </div>

                  <div className="contact-time-container"></div>
                </div>
              )}

              {/* ⭐ EXISTING CHAT CONTACTS ⭐ */}
              {chatContacts.map((chat) => (
                <div
                  key={chat.conversationId || chat.studentId + "_temp"}
                  className={`contact-item ${
                    selectedContact === chat.studentId ? "active" : ""
                  }`}
                  onClick={() => handleContactClick(chat.studentId)}
                >
                  <div className="contact-avatar">
                    <img src={chat.avatar} alt={chat.studentName} />
                  </div>

                  <div className="contact-info">
                    <div className="contact-name">{chat.studentName}</div>
                    <div className="contact-last-message">
                      {chat.lastMessage}
                    </div>
                  </div>

                  <div className="contact-time-container">
                    {chat.lastMessageTime && (
                      <div className="contact-time">
                        {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}

                    {chat.unreadCount > 0 && (
                      <div className="unread-count">{chat.unreadCount}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-panel">
            {isChatOpen ? (
              <>
                <div className="chat-header">
                  <button
                    className="back-button"
                    onClick={() => setIsChatOpen(false)}
                    style={{
                      display: window.innerWidth <= 768 ? "block" : "none",
                    }}
                  >
                    ← Back
                  </button>
                  <div className="chat-contact-info">
                    {(() => {
                      const studentInfo = getActiveTeacherInfo();
                      const statusClass =
                        statusText === "Online"
                          ? "online"
                          : statusText === "typing…"
                          ? "typing"
                          : "";
                      return (
                        <>
                          <img
                            src={studentInfo.avatar}
                            alt={studentInfo.name}
                            className="chat-avatar"
                          />

                          <div>
                            <span className="chat-contact-name">
                              {studentInfo.name}
                            </span>
                            <div
                              className={`chat-contact-status ${statusClass}`}
                            >
                              {statusText || ""}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div
                  className="chat-messages"
                  ref={messagesRef}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id || message.raw?.id || crypto.randomUUID()}
                      className={`message ${message.isOwn ? "own" : "other"}`}
                    >
                      <div
                        className="message-content"
                        onContextMenu={(e) => e.preventDefault()}
                        style={
                          isScreenshotAttempt
                            ? { backgroundColor: "black" }
                            : {}
                        }
                      >
                        {/* IMAGE MESSAGE */}
                        {message.isFile &&
                        message.fileType === "image" &&
                        message.fileUrl ? (
                          <div className="file-message">
                            {isScreenshotAttempt ? (
                              <div className="screenshot-blocked">
                                <div className="blocked-content">███</div>
                              </div>
                            ) : (
                              <img
                                src={message.fileUrl}
                                alt={message.text}
                                className="uploaded-image clickable"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/placeholder.svg";
                                  e.target.style.opacity = "0.5";
                                }}
                                onClick={() => {
                                  setModalContent(message.fileUrl);
                                  setModalFileName(
                                    message.fileName || "image.jpg"
                                  );
                                  setModalType("image");
                                  setShowModal(true);
                                }}
                              />
                            )}
                            <div className="message-text">
                              {isScreenshotAttempt ? "███" : message.text}
                            </div>
                          </div>
                        ) : message.isFile &&
                          message.fileType === "image" &&
                          !message.fileUrl ? (
                          /* IMAGE WITH BROKEN/MISSING URL */
                          <div className="file-message">
                            <div className="broken-file-placeholder">
                              <span className="broken-icon">🖼️</span>
                              <span className="broken-text">
                                Image unavailable
                              </span>
                            </div>
                            <div className="message-text">
                              {isScreenshotAttempt ? "███" : message.text}
                            </div>
                          </div>
                        ) : message.isFile &&
                          message.fileType === "video" &&
                          message.fileUrl ? (
                          /* VIDEO MESSAGE */
                          <div className="file-message">
                            {isScreenshotAttempt ? (
                              <div className="screenshot-blocked">
                                <div className="blocked-content">███</div>
                              </div>
                            ) : message.thumbnailUrl ? (
                              <div className="video-thumbnail-container">
                                <img
                                  src={message.thumbnailUrl}
                                  alt="Video thumbnail"
                                  className="video-thumbnail clickable"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder.svg";
                                  }}
                                  onClick={() => {
                                    setModalContent(message.fileUrl);
                                    setModalFileName(
                                      message.fileName || "video.mp4"
                                    );
                                    setModalType("video");
                                    setShowModal(true);
                                  }}
                                />
                                <div className="play-overlay">▶</div>
                              </div>
                            ) : (
                              <video
                                controls
                                className="uploaded-video clickable"
                                onClick={() => {
                                  setModalContent(message.fileUrl);
                                  setModalFileName(
                                    message.fileName || "video.mp4"
                                  );
                                  setModalType("video");
                                  setShowModal(true);
                                }}
                              >
                                <source
                                  src={message.fileUrl}
                                  type={message.fileType}
                                />
                                Your browser does not support the video tag.
                              </video>
                            )}
                            <div className="message-text">
                              {isScreenshotAttempt ? "███" : message.text}
                            </div>
                          </div>
                        ) : message.isFile &&
                          message.fileType === "document" &&
                          message.fileUrl ? (
                          <div className="file-message">
                            <div
                              className="document-preview clickable"
                              onClick={() => {
                                setModalContent(message.fileUrl);
                                setModalFileName(
                                  message.fileName || "document"
                                );
                                setModalMimeType(message.mimeType || "");
                                setModalType("document");
                                setShowModal(true);
                              }}
                            >
                              <div className="document-icon">📄</div>
                              <div className="document-info">
                                <div className="document-name">
                                  {isScreenshotAttempt
                                    ? "███"
                                    : message.fileName || "Document"}
                                </div>
                                <div className="document-size">
                                  {isScreenshotAttempt
                                    ? "███"
                                    : message.fileSize || ""}
                                </div>
                              </div>
                              <button
                                className="document-download-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalContent(message.fileUrl);
                                  setModalFileName(
                                    message.fileName || "document"
                                  );
                                  setModalMimeType(message.mimeType || "");
                                  setModalType("document");
                                  setShowModal(true);
                                }}
                                title="Download document"
                              >
                                ⬇️
                              </button>
                            </div>
                            <div className="message-text">
                              {isScreenshotAttempt ? "███" : message.text}
                            </div>
                          </div>
                        ) : message.isFile &&
                          message.fileType === "video" &&
                          !message.fileUrl ? (
                          /* VIDEO WITH BROKEN/MISSING URL */
                          <div className="file-message">
                            <div className="broken-file-placeholder">
                              <span className="broken-icon">🎥</span>
                              <span className="broken-text">
                                Video unavailable
                              </span>
                            </div>
                            <div className="message-text">
                              {isScreenshotAttempt ? "███" : message.text}
                            </div>
                          </div>
                        ) : message.isFile &&
                          message.fileType === "document" &&
                          !message.fileUrl ? (
                          /* DOCUMENT WITH BROKEN/MISSING URL */
                          <div className="file-message">
                            <div className="broken-file-placeholder">
                              <span className="broken-icon">📄</span>
                              <span className="broken-text">
                                Document unavailable
                              </span>
                            </div>
                            <div className="message-text">
                              {isScreenshotAttempt ? "███" : message.text}
                            </div>
                          </div>
                        ) : (
                          <div className="message-text">
                            {isScreenshotAttempt ? "███" : message.text}
                          </div>
                        )}
                        <div className="message-meta">
                          <div className="message-time">
                            {isScreenshotAttempt ? "███" : message.time}
                          </div>
                          {message.isOwn && (
                            <div className="message-status">
                              {message.status === "sending" && (
                                <span className="tick sending">🕐</span>
                              )}
                              {message.status === "failed" && (
                                <span className="tick failed">❌</span>
                              )}
                              {message.status === "sent" && (
                                <span className="tick single">✓</span>
                              )}
                              {message.status === "delivered" && (
                                <span className="tick double">✓✓</span>
                              )}
                              {message.status === "read" && (
                                <span className="tick double blue">✓✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {otherTyping && (
                    <div className="message other">
                      <div className="message-content typing-indicator">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-container">
                  <div
                    className="chat-input-wrapper"
                    style={{ position: "relative" }}
                  >
                    <input
                      type="text"
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);

                        fetch(`${MAIN}/api/teacher/messages/typing`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({
                            conversationId,
                            userId: currentUser.id,
                            isTyping: true,
                          }),
                        });

                        if (typingTimeout.current)
                          clearTimeout(typingTimeout.current);

                        typingTimeout.current = setTimeout(() => {
                          fetch(`${MAIN}/api/teacher/messages/typing`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              conversationId,
                              userId: currentUser.id,
                              isTyping: false,
                            }),
                          });
                        }, 1500);
                      }}
                      onKeyPress={handleKeyPress}
                      className="chat-input"
                    />

                    {/* Hidden file inputs */}
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e, "image")}
                    />
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e, "video")}
                    />
                    <input
                      type="file"
                      id="document-upload"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e, "document")}
                    />

                    {showUploadOptions && (
                      <div
                        className="upload-options"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="upload-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUploadOptions(false);
                            document.getElementById("image-upload").click();
                          }}
                        >
                          🖼️ Image
                        </button>
                        <button
                          className="upload-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUploadOptions(false);
                            document.getElementById("video-upload").click();
                          }}
                        >
                          🎥 Video
                        </button>
                        <button
                          className="upload-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUploadOptions(false);
                            document.getElementById("document-upload").click();
                          }}
                        >
                          📄 Document
                        </button>
                      </div>
                    )}

                    <button
                      className="pin-button"
                      onClick={() => setShowUploadOptions(!showUploadOptions)}
                      title="Attach file"
                    >
                      📎
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="send-button"
                      disabled={!messageText.trim()}
                    >
                      <span className="send-icon">➤</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="chat-placeholder">
                <div className="placeholder-content">
                  <h3>Select a contact to start chatting</h3>
                  <p>
                    Choose a student from the list to begin your conversation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing images, videos, and documents */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            {modalType === "image" ? (
              <>
                <img
                  src={modalContent}
                  alt="Full size"
                  className="modal-image"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="document-actions" style={{ marginTop: "10px" }}>
                  <button
                    className="download-btn"
                    onClick={async () => {
                      try {
                        const response = await fetch(modalContent);
                        if (!response.ok) return;
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = modalFileName || "image.jpg";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error("Download failed:", err);
                      }
                    }}
                  >
                    📥 Download Image
                  </button>
                </div>
              </>
            ) : modalType === "video" ? (
              <>
                <video
                  controls
                  className="modal-video"
                  autoPlay
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={modalContent} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="document-actions" style={{ marginTop: "10px" }}>
                  <button
                    className="download-btn"
                    onClick={async () => {
                      try {
                        const response = await fetch(modalContent);
                        if (!response.ok) return;
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = modalFileName || "video.mp4";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error("Download failed:", err);
                      }
                    }}
                  >
                    📥 Download Video
                  </button>
                </div>
              </>
            ) : modalType === "document" ? (
              <div className="modal-document">
                <div className="document-view-header">
                  <h3>Document Preview</h3>
                  <p>This document cannot be previewed in the browser.</p>
                </div>
                <div className="document-actions">
                  <button
                    className="download-btn"
                    onClick={async () => {
                      try {
                        const finalName = ensureCorrectExtension(
                          modalFileName,
                          modalMimeType
                        );

                        const response = await fetch(modalContent);
                        if (!response.ok) {
                          console.error("HTTP error:", response.status);
                          return;
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = url;
                        a.download = finalName; // ⭐ NOW HAS REAL EXTENSION
                        document.body.appendChild(a);
                        a.click();
                        a.remove();

                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error("Download failed:", err);
                      }
                    }}
                  >
                    📥 Download Document
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowWarningModal(false)}
        >
          <div
            className="warning-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowWarningModal(false)}
            >
              ×
            </button>
            <div className="warning-content">
              <h3>⚠️ Warning</h3>
              <p>
                Your message contains restricted content and cannot be sent.
                Please avoid sharing contact information or numbers.
              </p>
              <button
                className="warning-ok-btn"
                onClick={() => setShowWarningModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
