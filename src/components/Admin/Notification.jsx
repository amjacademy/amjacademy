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

  // Who is viewing this page determines which notifications are visible
  const viewerKey = userType === "teacher" ? "teacher" : "admin"

  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (messages.length === 0) {
      const now = new Date()
      const demo = [
        {
          id: "demo-teacher-cancel-1",
          kind: "Class Cancelled",
          from: "Ms. Lisa",
          role: "teacher",
          text: "Today's keyboard class is cancelled due to health reasons.",
          createdAt: now.toISOString(),
          to: ["admin"], // teacher cancellation -> admin only
        },
        {
          id: "demo-student-leave-1",
          kind: "Leave Request",
          from: "Ajay",
          role: "student",
          text: "Requesting leave for tomorrow's session due to a family function.",
          createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
          to: ["admin", "teacher"], // student leave -> admin + teacher
        },
      ]
      setMessages(demo)
    }
  }, [messages.length, setMessages])

  const visibleMessages = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = messages.filter((m) => Array.isArray(m.to) && m.to.includes(viewerKey))
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
  }, [messages, viewerKey, search])

  return (
    <section className="nc">
      {/* Header */}
      <header className="nc-header">
        <div>
          <h2 className="nc-title">Notifications</h2>
          <p className="nc-subtitle">Read-only • Matches dashboard theme</p>
        </div>
        <div className="nc-tools">
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
                        From: <strong>{n.from || "Unknown"}</strong> {n.role ? `(${n.role})` : ""}
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
