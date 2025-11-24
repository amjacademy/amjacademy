"use client"
import axios from "axios";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"
import Profile from "./Profile.jsx"
import Message from "./Message.jsx"
// import Notification from "../Admin/Notification.jsx"
import Footer from "../Footer/footer.jsx"
import ClassReport from "./class-report.jsx"
// import MyAssignments from "./my-assignments.jsx"
import PunctualityReport from "./punctuality-report.jsx"
import LeaveModal from "../common/LeaveModal.jsx"
import MyAssignments from "./my-assignments.jsx"

const Dashboard = () => {
  const navigate = useNavigate();

  // Explicitly fixed to teacher usage
  const userType = "Teacher";
  const userId = localStorage.getItem('user_id');
  const API_BASE = "https://amjacademy-working.onrender.com/api/teacher";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // ==========================
  // Helper functions

  const makeSessionAtFromDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return null;
    if (timeStr && (timeStr.includes("T") || timeStr.includes("Z"))) {
      return timeStr;
    }
    const t = (timeStr || "00:00").split(".")[0];
    try {
      const iso = `${dateStr}T${t}`;
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        const d2 = new Date(`${dateStr} ${t}`);
        return isNaN(d2.getTime()) ? null : d2.toISOString();
      }
      return d.toISOString();
    } catch (err) {
      return null;
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTimeExact = dateStr => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // ==========================

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE}/fetch-announcements`, {
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
  }, [API_BASE]);

  useEffect(() => {
    const announcementClosed = localStorage.getItem("announcementClosed");
    if (announcementClosed === "true") {
      setShowAnnouncement(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Username details
  const username = localStorage.getItem('username') || 'Teacher';
  const getInitials = name => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return 'T';
    const firstLetter = trimmedName[0].toUpperCase();
    const lastLetter = trimmedName[trimmedName.length - 1].toUpperCase();
    return firstLetter + lastLetter;
  };
  const initials = getInitials(username);

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem("announcementClosed", "true");
  };

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/upcoming-classes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "teacher_id": userId,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.success) {
          const classes = data.upcomingClasses.map(cls => {
            const sessionAt = makeSessionAtFromDateTime(cls.date, cls.time) || cls.time || cls.session_at;
            return {
              id: cls.class_id,
              type: "individual",
              sessionAt,
              batch: cls.batch_type,
              students: cls.student_names || [],
              level: cls.level,
              plan: cls.plan,
              duration: cls.duration || "45 mins",
              teacherId: cls.teacher_id,
              image: "/images/amj-logo.png",
              title: cls.title || `Class with ${cls.student_names ? cls.student_names.join(", ") : "students"}`,
              status: cls.status || "not started",
              link: cls.link,
              class_id: cls.class_id,
              rescheduled: cls.rescheduled,
            };
          });
          setUpcomingClasses(classes);
        } else {
          console.error("Failed to fetch upcoming classes:", data.message || data || "No error message");
        }
      } catch (err) {
        console.error("Error fetching upcoming classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingClasses();
  }, [API_BASE, userId]);

  useEffect(() => {
    const fetchGroupClasses = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/group-classes`,
          {
            headers: { "teacher_id": userId },
            credentials: "include"
          }
        );

        const data = await response.json();

        if (data.success) {
          const formatted = data.classes.map(cls => {
            const sessionAt = cls.session_at || makeSessionAtFromDateTime(cls.date, cls.time);
            return {
              type: "group",
              groupId: cls.group_id,
              groupName: cls.group_arrangements.group_name,
              teacherId: cls.group_arrangements.teacher_id,
              classLink: cls.group_arrangements.class_link,
              sessionAt,
              sessionNumber: cls.session_number,
              totalSessions: cls.group_arrangements.schedule_for,
              sessionForWeek: cls.group_arrangements.session_for_week,
            };
          });
          setGroupClasses(formatted);
        }
      } catch (err) {
        console.error("Error fetching group classes:", err);
      }
    };

    fetchGroupClasses();
  }, [API_BASE, userId]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "message", label: "Message", icon: "💬" },
    { id: "class-report", label: "Class Report", icon: "📊" },
    { id: "my-assignments", label: "My Assignments", icon: "📝" },
    { id: "punctuality-report", label: "Punctuality Report", icon: "⏰" },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Leave Modal Submit Handler 
  const handleLeaveSubmit = async leaveData => {
    if (!selectedLeaveClass) return;
    try {
      const payload = {
        user_id: userId,
        class_id: selectedLeaveClass.class_id,
        action_type: leaveData.actionType,
        reason: leaveData.reason || "",
      };

      const response = await fetch(`${API_BASE}/actions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        alert("Request submitted successfully!");
        setShowLeaveModal(false);
        setTimeout(() => { window.location.reload(); }, 2000);
      } else {
        alert("Failed to submit request: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error submitting request. Try again later.");
    }
  };

  // Join enabled condition
  const isJoinEnabled = sessionAt => {
    if (!sessionAt) return false;
    const now = new Date();
    const classDateTime = new Date(sessionAt);
    const fiveMinsBefore = new Date(classDateTime.getTime() - 5 * 60000);
    const fifteenMinsAfter = new Date(classDateTime.getTime() + 15 * 60000);
    return now >= fiveMinsBefore && now <= fifteenMinsAfter;
  };

  // Handle join class
  const handleJoinClass = async cls => {
    try {
      window.open(cls.link, "_blank");
      setOngoingClass(cls);

      const response = await fetch(`${API_BASE}/class-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: cls.class_id, status: "ongoing", user_id: userId }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUpcomingClasses(prev => prev.filter(c => c.class_id !== cls.class_id));
        setSelectedClassId(cls.class_id);
      } else {
        console.error("Failed to update status:", data.message);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle join group class
  const handleJoinGroupClass = async cls => {
    try {
      window.open(cls.classLink, "_blank");

      const ongoing = {
        type: "group",
        title: cls.groupName,
        time: cls.sessionAt,
        studentId: cls.studentId,
        duration: "45 mins",
        batch: "Group",
        age: "N/A",
        level: "N/A",
        plan: `${cls.sessionNumber} / ${cls.totalSessions}`,
        teachers: [cls.teacherId],
        image: "/images/amj-logo.png",
        link: cls.classLink,
      };

      setOngoingClass(ongoing);
      setGroupClasses(prev => prev.filter(g => g.sessionAt !== cls.sessionAt));
    } catch (err) {
      console.error("Error joining group class:", err);
    }
  };

  // Leave and LMC enable
  const isLeaveEnabled = sessionAt => {
    if (!sessionAt) return false;
    const now = new Date();
    const classStart = new Date(sessionAt);
    const oneHourBefore = new Date(classStart.getTime() - 65 * 60000);
    return now < oneHourBefore;
  };

  const isLastMinuteCancelEnabled = sessionAt => {
    if (!sessionAt) return false;
    const now = new Date();
    const classStart = new Date(sessionAt);
    const lmcStart = new Date(classStart.getTime() - 65 * 60000);
    const joinTime = new Date(classStart.getTime() - 5 * 60000);
    return now >= lmcStart && now < joinTime;
  };

  // Combine classes into allClasses sorted by next session
  const combineClasses = () => {
    const now = new Date();
    const merged = [
      ...upcomingClasses.map(c => ({ ...c, type: "individual" })),
      ...groupClasses.map(g => ({ ...g, type: "group" })),
    ];
    const future = merged.filter(cls => new Date(cls.sessionAt) > now);
    future.sort((a, b) => new Date(a.sessionAt) - new Date(b.sessionAt));
    return future;
  };

  const allClasses = combineClasses();

  // Unified class card for individual & group
  const ClassCard = ({ cls }) => {
    const sessionAt = cls.sessionAt;
    const isGroup = cls.type === "group";

    const title = isGroup ? cls.groupName || "Group Class" : cls.title || "Class";
    const studentNames = isGroup ? [] : (cls.students || []);
    const duration = isGroup ? "45 mins" : cls.duration || "45 mins";
    const planBadge = isGroup ? `${cls.sessionNumber}/${cls.totalSessions}` : cls.plan || "";

    return (
      <div
        key={isGroup ? `${cls.groupId}_${sessionAt}` : cls.id}
        className={`class-card-horizontal ${cls.rescheduled ? "rescheduled-card" : ""}`}
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
            {planBadge && <span className="badge keyboard">{planBadge}</span>}

            <span className={`badge ${cls.rescheduled ? "rescheduled" : "not-started"}`}>
              {cls.rescheduled ? "Rescheduled" : cls.status || "Not started"}
            </span>
          </div>

          <div className="class-details">
              {!isGroup && (
                <>
                  <p>Students:</p>
                  {studentNames.map((s, i) => {
                    // If student is an object with details, display name, age, studentId
                    if (typeof s === "object" && s !== null) {
                      return (
                        <p key={i} className="student-name">
                          {s.name || "Unknown"} &nbsp;|&nbsp; Age: {s.age || "N/A"} &nbsp;|&nbsp; ID: {s.studentId || "N/A"}
                        </p>
                      );
                    }
                    // Otherwise assume string
                    return <p key={i} className="student-name">{s}</p>;
                  })}
                </>
              )}
              <p>Age: {age}</p>
              <p>Level: {!isGroup ? cls.level : "N/A"}</p>
              <p>Student ID: {cls.studentId}</p>
              <p>Plan: {cls.plan}</p>
              <p>Duration: {duration}</p>
          </div>
        </div>

        <div className="class-actions">
          <button
            className="start-class-btn"
            onClick={() => (isGroup ? handleJoinGroupClass(cls) : handleJoinClass(cls))}
            disabled={!isJoinEnabled(sessionAt)}
          >JOIN CLASS</button>

          <button
            className="leave-class-btn"
            onClick={() => {
              setSelectedLeaveClass({ ...cls, actionType: "leave" });
              setShowLeaveModal(true);
            }}
            disabled={!isLeaveEnabled(sessionAt)}
          >LEAVE</button>

          <button
            className="last-minute-cancel-btn"
            onClick={() => {
              setSelectedLeaveClass({ ...cls, actionType: "cancel" });
              setShowLeaveModal(true);
            }}
            disabled={!isLastMinuteCancelEnabled(sessionAt)}
          >LAST MINUTE CANCEL</button>
        </div>
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "message":
        return <Message />;
      case "class-report":
        return <ClassReport />;
      case "punctuality-report":
        return <PunctualityReport />;
      case "my-assignments":
        return <MyAssignments />;
      case "dashboard":
      default:
        return (
          <>
            <div className="content-header1">
              <h1>Teacher Dashboard</h1>
            </div>

            {/* Announcements */}
            {showAnnouncement && announcements.length > 0 &&
              announcements.map(a => (
                <div key={a.id} className="announcement announcement-upcoming">
                  <div className="announcement-icon">📢</div>
                  <div className="announcement-content">
                    <strong>{a.title}</strong><br />
                    <strong>Message:</strong> {a.message}
                  </div>
                  <button className="announcement-close" onClick={handleCloseAnnouncement}>×</button>
                </div>
              ))}

            {/* Ongoing Class */}
            {ongoingClass && (
              <section className="class-details-section">
                <div className="section-header">
                  <h2>ONGOING CLASS</h2>
                </div>
                <div className="class-details-card">
                  <div className="class-image">
                    <img src={ongoingClass.image} alt={ongoingClass.title} />
                  </div>
                  <div className="class-info">
                    <h3>{ongoingClass.title}</h3>
                    <p>Students: {ongoingClass.students ? ongoingClass.students.join(", ") : "N/A"}</p>
                    <p>
                      Time:{" "}
                      {new Date(ongoingClass.time).toLocaleTimeString(undefined, {
                        hour: "2-digit", minute: "2-digit", hour12: true,
                      })}
                    </p>
                    <p>Duration: {ongoingClass.duration}</p>
                    <p>Batch: {ongoingClass.batch}</p>
                    <p>Level: {ongoingClass.level}</p>
                  </div>
                  <div className="class-actions">
                    <button className="rejoin-btn" onClick={() => window.open(ongoingClass.link, "_blank")}>
                      RE-JOIN
                    </button>
                    <button className="close-btn" onClick={() => setOngoingClass(null)}>
                      CLOSE
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Upcoming Classes */}
            <section className="classes-section">
              <div className="section-header"><h2>UPCOMING CLASSES</h2></div>

              <div className="classes-list">
                {(showAllClasses ? allClasses : allClasses.slice(0, 4)).map(cls => (
                  <ClassCard key={cls.type === "group" ? `${cls.groupId}_${cls.sessionAt}` : cls.id} cls={cls} />
                ))}
              </div>
              {allClasses.length > 4 && (
                <div className="view-more">
                  <button className="view-more-btn" onClick={() => setShowAllClasses(!showAllClasses)}>
                    {showAllClasses ? "VIEW LESS" : "VIEW MORE"}
                  </button>
                </div>
              )}
            </section>
            {/* Demo Class Section */}
            <section className="classes-section demo-class-section">
              {/* <div className="section-header"><h2>DEMO CLASS</h2></div> */}

              <div className="demo-class-card class-card-horizontal">
                <div className="class-image">
                  <img src="/images/amj-logo.png" alt="Demo Class" />
                </div>
                <div className="class-info">
                  <div className="class-time">Date: 01/01/2025&nbsp;&nbsp;Time: 10:00 AM</div>
                  <div className="class-badges">
                    <span className="badge demo">DEMO</span>
                    <span className="badge keyboard"> Plan</span>
                    <span className="badge not-started">Not started</span>
                  </div>
                  <div className="class-details">
                    <p>Students: Demo Student 1, Demo Student 2</p>
                    <p>Student ID: N/A</p>
                    <p>Age: N/A</p>
                    <p>Plan: Demo Plan</p>
                    <p>Level: Beginner</p>
                    <p>Duration: 45 mins</p>
                  </div>
                </div>
                <div className="class-actions">
                  <button className="start-class-btn" disabled>JOIN CLASS</button>
                  <button className="leave-class-btn" disabled>LEAVE</button>
                  <button className="last-minute-cancel-btn" disabled>LAST MINUTE CANCEL</button>
                </div>
              </div>
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
            <span></span><span></span><span></span>
          </button>
          <div className="logo">
            <img src="images/amj-logo.png" alt="AMJ Academy Logo" className="logo-image" />
            <span className="logo-text">AMJ Academy</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <a href="#" className="nav-link" onClick={() => navigate('/')}>HOME</a>
            <a href="#" className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); window.scrollTo(0, 0); }}>
              DASHBOARD
            </a>
            <a href="#" className={`nav-link ${activeTab === "profile" ? "active" : ""}`} onClick={() => { setActiveTab("profile"); window.scrollTo(0, 0); }}>
              MY PROFILE
            </a>
            <a href="#" className={`nav-link ${activeTab === "class-report" ? "active" : ""}`} onClick={() => { setActiveTab("class-report"); window.scrollTo(0, 0); }}>
              CLASS REPORT
            </a>
            <a href="#" className={`nav-link ${activeTab === "punctuality-report" ? "active" : ""}`} onClick={() => { setActiveTab("punctuality-report"); window.scrollTo(0, 0); }}>
              PUNCTUALITY REPORT
            </a>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info"><div className="user-avatar"><span>{initials}</span></div><span className="user-name">{username}</span></div>
          <button className="help-btn">NEED HELP?</button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            <div className="menu-items">
              {menuItems.map(item => (
                <div key={item.id} className="nav-item-container">
                  <button className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); window.scrollTo(0, 0); }}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="logout-section">
              <div className="menu-separator"></div>
              <div className="nav-item-container">
                <button className="nav-item logout-item" onClick={() => setShowLogoutModal(true)}>
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
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Footer */}
      <Footer />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={async () => {
                try {
                  const res = await fetch("https://amjacademy-working.onrender.com/api/users/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                  const data = await res.json();
                  console.log("Logout response:", data);
                  localStorage.removeItem("username");
                  window.location.href = "/";
                } catch (err) {
                  console.error("Logout failed:", err);
                }
              }}>OK</button>
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
