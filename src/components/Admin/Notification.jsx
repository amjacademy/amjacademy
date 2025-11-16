"use client";

import { useEffect, useMemo, useState } from "react";
import "./Notification.css";

export default function Notifications({
  userType = "admin",
  filterKind = "",
  filterRole = "",
}) {

  const MAIN = "https://amjacademy-working.onrender.com";
  const TEST= "http://localhost:5000";

  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ filterRole, filterKind, search });
        const res = await fetch(
          `${MAIN}/api/notifications?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [filterRole, filterKind, search]);

  // ✅ Client-side filtering & ordering
  const visibleMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = messages;

    if (filterType !== "all") {
      base = base.filter(
        (m) => (m.role || "").toLowerCase() === filterType
      );
    }

    if (q) {
      base = base.filter(
        (m) =>
          (m.kind || "").toLowerCase().includes(q) ||
          (m.text || "").toLowerCase().includes(q) ||
          (m.from || "").toLowerCase().includes(q)
      );
    }

    // ✅ Sort: unread first, then by closest time to now
    const now = new Date();
    return base
      .slice()
      .sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return (
          Math.abs(new Date(a.createdAt) - now) -
          Math.abs(new Date(b.createdAt) - now)
        );
      });
  }, [messages, search, filterType]);

  // ✅ Mark as read handler
  const markAsRead = async (id) => {
    try {
      await fetch(
        `${MAIN}/api/notifications/mark-read/${id}`,
        {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <section className="nc">
      <header className="nc-header">
        <div>
          <h2 className="nc-title">Notifications</h2>
          <p className="nc-subtitle">
            Admin View • Sorted by recency & unread
          </p>
        </div>
        <div className="nc-tools">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${
                filterType === "all" ? "active" : ""
              }`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${
                filterType === "student" ? "active" : ""
              }`}
              onClick={() => setFilterType("student")}
            >
              Student
            </button>
            <button
              className={`filter-btn ${
                filterType === "teacher" ? "active" : ""
              }`}
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
          />
        </div>
      </header>

      {loading ? (
        <div className="nc-loading">Loading notifications...</div>
      ) : (
        <ul className="nc-list" role="list">
          {visibleMessages.length === 0 ? (
            <li className="nc-empty">No notifications found.</li>
          ) : (
            visibleMessages.map((n) => {
              const isTeacher = (n.role || "").toLowerCase() === "teacher";
              const avatarLetter = (n.from || "?").charAt(0).toUpperCase();
              const time = n.createdAt
                ? new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <li
                  key={n.id}
                  className={`nc-item ${n.read ? "read" : "unread"}`}
                  style={{
                    backgroundColor: n.read
                      ? "rgba(240,240,240,0.5)"
                      : "#fffdf7",
                    borderLeft: n.read
                      ? "4px solid #ccc"
                      : "4px solid #ffb703",
                  }}
                >
                  {/* ✅ Changed from <button> → <div role="button"> to fix nested button error */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="nc-card"
                    onClick={() =>
                      setExpandedId((id) => (id === n.id ? null : n.id))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedId((id) => (id === n.id ? null : n.id));
                      }
                    }}
                    aria-expanded={expandedId === n.id}
                  >
                    <div
                      className={`nc-avatar ${
                        isTeacher ? "teacher" : "student"
                      }`}
                      aria-hidden
                    >
                      {avatarLetter}
                    </div>
                    <div className="nc-main">
                      <div className="nc-row">
                        <div className="nc-heading">
                          <span className="nc-kind">
                            {n.kind || "Notification"}
                          </span>
                          <span
                            className={`nc-pill ${
                              isTeacher
                                ? "pill-teacher"
                                : "pill-student"
                            }`}
                          >
                            {isTeacher ? "Teacher" : "Student"}
                          </span>
                        </div>
                        <time className="nc-time">{time}</time>
                      </div>
                      <div className="nc-meta">
                        <span className="nc-from">
                          From:{" "}
                          <strong>
                            {n.redirectedFrom || n.from || "Unknown"}
                          </strong>{" "}
                          {n.role ? `(${n.role})` : ""}
                        </span>
                      </div>
                      <div className="nc-preview">{n.text}</div>

                      {expandedId === n.id && (
                        <div className="nc-detail">
                          <div className="nc-detail-line">
                            <span className="label">Class ID</span>
                            <span className="value">
                              {n.class_id || "—"}
                            </span>
                          </div>
                          <div className="nc-detail-line">
                            <span className="label">Delivered to</span>
                            <span className="value">
                              {Array.isArray(n.to)
                                ? n.to.join(", ")
                                : "—"}
                            </span>
                          </div>
                          <div className="nc-detail-line">
                            <span className="label">Received</span>
                            <span className="value">
                              {n.createdAt
                                ? new Date(
                                    n.createdAt
                                  ).toLocaleString([], {
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>

                          {!n.read && (
                            <button
                              className="mark-read-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                              }}
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </section>
  );
}
