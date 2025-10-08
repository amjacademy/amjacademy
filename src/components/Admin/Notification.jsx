"use client"

import { useEffect, useMemo, useState } from "react"
import "./Notification.css"

function useLocalStore(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

export default function Notifications({ userType = "admin" }) {
  // Admin inbox
  const [adminInbox, setAdminInbox] = useLocalStore("notif_admin", [])
  // Teacher inbox
  const [teacherInbox, setTeacherInbox] = useLocalStore("notif_teacher", [])
  // Student's own sent items (kept for compatibility with existing writes elsewhere)
  const [studentOutbox, setStudentOutbox] = useLocalStore("notif_student", [])

  const [messages, setMessages] = useLocalStore("notif_messages_v2", [])

  // who is viewing this page; student view shows items routed to admin (read-only fallback)
  const viewerKey = userType === "teacher" ? "teacher" : "admin"

  // Add demo notification if none exist
  useEffect(() => {
    if (messages.length === 0) {
      const demos = []
      demos.push({
        id: "demo-admin",
        kind: "Admin",
        text: "Welcome to AMJ Academy Admin! This is a demo notification for backend purposes.",
        from: "System",
        to: ["admin"],
        createdAt: new Date().toISOString(),
        read: false
      })
      demos.push({
        id: "demo-teacher",
        kind: "Welcome Teacher",
        text: "Welcome to AMJ Academy Teacher! This is a demo notification for backend purposes.",
        from: "System",
        to: ["teacher"],
        createdAt: new Date().toISOString(),
        read: false
      })
      demos.push({
        id: "demo-student",
        kind: "Welcome Student",
        text: "Welcome to AMJ Academy Student! This is a demo notification for backend purposes.",
        from: "System",
        to: ["student"],
        createdAt: new Date().toISOString(),
        read: false
      })
      setMessages(demos)
    }
  }, [messages.length, setMessages])

  const [search, setSearch] = useState("")
  const [mobileShowThreads, setMobileShowThreads] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const visibleMessages = useMemo(() => {
    const base = messages
    const q = search.trim().toLowerCase()
    const filtered = q
      ? base.filter(
          (m) =>
            (m.kind || "").toLowerCase().includes(q) ||
            (m.text || "").toLowerCase().includes(q) ||
            (m.teacher || "").toLowerCase().includes(q) ||
            (m.from || "").toLowerCase().includes(q),
        )
      : base
    // newest first
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [messages, search])

  useEffect(() => {
    if (!selectedId && visibleMessages.length > 0) {
      setSelectedId(visibleMessages[0].id)
    } else if (selectedId && !visibleMessages.find((m) => m.id === selectedId)) {
      setSelectedId(visibleMessages[0]?.id || null)
    }
  }, [visibleMessages, selectedId])

  const selected = useMemo(
    () => visibleMessages.find((m) => m.id === selectedId) || null,
    [visibleMessages, selectedId],
  )

  return (
    <section className="notif-app">
      <header className="notif-app__header">
        <div className="notif-app__left">
          <h2 className="notif-title">Notifications</h2>
          <p className="notif-subtitle">View-only inbox • aligned with dashboard theme</p>
        </div>
        <div className="notif-app__right">
          <button
            className="btn-outline small hide-desktop"
            type="button"
            onClick={() => setMobileShowThreads((v) => !v)}
          >
            {mobileShowThreads ? "Open Reader" : "Open List"}
          </button>
        </div>
      </header>

      <div className={`notif-layout ${mobileShowThreads ? "show-threads" : "show-chat"}`}>
        {/* Left: list */}
        <aside className="threads-panel">
          <div className="threads-search">
            <input
              className="input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search notifications"
            />
          </div>

          <ul className="threads-list" role="list">
            {visibleMessages.length === 0 ? (
              <li className="empty-convo">No notifications yet.</li>
            ) : (
              visibleMessages.map((m) => (
                <li key={m.id}>
                  <button
                    className={`thread-item ${selectedId === m.id ? "active" : ""} ${!m.read ? "unread" : ""}`}
                    onClick={() => {
                      setSelectedId(m.id)
                      setMobileShowThreads(false)
                      // Mark as read
                      setMessages(prev => prev.map(msg => msg.id === m.id ? {...msg, read: true} : msg))
                    }}
                  >
                    <div className="thread-avatar" aria-hidden>
                      {(m.from || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="thread-main">
                      <div className="thread-top">
                        <span className="thread-name">
                          {m.kind || "Notification"} {m.teacher ? `• ${m.teacher}` : ""}
                        </span>
                        <time className="thread-time">
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </time>
                      </div>
                      <div className="thread-sub">
                        <span className="thread-preview">{m.text || ""}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Right: reader */}
        <main className="chat-panel">
          <header className="chat-header">
            <div className="chat-peer">
              <button
                className="btn-outline small hide-desktop"
                type="button"
                onClick={() => setMobileShowThreads(true)}
              >
                Back
              </button>
              <div className="peer-avatar" aria-hidden>
                {selected ? (selected.from || "?").charAt(0).toUpperCase() : "A"}
              </div>
              <div>
                <div className="peer-name">{selected ? selected.kind || "Notification" : "Select a notification"}</div>
                <div className="peer-sub">
                  {selected
                    ? [selected.teacher, selected.date, selected.time].filter(Boolean).join(" • ")
                    : "Your inbox"}
                </div>
              </div>
            </div>
          </header>

          <div className="messages" role="log" aria-live="polite">
            {!selected ? (
              <div className="empty-convo">Choose a notification from the list.</div>
            ) : (
              <div className="msg them">
                <div className="bubble">
                  <div className="bubble-kind">{selected.kind || "Notification"}</div>
                  <div className="bubble-text">{selected.text}</div>
                  <div className="bubble-meta">
                    <span>{[selected.date, selected.time].filter(Boolean).join(" • ")}</span>
                    <span>
                      {selected.createdAt
                        ? new Date(selected.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Removed composer to make view-only */}
          {/* (no composer UI here) */}
        </main>
      </div>
    </section>
  )
}
