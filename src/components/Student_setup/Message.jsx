// Message.jsx
import { useState, useEffect, useRef } from "react";
import "./Message.css";

const API_BASE = "https://amjacademy-working.onrender.com/api/messages";
// If you deploy, you can change this to: const API_BASE = "/api/messages";

const Message = () => {
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


  // Map backend message -> UI message
  function mapBackendMsgToUI(msg) {
    const isOwn = msg.sender_id === currentUser.id;

    // Basic status: you can enhance later with message_statuses join
    let status = "sent";

    // If backend later returns statuses array, we can use it:
    if (msg.statuses || msg.message_statuses) {
      const statuses = msg.statuses || msg.message_statuses;
      const otherStatuses = statuses.filter(
        (s) => s.user_id !== msg.sender_id
      );
      if (otherStatuses.length > 0) {
        const o = otherStatuses[0];
        if (o.read_at) status = "read";
        else if (o.delivered_at) status = "delivered";
        else if (o.sent_at) status = "sent";
      }
    }

    return {
      id: msg.id,
      sender: msg.sender_id,
      text: msg.content,
      time: new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn,
      status,
      isFile: msg.type !== "text",
      fileType: msg.type,
      fileUrl: msg.file_url || msg.localFileUrl,   // fallback to local
      thumbnailUrl: msg.thumbnail_url,
      fileName: msg.file_name,
      fileSize: msg.file_size
        ? `${(msg.file_size / 1024 / 1024).toFixed(2)} MB`
        : null,
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
        `${API_BASE}/my-teachers?studentId=${encodeURIComponent(id)}`,
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
    const res = await fetch(
      `${API_BASE}/my-chats?userId=${id}`,
      { method: "GET", credentials: "include" }
    );

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
  loadTeachers();        // All teachers → for dropdown
  loadChatHistory();     // Only chats → for contacts-list
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

  // Load messages for a conversation
  const loadMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await fetch(`${API_BASE}/${convId}`, {
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

      // Mark latest unread message as read
      const lastUnread = mapped
        .filter(
          (m) =>
            !m.isOwn &&
            m.raw &&
            (!m.raw.statuses || !m.raw.statuses.some((s) => s.read_at))
        )
        .slice(-1)[0];

      if (lastUnread && currentUser.id) {
        await fetch(`${API_BASE}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messageId: lastUnread.id,
            conversationId: convId,
            userId: currentUser.id,
          }),
        });

        setMessages((prev) =>
          prev.map((pm) =>
            pm.id === lastUnread.id ? { ...pm, status: "read" } : pm
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
        const convRes = await fetch(`${API_BASE}/conversation`, {
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
          convBody.conversation_id ||
          convBody.conversationId ||
          convBody.id;

        setConversationId(convId);
        setIsChatOpen(true);

        await loadMessages(convId);

        // Mark messages as delivered for this user
        await fetch(`${API_BASE}/delivered`, {
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

  // Upload file to server (optional, falls back if 404)
  const uploadFileToServer = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.fileUrl || null;
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

    const serverFileUrl = await uploadFileToServer(file);

    const outgoing = {
      conversationId,
      content: `${
        type === "image" ? "🖼️" : type === "video" ? "🎥" : "📄"
      } ${file.name}`,
      type,
      fileUrl: serverFileUrl || fileUrlLocal,
      thumbnailUrl: thumbnailUrl,
      fileName: file.name,
      fileSize: file.size,
    };

    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender: currentUser.id,
      text: outgoing.content,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
      isFile: true,
      fileType: type,
      fileUrl: outgoing.fileUrl,
      thumbnailUrl: outgoing.thumbnailUrl,
      fileName: outgoing.fileName,
      fileSize: `${(outgoing.fileSize / 1024 / 1024).toFixed(2)} MB`,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API_BASE}/send`, {
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
      setMessages(prev =>
  prev.map(m =>
    m.id === tempMsg.id
      ? {
          ...m,
          id: sentMsg.id,
          status: "sent",
          fileUrl: sentMsg.file_url || m.fileUrl,   // DO NOT lose blob URL
          thumbnailUrl: sentMsg.thumbnail_url || m.thumbnailUrl,
        }
      : m
  )
);

    } catch (err) {
      console.error("file send error", err);
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
      const convRes = await fetch(`${API_BASE}/conversation`, {
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

    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender: currentUser.id,
      text: outgoing.content,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
      isFile: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setMessageText("");

    try {
      const res = await fetch(`${API_BASE}/send`, {
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
        prev.map((m) => (m.id === tempMsg.id ? mapBackendMsgToUI(sentMsg) : m))
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

  // Contact click
  const handleContactClick = (contactId) => {
    setSelectedContact(contactId);
    setIsChatOpen(true);
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, unreadCount: 0 } : c
      )
    );
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
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/plain": ".txt",
    "text/csv": ".csv",
  };

  const ext = map[mimeType] || "";
  return fileName + ext;
}

const getActiveTeacherInfo = () => {
  // 1. If teacher exists in chat history
  const fromChats = chatContacts.find(c => c.teacherId === selectedContact);
  if (fromChats) {
    return {
      id: fromChats.teacherId,
      name: fromChats.teacherName,
      avatar: fromChats.avatar || "/placeholder.svg",
    };
  }

  // 2. If teacher exists in dropdown list (unchatted)
  const fromTeachers = contacts.find(t => t.id === selectedContact);
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
                  Unread:{" "}
                  {contacts.filter((c) => c.unreadCount > 0).length}
                </div>
              )}
            </div>

            <div className="search-container">
              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
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
                      className={`contact-item ${selectedContact === chat.teacherId ? "active" : ""}`}
                      onClick={() => handleContactClick(chat.teacherId)}
                    >
                      <div className="contact-avatar">
                        <img src={chat.avatar} alt={chat.teacherName} />
                      </div>

                      <div className="contact-info">
                        <div className="contact-name">{chat.teacherName}</div>
                        <div className="contact-last-message">{chat.lastMessage}</div>
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
                      style={{ display: window.innerWidth <= 768 ? "block" : "none" }}
                    >
                      ← Back
                    </button>

                    <div className="chat-contact-info">
                     {(() => {
  const teacherInfo = getActiveTeacherInfo();
  return (
    <>
      <img
        src={teacherInfo.avatar}
        alt={teacherInfo.name}
        className="chat-avatar"
      />

      <div>
        <span className="chat-contact-name">{teacherInfo.name}</span>
        <div className="chat-contact-status">ID: {teacherInfo.id}</div>
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
                      className={`message ${
                        message.isOwn ? "own" : "other"
                      }`}
                    >
                      <div
                        className="message-content"
                        onContextMenu={(e) => e.preventDefault()}
                        style={
                          isScreenshotAttempt ? { backgroundColor: "black" } : {}
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
  setModalFileName(message.fileName || "document");
  setModalMimeType(message.mimeType || "");   // ⭐ ADD THIS
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
                      onChange={(e) => setMessageText(e.target.value)}
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
                  <p>Choose a teacher from the list to begin your conversation.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing images, videos, and documents */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
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
      const finalName = ensureCorrectExtension(modalFileName, modalMimeType);

      const response = await fetch(modalContent);
      if (!response.ok) {
        console.error("HTTP error:", response.status);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;    // ⭐ NOW HAS REAL EXTENSION
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
