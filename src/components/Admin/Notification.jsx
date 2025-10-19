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

export default function Notifications({ userType = "admin", filterKind, filterRole }) {
  // Admin inbox
  const [adminInbox, setAdminInbox] = useLocalStore("notif_admin", [])
  // Teacher inbox
  const [teacherInbox, setTeacherInbox] = useLocalStore("notif_teacher", [])
  // Student's own sent items (kept for compatibility with existing writes elsewhere)
  const [studentOutbox, setStudentOutbox] = useLocalStore("notif_student", [])

  const [messages, setMessages] = useLocalStore("notif_messages_v2", [])

  // Who is viewing this page determines which notifications are visible
  const viewerKey = userType === "teacher" ? "teacher" : "admin"

  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState(null)
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    const now = new Date()
    const demo = [
      {
        id: "demo-student-leave-1",
        kind: "Leave Request",
        from: "Ajay",
        role: "student",
        text: "Requesting leave for tomorrow's keyboard class due to a family function.",
        createdAt: now.toISOString(),
        to: ["admin", "teacher"], // student leave -> admin + teacher
        redirectedFrom: "Ajay",
        read: false,
      },
      {
        id: "demo-teacher-leave-1",
        kind: "Leave Request",
        from: "Ms. Lisa",
        role: "teacher",
        text: "I am taking leave tomorrow for a personal appointment. Please arrange a substitute.",
        createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
        to: ["admin", "teacher"], // teacher leave -> admin and teacher
        redirectedFrom: "Ms. Lisa",
        read: false,
      },
      {
        id: "demo-student-cancel-1",
        kind: "Last Minute Cancellation",
        from: "Priya",
        role: "student",
        text: "I cannot attend today's piano class. I apologize for the short notice.",
        createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        to: ["admin", "teacher"], // student cancellation -> admin + teacher
        redirectedFrom: "Priya",
        read: false,
      },
      {
        id: "demo-teacher-cancel-1",
        kind: "Last Minute Cancellation",
        from: "Mr. David",
        role: "teacher",
        text: "Today's guitar class is cancelled due to an emergency. Will reschedule soon.",
        createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        to: ["admin", "teacher"], // teacher cancellation -> admin and teacher
        redirectedFrom: "Mr. David",
        read: false,
      },
    ]
    setMessages(demo)
  }, [])

  const visibleMessages = useMemo(() => {
    const q = search.trim().toLowerCase()
    let base = messages.filter((m) => Array.isArray(m.to) && m.to.includes(viewerKey))
    if (filterKind) {
      base = base.filter((m) => m.kind === filterKind)
    }
    if (filterRole) {
      base = base.filter((m) => m.role === filterRole)
    }
    if (filterType !== "all") {
      base = base.filter((m) => (m.role || "").toLowerCase() === filterType)
    }
    const filtered = q
      ? base.filter(
          (m) =>
            (m.kind || "").toLowerCase().includes(q) ||
            (m.text || "").toLowerCase().includes(q) ||
            (m.from || "").toLowerCase().includes(q) ||
            (m.role || "").toLowerCase().includes(q),
        )
      : base
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [messages, viewerKey, search, filterType, filterKind, filterRole])

  return (
    <section className="nc">
      {/* Header */}
      <header className="nc-header">
        <div>
          <h2 className="nc-title">Notifications</h2>
          <p className="nc-subtitle">Read-only • Matches dashboard theme</p>
        </div>
        <div className="nc-tools">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === "student" ? "active" : ""}`}
              onClick={() => setFilterType("student")}
            >
              Student
            </button>
            <button
              className={`filter-btn ${filterType === "teacher" ? "active" : ""}`}
              onClick={() => setFilterType("teacher")}
            >
              Teacher
            </button>
          </div>
          <input
            className="nc-search"
            placeholder="Search notifications"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notifications"
          />
        </div>
      </header>

      {/* Reference image (not rendered in UI, just to keep for dev reference)
          If you'd like it visible in the app, let me know and I can embed it.
      */}

      {/* List */}
      <ul className="nc-list" role="list">
        {visibleMessages.length === 0 ? (
          <li className="nc-empty">No notifications yet.</li>
        ) : (
          visibleMessages.map((n) => {
            const isTeacher = (n.role || "").toLowerCase() === "teacher"
            const avatarLetter = (n.from || "?").charAt(0).toUpperCase()
            const time = n.createdAt
              ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : ""
            return (
              <li key={n.id} className="nc-item">
                <button
                  className="nc-card"
                  onClick={() => setExpandedId((id) => (id === n.id ? null : n.id))}
                  aria-expanded={expandedId === n.id}
                >
                  <div className={`nc-avatar ${isTeacher ? "teacher" : "student"}`} aria-hidden>
                    {avatarLetter}
                  </div>
                  <div className="nc-main">
                    <div className="nc-row">
                      <div className="nc-heading">
                        <span className="nc-kind">{n.kind || "Notification"}</span>
                        <span className={`nc-pill ${isTeacher ? "pill-teacher" : "pill-student"}`}>
                          {isTeacher ? "Teacher" : "Student"}
                        </span>
                      </div>
                      <time className="nc-time">{time}</time>
                    </div>
                    <div className="nc-meta">
                      <span className="nc-from">
                        From: <strong>{n.redirectedFrom || n.from || "Unknown"}</strong> {n.role ? `(${n.role})` : ""}
                      </span>
                    </div>
                    <div className="nc-preview">{n.text}</div>
                    {expandedId === n.id && (
                      <div className="nc-detail">
                        <div className="nc-detail-line">
                          <span className="label">Delivered to</span>
                          <span className="value">{Array.isArray(n.to) ? n.to.join(", ") : "—"}</span>
                        </div>
                        <div className="nc-detail-line">
                          <span className="label">Received</span>
                          <span className="value">
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleString([], {
                                  month: "short",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <button
                          className="mark-read-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            const updatedMessages = messages.map((msg) =>
                              msg.id === n.id ? { ...msg, read: true } : msg,
                            )
                            setMessages(updatedMessages)
                          }}
                        >
                          {n.role === "teacher" ? "Reschedule" : "Mark as Read"}
                        </button>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
