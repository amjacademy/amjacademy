// Message.jsx
import { useState, useEffect, useRef } from "react";
import "./Message.css";
import { supabase } from "../../supabaseClient";

const API_BASE = import.meta.env.VITE_TEST
  ? `${import.meta.env.VITE_TEST}/api/messages`
  : "https://amjacademy-working.onrender.com/api/messages";

const Message = ({ onMessagesRead }) => {
  const MAIN = import.meta.env.VITE_MAIN;
  const TEST = import.meta.env.VITE_TEST;
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
  const [chatContacts, setChatContacts] = useState([]);
  const [modalMimeType, setModalMimeType] = useState("");
  const [tempContact, setTempContact] = useState(null);
  const [statusText, setStatusText] = useState("");
  const typingTimeout = useRef(null);

  // ---------- REALTIME STATE ----------
  const [otherTyping, setOtherTyping] = useState(false);
  const realtimeChannel = useRef(null);
  const globalRealtimeChannel = useRef(null);
  const conversationIdRef = useRef(null);
  const selectedContactRef = useRef(null);

  // Keep conversationIdRef in sync
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Keep selectedContactRef in sync
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Presence polling - fetch presence every 3 seconds
  useEffect(() => {
    if (!selectedContact) return;

    const fetchPresence = async () => {
      try {
        const res = await fetch(
          `${MAIN}/api/messages/presence/${selectedContact}`,
          { credentials: "include" }
        );
        if (!res.ok) return;

        const data = await res.json();
        if (!data || !data.data) return;

        const p = data.data;

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

  // Update status text when otherTyping changes
  useEffect(() => {
    if (otherTyping) {
      setStatusText("typing…");
    }
  }, [otherTyping]);

  function isOnline(lastSeen) {
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 10000; // 10sec rule
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

  function formatAMPM(date) {
    if (!date || isNaN(date.getTime())) return "Invalid time";

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
  }

  // Map backend message -> UI message
  function mapBackendMsgToUI(msg) {
    const isOwn = String(msg.sender_id) === String(currentUser.id);

    let status = "sent";

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

    // Detect mimeType from file extension
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
      if (url.startsWith("blob:")) return false;
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
      created_at:
        msg.created_at || msg.raw?.created_at || new Date().toISOString(),
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

  // Load teachers from backend
  const loadTeachers = async () => {
    const id = localStorage.getItem("user_id");

    if (!id) {
      console.error("No user_id found in localStorage. Cannot load teachers.");
      return;
    }

    try {
      const res = await fetch(
        `${MAIN}/api/messages/my-teachers?studentId=${encodeURIComponent(id)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch teachers");
      }

      const teachers = await res.json();

      setContacts(
        (teachers || []).map((t) => ({
          id: t.id,
          name: t.name,
          lastMessage: "No Communication Available",
          time: "",
          avatar: "/placeholder.svg?height=50&width=50",
          online: false,
          status: "Last seen recently",
          unreadCount: 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };

  const loadChatHistory = async () => {
    const id = localStorage.getItem("user_id");
    if (!id) return;

    try {
      const res = await fetch(`${MAIN}/api/messages/my-chats?userId=${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch chat history");

      const chats = await res.json();
      console.log("Loaded chat history:", chats);
      setChatContacts(chats);
    } catch (err) {
      console.error("Chat history error", err);
    }
  };

  // On mount: set current user from localStorage and load teachers
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const name = localStorage.getItem("username");

    setCurrentUser({ id: id || "", name: name || "" });
    loadTeachers(); // All teachers → for dropdown
    loadChatHistory(); // Only chats → for contacts-list
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

  // ⭐ STUDENT PRESENCE HEARTBEAT - Update last_seen every 5 seconds
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const updatePresence = async () => {
      try {
        await fetch(`${MAIN}/api/messages/last-seen`, {
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

  // ⭐ GLOBAL REALTIME SUBSCRIPTION - Listen to ALL messages for this student
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    console.log(
      "🌐 Setting up global realtime subscription for student:",
      userId
    );

    // Subscribe to all messages table changes
    const globalChannel = supabase.channel("global-messages-student-" + userId);

    globalChannel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      async (payload) => {
        console.log("🌐 STUDENT: GLOBAL MESSAGE RECEIVED:", payload.new);

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
            // Add the incoming message to the chat using mapBackendMsgToUI
            const userId = localStorage.getItem("user_id");
            const isValidFileUrl = (url) => {
              if (!url) return false;
              if (url.startsWith("blob:")) return false;
              return true;
            };

            const newMsg = {
              id: payload.new.id,
              sender: payload.new.sender_id,
              sender_id: payload.new.sender_id,
              text: payload.new.content || "",
              content: payload.new.content || "",
              created_at: payload.new.created_at,
              time: formatAMPM(new Date(payload.new.created_at)),
              isOwn: false,
              status: "delivered",
              isFile: payload.new.type !== "text",
              fileType: payload.new.type,
              fileUrl: isValidFileUrl(payload.new.file_url)
                ? payload.new.file_url
                : null,
              thumbnailUrl: isValidFileUrl(payload.new.thumbnail_url)
                ? payload.new.thumbnail_url
                : null,
              fileName: payload.new.file_name,
              fileSize: payload.new.file_size
                ? `${(payload.new.file_size / 1024 / 1024).toFixed(2)} MB`
                : null,
              mimeType: payload.new.mime_type || "",
              raw: payload.new,
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
            fetch(`${MAIN}/api/messages/delivered`, {
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

    globalChannel.subscribe((status) => {
      console.log("🌐 Student global realtime subscription status:", status);
    });

    globalRealtimeChannel.current = globalChannel;

    return () => {
      console.log("🌐 Cleaning up student global realtime subscription");
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
      const res = await fetch(`${MAIN}/api/messages/${convId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Failed to fetch messages");
        return;
      }
      const data = await res.json();
      const mapped = (data || []).map(mapBackendMsgToUI);
      setMessages(mapped);

      // Find ALL unread messages from the other user
      const unreadMessages = mapped.filter(
        (m) =>
          !m.isOwn &&
          m.raw &&
          (!m.raw.statuses || !m.raw.statuses.some((s) => s.read_at))
      );

      // Mark ALL unread messages as read
      if (unreadMessages.length > 0 && currentUser.id) {
        // Mark each message as read
        for (const unreadMsg of unreadMessages) {
          try {
            await fetch(`${MAIN}/api/messages/read`, {
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
        const convRes = await fetch(`${MAIN}/api/messages/conversation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            otherUserId: selectedContact,
            userId: currentUser.id,
          }),
        });

        if (!convRes.ok) {
          console.error("Failed to create/get conversation");
          return;
        }

        const convBody = await convRes.json();
        const convId =
          convBody.conversation_id || convBody.conversationId || convBody.id;

        setConversationId(convId);
        setIsChatOpen(true);

        await loadMessages(convId);

        // Mark messages as delivered for this user
        await fetch(`${MAIN}/api/messages/delivered`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            conversationId: convId,
            userId: currentUser.id,
          }),
        });
      } catch (err) {
        console.error("selectContact error", err);
      }
    })();
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

  /* function createDownloadUrl(url) {
  if (!url) return null;

  const split = url.split("/upload/");
  if (split.length < 2) return url;

  return `${split[0]}/upload/fl_attachment/${split[1]}`;
} */

  // Upload file to Cloudinary server
  const uploadFileToServer = async (file, type) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type); // Send type to help server determine resource_type

      const res = await fetch(`${MAIN}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        console.error("Upload failed:", res.status);
        return null;
      }

      const data = await res.json();
      console.log("📤 Upload success:", data);
      return data.fileUrl || data.url || null;
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
    if (!file || !conversationId || !currentUser.id) return;

    const fileUrlLocal = URL.createObjectURL(file);
    let thumbnailUrl = null;

    if (type === "video") {
      thumbnailUrl = await generateVideoThumbnail(file);
    }

    // Detect mime type
    const detectMimeType = (fileName) => {
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

    const mimeType = detectMimeType(file.name);

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      sender: currentUser.id,
      sender_id: currentUser.id,
      text: `${type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"} ${
        file.name
      }`,
      content: `${type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"} ${
        file.name
      }`,
      created_at: new Date().toISOString(),
      time: formatAMPM(new Date()),
      isOwn: true,
      status: "sending",
      isFile: true,
      fileType: type,
      fileUrl: fileUrlLocal,
      thumbnailUrl: thumbnailUrl,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      mimeType: mimeType,
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Upload to Cloudinary
    const serverFileUrl = await uploadFileToServer(file, type);

    if (!serverFileUrl) {
      console.error("File upload failed");
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
      return;
    }

    const outgoing = {
      conversationId,
      content: tempMsg.text,
      type,
      fileUrl: serverFileUrl,
      thumbnailUrl: thumbnailUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: mimeType,
    };

    try {
      const res = await fetch(`${MAIN}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...outgoing,
          senderId: currentUser.id,
        }),
      });
      if (!res.ok) throw new Error("send failed");
      const sentMsg = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: sentMsg.id,
                status: "sent",
                fileUrl: sentMsg.file_url || serverFileUrl,
                thumbnailUrl: sentMsg.thumbnail_url || m.thumbnailUrl,
              }
            : m
        )
      );
    } catch (err) {
      console.error("file send error", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
    }
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
      const convRes = await fetch(`${MAIN}/api/messages/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          otherUserId: selectedContact,
          userId: currentUser.id,
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
    }

    const outgoing = {
      conversationId: convId,
      content: messageText,
      type: "text",
    };

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      sender: currentUser.id,
      sender_id: currentUser.id,
      text: outgoing.content,
      content: outgoing.content,
      created_at: new Date().toISOString(),
      time: formatAMPM(new Date()),
      isOwn: true,
      status: "sending",
      isFile: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setMessageText("");

    // Clear typing indicator after sending
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    if (convId) {
      try {
        await fetch(`${MAIN}/api/messages/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            conversationId: convId,
            userId: currentUser.id,
            isTyping: false,
          }),
        });
      } catch (err) {
        // Ignore typing errors
      }
    }

    try {
      const res = await fetch(`${MAIN}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...outgoing,
          senderId: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error("send failed");
      const sentMsg = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...mapBackendMsgToUI(sentMsg), status: "sent" }
            : m
        )
      );
    } catch (err) {
      console.error("sendMessage error", err);
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Contact click
  const handleContactClick = (contactId) => {
    // If empty contactId, close chat
    if (!contactId) {
      setSelectedContact("");
      setConversationId(null);
      setIsChatOpen(false);
      setTempContact(null);
      setMessages([]);
      return;
    }

    setSelectedContact(contactId);
    setIsChatOpen(true);
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, unreadCount: 0 } : c
      )
    );
    setChatContacts((prev) =>
      prev.map((c) =>
        c.teacherId === contactId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  // ⭐ CONVERSATION-SPECIFIC REALTIME - Subscribe to typing from conversation_participants
  useEffect(() => {
    if (!conversationId || !currentUser.id) return;

    console.log(
      "🎯 Setting up conversation-specific realtime for:",
      conversationId
    );

    // Clean up previous channel
    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }

    const channel = supabase.channel("conv-" + conversationId);

    // Listen to typing changes in conversation_participants
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversation_participants",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log("📝 Conversation participant update:", payload.new);

        // If it's the OTHER user updating their typing status
        if (String(payload.new.user_id) !== String(currentUser.id)) {
          const isTyping = payload.new.is_typing;
          console.log("📝 Other user typing status:", isTyping);

          setOtherTyping(isTyping);

          if (isTyping) {
            setStatusText("typing…");
          } else {
            // Will be updated by presence polling
          }
        }
      }
    );

    channel.subscribe((status) => {
      console.log("🎯 Conversation realtime subscription status:", status);
    });

    realtimeChannel.current = channel;

    return () => {
      console.log("🎯 Cleaning up conversation-specific realtime");
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }
    };
  }, [conversationId, currentUser.id]);

  // Typing indicator - send to server when user types
  const handleTypingChange = async (e) => {
    setMessageText(e.target.value);

    // Send typing indicator - only if we have a conversation
    if (!currentUser.id || !conversationId) return;

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set typing true
    try {
      await fetch(`${MAIN}/api/messages/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId,
          userId: currentUser.id,
          isTyping: true,
        }),
      });
    } catch (err) {
      // Ignore typing errors
    }

    // After 2 seconds of no typing, set typing false
    typingTimeout.current = setTimeout(async () => {
      try {
        await fetch(`${MAIN}/api/messages/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            conversationId,
            userId: currentUser.id,
            isTyping: false,
          }),
        });
      } catch (err) {
        // Ignore typing errors
      }
    }, 2000);
  };

  function createDownloadUrl(url, fileName) {
    if (!url) return null;
    return `${url}?fl_attachment=${encodeURIComponent(fileName)}`;
  }

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
    // 1. If teacher exists in chat history
    const fromChats = chatContacts.find((c) => c.teacherId === selectedContact);
    if (fromChats) {
      return {
        id: fromChats.teacherId,
        name: fromChats.teacherName,
        avatar: fromChats.avatar || "/placeholder.svg",
      };
    }

    // 2. If teacher exists in dropdown list (unchatted)
    const fromTeachers = contacts.find((t) => t.id === selectedContact);
    if (fromTeachers) {
      return {
        id: fromTeachers.id,
        name: fromTeachers.name,
        avatar: fromTeachers.profile || "/placeholder.svg",
      };
    }

    // default fallback
    return { id: "", name: "Teacher", avatar: "/placeholder.svg" };
  };

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
              <h3>Student: {currentUser.name}</h3>
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
                <option value="">Select a teacher to message</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="contacts-list">
              {chatContacts.map((chat) => (
                <div
                  key={chat.teacherId}
                  className={`contact-item ${
                    selectedContact === chat.teacherId ? "active" : ""
                  }`}
                  onClick={() => handleContactClick(chat.teacherId)}
                >
                  <div className="contact-avatar">
                    <img src={chat.avatar} alt={chat.teacherName} />
                  </div>

                  <div className="contact-info">
                    <div className="contact-name">{chat.teacherName}</div>
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
                      const teacherInfo = getActiveTeacherInfo();
                      const statusClass =
                        statusText === "Online"
                          ? "online"
                          : statusText === "typing…"
                          ? "typing"
                          : "";
                      return (
                        <>
                          <img
                            src={teacherInfo.avatar}
                            alt={teacherInfo.name}
                            className="chat-avatar"
                          />

                          <div>
                            <span className="chat-contact-name">
                              {teacherInfo.name}
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
                      key={message.id}
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
                                onClick={() => {
                                  setModalContent(message.fileUrl);
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
                          message.fileType === "video" &&
                          message.fileUrl ? (
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
                                  onClick={() => {
                                    setModalContent(message.fileUrl);
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
                                  setModalMimeType(message.mimeType || ""); // ⭐ ADD THIS
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
                                <span className="tick clock">🕐</span>
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
                              {message.status === "failed" && (
                                <span className="tick failed">❌</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator Animation */}
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
                      onChange={handleTypingChange}
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
                    Choose a teacher from the list to begin your conversation.
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
              <img
                src={modalContent}
                alt="Full size"
                className="modal-image"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : modalType === "video" ? (
              <video
                controls
                className="modal-video"
                autoPlay
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={modalContent} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
