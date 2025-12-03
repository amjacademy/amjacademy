"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Profile from "./Profile.jsx";
import Message from "./Message.jsx";
// import Notification from "../Admin/Notification.jsx"
import Footer from "../Footer/footer.jsx";
import ClassReport from "./class-report.jsx";
import MyAssignments from "./my-assignments.jsx";
import PunctualityReport from "./punctuality-report.jsx";
import LeaveModal from "../common/LeaveModal.jsx";
import { supabase } from "../../supabaseClient.js";
const Dashboard = () => {
  const navigate = useNavigate();
  const userType = "teacher";
  const userId = localStorage.getItem("user_id");
  const MAIN = import.meta.env.VITE_MAIN;
  const TEST = "http://localhost:5000/api/teacher";
  const API_BASE = "http://localhost:5000/api";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard"); // This would come from auth context
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignmentsOpen, setAssignmentsOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [groupClasses, setGroupClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveClass, setSelectedLeaveClass] = useState(null);
  const [ongoingClass, setOngoingClass] = useState(null);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [incompleteAssessmentsCount, setIncompleteAssessmentsCount] =
    useState(1); // Static count for now, 1 incomplete out of 3
  const [messageUnreadCount, setMessageUnreadCount] = useState(2); // Static count for now, based on contacts with unread messages

  // helper: convert "date" + "time" strings into an ISO-like datetime (sessionAt)
  // Works for most server formats like "2025-11-17" + "14:30:00" or "14:30"
  const makeSessionAtFromDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return null;
    // If timeStr already looks like an ISO with timezone (contains 'T' or 'Z'), return it.
    if (timeStr && (timeStr.includes("T") || timeStr.includes("Z"))) {
      return timeStr;
    }
    // Normalize time (if only HH:MM or HH:MM:SS)
    const t = (timeStr || "00:00").split(".")[0]; // remove milliseconds if any
    // join
    try {
      const iso = `${dateStr}T${t}`;
      // create Date and return ISO string (preserves timezone conversion performed by JS)
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        // fallback: try without T (some servers return space)
        const d2 = new Date(`${dateStr} ${t}`);
        return isNaN(d2.getTime()) ? null : d2.toISOString();
      }
      return d.toISOString();
    } catch (err) {
      return null;
    }
  };

  // Unified formatters for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatTimeExact = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  //Announcement fetch
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${MAIN}/api/teacher/fetchannouncements?`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error("Error fetching announcements:", err.message);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const announcementClosed = localStorage.getItem("announcementClosed");
    if (announcementClosed === "true") {
      setShowAnnouncement(false);
    }
  }, []);

  // Function to refresh unread message count
  const refreshUnreadCount = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${MAIN}/api/messages/unread-count?userId=${userId}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setMessageUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
      setMessageUnreadCount(0);
    }
  };

  // Fetch unread message count on mount
  useEffect(() => {
    if (userId) {
      refreshUnreadCount();
    }
  }, [userId]);

  // Reset count when switching to message tab, then refresh when leaving
  useEffect(() => {
    if (activeTab === "message") {
      setMessageUnreadCount(0);
    } else {
      // Refresh count when leaving message tab
      refreshUnreadCount();
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60); // every 1 minute

    return () => clearInterval(timer); // cleanup
  }, []);

  // Fetch incomplete assessment count
  useEffect(() => {
    const fetchIncompleteCount = async () => {
      try {
        const response = await fetch(
          `${MAIN}/api/assessments/incomplete-count/${userId}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          setIncompleteAssessmentsCount(data.incompleteCount || 0);
        }
      } catch (err) {
        console.error("Error fetching incomplete assessment count:", err);
        setIncompleteAssessmentsCount(0);
      }
    };

    if (userId) {
      fetchIncompleteCount();
    }
  }, [userId]);

  // Get username from localStorage
  const username = localStorage.getItem("username") || "User";
  const getInitials = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return "U";
    const firstLetter = trimmedName[0].toUpperCase();
    const lastLetter = trimmedName[trimmedName.length - 1].toUpperCase();
    return firstLetter + lastLetter;
  };
  const initials = getInitials(username);

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem("announcementClosed", "true");
  };

  const [studentId] = useState(1);

  const fetchOngoingClass = async () => {
    try {
      const res = await fetch(`${MAIN}/api/teacher/ongoing-class`, {
        headers: {
          "Content-Type": "application/json",
          user_id: userId,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success || !data.ongoingClass) return;

      const cls = data.ongoingClass;

      const sessionAt =
        makeSessionAtFromDateTime(cls.date, cls.time) ||
        cls.time ||
        cls.session_at;

      const formatted = {
        title: `${cls.subject} Class`,
        time: sessionAt,
        teachers: [cls.teacher_name],
        duration: "45 mins",
        batch: cls.batch_type,
        level: "",
        plan: "",
        teacherId: cls.teacher_id,
        image: "/images/amj-logo.png",
        link: cls.link,
      };

      setOngoingClass(formatted);
    } catch (err) {
      console.error("Failed ongoing fetch:", err);
    }
  };

  const refreshUpcomingClasses = async () => {
    try {
      const res = await fetch(`${MAIN}/api/teacher/upcoming-classes`, {
        headers: { user_id: userId },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUpcomingClasses(data.upcomingClasses);
      }
    } catch (err) {
      console.error("Failed upcoming refresh:", err);
    }
  };

  //ongoing class
  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        const response = await fetch(`${MAIN}/api/teacher/ongoing-class`, {
          headers: {
            "Content-Type": "application/json",
            user_id: userId,
          },
          credentials: "include",
        });

        const data = await response.json();

        if (data.success && data.ongoingClass) {
          const cls = data.ongoingClass;

          // convert date + time → ISO
          const sessionAt =
            makeSessionAtFromDateTime(cls.date, cls.time) ||
            cls.time ||
            cls.session_at;

          const formatted = {
            title: `${cls.subject} Class`,
            time: sessionAt,
            students: cls.students, // array already provided by
            duration: "45 mins",
            batch: cls.batch_type,
            level: cls.level || "", // backend does NOT send level,
            plan: cls.plan || "", // backend does NOT send plan,
            image: "/images/amj-logo.png",
            link: cls.link,
          };

          setOngoingClass(formatted);
        }
      } catch (err) {
        console.error("Error fetching ongoing class:", err);
      }
    };

    fetchOngoing();
  }, [userId]);

  //Upcoming class fetch
  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${MAIN}/api/teacher/upcoming-classes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            user_id: userId,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Map backend data to unify with group classes by adding sessionAt
          const classes = data.upcomingClasses.map((cls) => {
            const sessionAt =
              makeSessionAtFromDateTime(cls.date, cls.time) ||
              cls.time ||
              cls.session_at;

            // create students array based on batch type
            const students =
              cls.batch_type === "dual"
                ? [cls.student1_name, cls.student2_name].filter(Boolean)
                : [cls.student1_name];

            // teacher only shows ONE level (your requirement)
            const level = cls.student1_level || cls.student2_level || ""; // pick whichever exists

            // plan also single
            const plan = cls.student1_plan || cls.student2_plan || "";

            return {
              id:
                cls.class_id + "_" + (cls.date || "") + "_" + (cls.time || ""),
              type: "individual",
              sessionAt,
              rawDate: cls.date,
              rawTime: cls.time,

              batch: cls.batch_type,
              students, // 👈 BOTH student names for dual batch

              level, // 👈 Single level
              plan, // 👈 Single plan

              duration: cls.duration || "45 mins",

              title: `${cls.student1_profession || ""} Class`,

              status: cls.status || "Upcoming",
              link: cls.link,
              class_id: cls.class_id,
              rescheduled: cls.rescheduled,

              image: "/images/amj-logo.png",
            };
          });

          setUpcomingClasses(classes);
        } else {
          console.error(
            "Failed to fetch upcoming classes:",
            data.message || data || "No error message"
          );
        }
      } catch (err) {
        console.error("Error fetching upcoming classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingClasses();
  }, [userId]);

  //Group class fetch
  useEffect(() => {
    const fetchGroupClasses = async () => {
      try {
        const response = await fetch(`${MAIN}/api/teacher/fetchgroupclasses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            user_id: userId,
          },
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          const formatted = data.classes.map((cls) => {
            const sessionAt =
              cls.session_at || makeSessionAtFromDateTime(cls.date, cls.time);
            return {
              type: "group",
              groupId: cls.group_id,
              groupName: cls.group_arrangements.group_name,
              students: cls.students, // ⬅ backend already provides array
              classLink: cls.group_arrangements.class_link,
              sessionAt, // ISO
              sessionNumber: cls.session_number,
              totalSessions: cls.group_arrangements.schedule_for,
              sessionForWeek: cls.group_arrangements.session_for_week,
              duration: cls.duration,
              status: cls.status,

              // day removed intentionally
            };
          });

          setGroupClasses(formatted);
        }
      } catch (err) {
        console.error("Error fetching group classes:", err);
      }
    };

    fetchGroupClasses();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("class-status-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "class_statuses",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;

          if (newStatus === "ongoing") {
            fetchOngoingClass(); // show card
          } else {
            setOngoingClass(null); // hide card
          }

          refreshUpcomingClasses(); // refresh upcoming
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "message", label: "Message", icon: "💬", count: messageUnreadCount },
    { id: "class-report", label: "Class Report", icon: "📊" },
    {
      id: "assignments",
      label: "My Assignments",
      icon: "📝",
      count: incompleteAssessmentsCount,
    },
    { id: "punctuality-report", label: "Punctuality Report", icon: "⏰" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAssignments = () => {
    setAssignmentsOpen(!assignmentsOpen);
  };

  const toggleNotification = () => {
    setNotificationOpen(!notificationOpen);
  };

  const handleLeaveSubmit = async (leaveData) => {
    if (!selectedLeaveClass) return;

    try {
      const payload = {
        user_id: userId,
        class_id: selectedLeaveClass.class_id,
        action_type: leaveData.actionType,
        reason: leaveData.reason || "",
        role: "teacher",
      };

      const response = await fetch(`${MAIN}/api/student/actions/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        alert("Request submitted successfully!");
        setShowLeaveModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Failed to submit request: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error submitting request. Try again later.");
    }
  };

  // Utility: check join enable window based on ISO sessionAt string
  const isJoinEnabled = (sessionAt) => {
    if (!sessionAt) return false;
    const now = new Date();
    const classDateTime = new Date(sessionAt);
    const fiveMinutesBefore = new Date(classDateTime.getTime() - 5 * 60 * 1000);
    const fifteenMinutesAfter = new Date(
      classDateTime.getTime() + 15 * 60 * 1000
    );
    return now >= fiveMinutesBefore && now <= fifteenMinutesAfter;
  };

  // handleJoin for individual classes (existing)
  const handleJoinClass = async (classItem) => {
    try {
      window.open(classItem.link, "_blank");
      setOngoingClass(classItem);

      const response = await fetch(`${MAIN}/api/teacher/joinclass`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classItem.class_id,
          status: "ongoing",
          user_id: userId,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUpcomingClasses((prev) =>
          prev.filter((c) => c.class_id !== classItem.class_id)
        );
        setSelectedClassId(classItem.class_id);
      } else {
        console.error("❌ Failed to update status:", data.message);
      }
    } catch (err) {
      console.error("⚠️ Error updating status:", err);
    }
  };

  // JOIN GROUP CLASS HANDLER
  const handleJoinGroupClass = async (cls) => {
    try {
      window.open(cls.classLink, "_blank");

      const ongoing = {
        type: "group",
        title: cls.groupName,
        time: cls.sessionAt,
        studentId: cls.studentId,
        duration: "45 mins",
        batch: "Group",
        level: "N/A",
        plan: `${cls.sessionNumber} / ${cls.totalSessions}`,
        students: [cls.studentId],
        image: "/images/amj-logo.png",
        link: cls.classLink,
      };

      setOngoingClass(ongoing);

      // remove from group list
      setGroupClasses((prev) =>
        prev.filter((g) => g.sessionAt !== cls.sessionAt)
      );
    } catch (err) {
      console.error("Error joining group class:", err);
    }
  };

  // Leave / LMC enable functions (use sessionAt)
  const isLeaveEnabled = (sessionAt) => {
    if (!sessionAt) return false;
    const now = new Date();
    const classStart = new Date(sessionAt);
    const oneHourBeforeJoin = new Date(
      classStart.getTime() - (360 + 5) * 60 * 1000
    ); // 1h5m before
    return now < oneHourBeforeJoin;
  };

  const isLastMinuteCancelEnabled = (sessionAt) => {
    if (!sessionAt) return false;
    const now = new Date();
    const classStart = new Date(sessionAt);
    const lmcStart = new Date(classStart.getTime() - 65 * 60 * 1000); // 1h5m before
    const joinEnableTime = new Date(classStart.getTime() - 5 * 60 * 1000); // 5m before
    return now >= lmcStart && now < joinEnableTime;
  };

  // Combine & sort by absolute closeness to now (closest first)
  const combineClasses = () => {
    const now = new Date();

    // merge both lists (individual + group)
    const merged = [
      ...upcomingClasses.map((c) => ({ ...c, type: "individual" })),
      ...groupClasses.map((g) => ({ ...g, type: "group" })),
    ];

    // filter out classes whose sessionAt is in the past
    const futureClasses = merged.filter((cls) => {
      const date = new Date(cls.sessionAt);
      const fifteenMinutesAfter = new Date(date.getTime() + 15 * 60000);
      return fifteenMinutesAfter > now;
    });

    // sort closest to now (earliest future class first)
    futureClasses.sort((a, b) => {
      const dateA = new Date(a.sessionAt);
      const dateB = new Date(b.sessionAt);
      return dateA - dateB; // earliest first
    });

    return futureClasses;
  };

  const allClasses = combineClasses();

  // Unified card: individual & group will appear visually identical.
  // We'll render individuals and groups inside the same card layout.
  const ClassCard = ({ cls }) => {
    // cls.sessionAt is ISO string
    const sessionAt = cls.sessionAt;
    const isGroup = cls.type === "group";

    // unify display fields
    const title = isGroup
      ? cls.groupName || "Group Class"
      : cls.title || "Class";
    // 1️⃣ STUDENT NAME — correct field
    const studentName = Array.isArray(cls.students)
      ? cls.students.join(", ")
      : "";

    // 2️⃣ DURATION — group = 50 mins
    const duration = isGroup
      ? cls.duration || "50 mins" // <-- FIXED
      : cls.duration || "45 mins";

    // plan badge already correct for group
    const planBadge = isGroup
      ? `${cls.sessionNumber}/${cls.totalSessions}`
      : cls.plan || "";

    return (
      <div
        key={isGroup ? `${cls.groupId}_${sessionAt}` : cls.id}
        className={`class-card-horizontal ${
          cls.rescheduled ? "rescheduled-card" : ""
        }`}
      >
        <div className="class-image">
          <img src={cls.image || "/images/amj-logo.png"} alt={title} />
        </div>

        <div className="class-info">
          <div className="class-time">
            {formatDate(sessionAt)}&nbsp;&nbsp;Time:&nbsp;
            {formatTimeExact(sessionAt)}
          </div>

          <div className="class-badges">
            {isGroup ? (
              <span className="badge group">GROUP</span>
            ) : (
              <span className="badge individual">{cls.batch}</span>
            )}

            {planBadge ? (
              <span className="badge keyboard">{planBadge}</span>
            ) : null}

            <span
              className={`badge ${
                cls.rescheduled ? "rescheduled" : "not-started"
              }`}
            >
              {cls.rescheduled ? "Rescheduled" : cls.status || "Not started"}
            </span>
          </div>

          <div className="class-details">
            {isGroup && (
              <p style={{ fontWeight: "600", marginBottom: "4px" }}>
                Group Name: {cls.groupName}
              </p>
            )}
            <p>Students: {studentName}</p>
            {!isGroup && <p>Level: {cls.level}</p>}
            {/*  <p>Student ID: {isGroup ? cls.studentId : cls.studentId}</p> */}
            {isGroup ? (
              <p>Duration: {duration}</p>
            ) : (
              <p>Duration: {duration}</p>
            )}
          </div>
        </div>

        <div className="class-actions">
          <button
            className="start-class-btn"
            onClick={() =>
              isGroup ? handleJoinGroupClass(cls) : handleJoinClass(cls)
            }
            disabled={!isJoinEnabled(sessionAt)}
          >
            JOIN CLASS
          </button>

          <button
            className="leave-class-btn"
            onClick={() => {
              setSelectedLeaveClass({ ...cls, actionType: "leave" });
              setShowLeaveModal(true);
            }}
            disabled={!isLeaveEnabled(sessionAt)}
          >
            LEAVE
          </button>

          <button
            className="last-minute-cancel-btn"
            onClick={() => {
              setSelectedLeaveClass({ ...cls, actionType: "cancel" });
              setShowLeaveModal(true);
            }}
            disabled={!isLastMinuteCancelEnabled(sessionAt)}
          >
            LAST MINUTE CANCEL
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "message":
        return <Message onMessagesRead={refreshUnreadCount} />;
      case "class-report":
        return <ClassReport />;
      case "punctuality-report":
        return <PunctualityReport />;
      case "assignments":
        return <MyAssignments />;
      case "dashboard":
      default:
        return (
          <>
            <div className="content-header1">
              <h1>DASHBOARD</h1>
            </div>

            {/* Announcements */}
            {showAnnouncement &&
              announcements.length > 0 &&
              announcements.map((a) => (
                <div key={a.id} className="announcement announcement-upcoming">
                  <div className="announcement-icon">📢</div>
                  <div className="announcement-content">
                    <strong>{a.title}</strong> <br />
                    <strong>Message:</strong> {a.message}
                  </div>
                  <button
                    className="announcement-close"
                    onClick={handleCloseAnnouncement}
                  >
                    ×
                  </button>
                </div>
              ))}

            {ongoingClass && (
              <section className="class-details-section">
                <div className="section-header">
                  <h2>ON GOING CLASS</h2>
                </div>
                <div className="class-details-card">
                  <div className="class-image">
                    <img src={ongoingClass.image} alt={ongoingClass.title} />
                  </div>
                  <div className="class-info">
                    <h3>{ongoingClass.title}</h3>
                    <p>
                      Student Name:{" "}
                      {ongoingClass.batch === "dual"
                        ? ongoingClass.students.join(" & ") // Dual shows "A & B"
                        : ongoingClass.students[0]}
                    </p>

                    <p>
                      Time:{" "}
                      {new Date(ongoingClass.time).toLocaleTimeString(
                        undefined,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </p>

                    <p>Duration: {ongoingClass.duration}</p>
                    <p>Batch: {ongoingClass.batch}</p>

                    <p>Level: {ongoingClass.level}</p>
                    <p>Plan: {ongoingClass.plan}</p>
                  </div>
                  <div className="class-actions">
                    <button
                      className="rejoin-btn"
                      onClick={() => window.open(ongoingClass.link, "_blank")}
                    >
                      RE-JOIN
                    </button>
                    <button
                      className="close-btn"
                      onClick={() => setOngoingClass(null)}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Upcoming Classes */}
            <section className="classes-section">
              <div className="section-header">
                <h2>UPCOMING CLASSES</h2>
              </div>

              <div className="classes-list">
                {(showAllClasses ? allClasses : allClasses.slice(0, 4)).map(
                  (cls) => (
                    <ClassCard
                      key={
                        cls.type === "group"
                          ? `${cls.groupId}_${cls.sessionAt}`
                          : cls.id
                      }
                      cls={cls}
                    />
                  )
                )}
              </div>

              {allClasses.length > 4 && (
                <div className="view-more">
                  <button
                    className="view-more-btn"
                    onClick={() => setShowAllClasses(!showAllClasses)}
                  >
                    {showAllClasses ? "VIEW LESS" : "VIEW MORE"}
                  </button>
                </div>
              )}
            </section>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="logo">
            <img
              src="images/amj-logo.png"
              alt="AMJ Academy Logo"
              className="logo-image"
            />
            <span className="logo-text">AMJ Academy</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <a href="#" className="nav-link" onClick={() => navigate("/")}>
              HOME
            </a>
            <a
              href="#"
              className={`nav-link ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("dashboard");
                window.scrollTo(0, 0);
              }}
            >
              DASHBOARD
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("profile");
                window.scrollTo(0, 0);
              }}
            >
              MY PROFILE
            </a>
            <a
              href="#"
              className={`nav-link ${
                activeTab === "class-report" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("class-report");
                window.scrollTo(0, 0);
              }}
            >
              CLASS REPORT
            </a>
            <a
              href="#"
              className={`nav-link ${
                activeTab === "punctuality-report" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("punctuality-report");
                window.scrollTo(0, 0);
              }}
            >
              PUNCTUALITY REPORT
            </a>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              <span>{initials}</span>
            </div>
            <span className="user-name">{username}</span>
          </div>
          <button className="help-btn">NEED HELP?</button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            <div className="menu-items">
              {menuItems.map((item) => (
                <div key={item.id} className="nav-item-container">
                  <button
                    className={`nav-item ${
                      activeTab === item.id ||
                      (item.hasDropdown && activeTab.startsWith(item.id + "-"))
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      if (item.hasDropdown) {
                        toggleAssignments();
                      } else {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                        window.scrollTo(0, 0);
                      }
                    }}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.count > 0 && (
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          marginLeft: "auto",
                        }}
                      >
                        ({item.count})
                      </span>
                    )}
                    {item.hasDropdown && (
                      <span
                        className={`dropdown-arrow ${
                          item.isOpen ? "open" : ""
                        }`}
                      >
                        ▼
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div className="logout-section">
              <div className="menu-separator"></div>
              <div className="nav-item-container">
                <button
                  className="nav-item logout-item"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <span className="nav-icon">🚪</span>
                  <span className="nav-label">Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">{renderContent()}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Footer */}
      <Footer />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      "https://amjacademy-working.onrender.com/api/users/logout",
                      {
                        method: "POST",
                        credentials: "include",
                      }
                    );
                    const data = await res.json();
                    console.log("Logout response:", data);
                    localStorage.removeItem("username");
                    window.location.href = "/";
                  } catch (err) {
                    console.error("Logout failed:", err);
                  }
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <LeaveModal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={handleLeaveSubmit}
          classData={selectedLeaveClass}
        />
      )}
    </div>
  );
};

export default Dashboard;
