"use client";

import { useEffect, useState } from "react";
import "./Admin_dashboard.css";
import Footer from "../Footer/footer.jsx";
import Dashboard from "./Dashboard.jsx";
import User_enrollment from "./User_enrollment.jsx";
import Announcements from "./Announcements.jsx";
import Class_arrangement from "./Class_arrangement.jsx";
import GroupArrangement from "./group_arrangement.jsx";
import Notification from "./Notification.jsx";
import PopupNotification from "../common/PopupNotification.jsx";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function Admin_Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const MAIN = "https://amjacademy-working.onrender.com";
  const TEST= "http://localhost:5000";

  // Enrollment data
  const [students, setStudents] = useLocalStorage("admin_students", []);
  const [teachers, setTeachers] = useLocalStorage("admin_teachers", []);
  // Announcements
  const [announcements, setAnnouncements] = useLocalStorage("announcements", []);
  // Schedules
  const [schedules, setSchedules] = useLocalStorage("admin_schedules", []);
  // Notifications (admin view)
  const [notifications, setNotifications] = useLocalStorage("admin_notifications", []);
  // Groups (local feature)
  const [groups, setGroups] = useLocalStorage("admin_groups", []);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingRow, setEditingRow] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationSubmenu, setShowNotificationSubmenu] = useState(false);
  const [apiCounts, setApiCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // pick editing row from router state
  useEffect(() => {
    if (location.state?.editingRow) {
      setActiveTab("enrollment");
      setEditingRow(location.state.editingRow);
    }
  }, [location.state]);

  // Close notification submenu when activeTab changes
  useEffect(() => {
    if (activeTab !== "notifications") {
      setShowNotificationSubmenu(false);
    }
  }, [activeTab]);

  const username = localStorage.getItem("admin_username") || "Admin";

  // Session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${MAIN}/api/admin/check-auth`, {
          withCredentials: true,
        });
        if (!res.data.success) {
          setNotification({ type: "error", message: "Session expired. Please login again." });
          navigate("/AdminLogin");
        }
      } catch {
        setNotification({ type: "error", message: "Session expired. Please login again." });
        navigate("/AdminLogin");
      }
    };
    checkSession();
    const id = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(id);
  }, [navigate]);

  // Fetch counts
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${MAIN}/api/counts`, {
          credentials: "include",
        });
        const data = await res.json();
        setApiCounts(data);
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    })();
  }, []);

  // ✅ Fetch EVERYTHING needed for Dashboard tables
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [enrollRes, annRes, schRes, notifRes,groupsRes] = await Promise.all([
          fetch(`${MAIN}/api/enrollments/getall`, { credentials: "include" }),
          fetch(`${MAIN}/api/announcements/receive`, { credentials: "include" }),
          fetch(`${MAIN}/api/arrangements/getdetails`, { credentials: "include" }),
          fetch(`${MAIN}/api/notifications`, { credentials: "include" }),
          fetch(`${MAIN}/api/grouparrangements`, { credentials: "include" }),
        ]);

        const [enrollData, annData, schData, notifData, groupsData] = await Promise.all([
          enrollRes.json(),
          annRes.json(),
          schRes.json(),
          notifRes.json(),
          groupsRes.json(),
        ]);

    const studentsList = (enrollData || []).filter((x) => (x.role || "").toLowerCase() === "student");
    const teachersList = (enrollData || []).filter((x) => (x.role || "").toLowerCase() === "teacher");


        setStudents(studentsList);
        setTeachers(teachersList);
        setAnnouncements(Array.isArray(annData) ? annData : []);
        setSchedules(Array.isArray(schData) ? schData : []);
        setNotifications(Array.isArray(notifData) ? notifData : []);

/*         // --- ADD THIS: keep apiCounts.notifications in sync with actual notifications array
setApiCounts(prev => ({
  ...prev,
  notifications: Array.isArray(notifData) ? notifData.length : (prev.notifications || 0),
})); */
         // <-- set groups from backend; if groupsData is an array of group objects
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        console.error("Error preloading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getInitials = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return "A";
    return trimmed[0].toUpperCase() + trimmed[trimmed.length - 1].toUpperCase();
  };
  const initials = getInitials(username);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "enrollment", label: "User Enrollment", icon: "👥" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "class-arrangement", label: "Class Arrangement", icon: "📅" },
    { id: "group-arrangement", label: "Group Arrangement", icon: "🧑‍🤝‍🧑" },
  ];

  const getNextTab = (current) => {
    const order = [
      "dashboard",
      "enrollment",
      "announcements",
      "notifications",
      "class-arrangement",
      "group-arrangement",
    ];
    const i = order.indexOf(current);
    return order[(i + 1) % order.length];
  };

  const counts = {
    students: students.length,
    teachers: teachers.length,
    announcements: announcements.length,
    schedules: schedules.length,
    notifications: notifications.length,
    groups: groups.length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "enrollment":
        return (
          <User_enrollment
            students={students}
            setStudents={setStudents}
            teachers={teachers}
            setTeachers={setTeachers}
            editingRow={editingRow}
            setEditingRow={setEditingRow} // ✅ pass setter down
            notification={notification}
            setNotification={setNotification}
          />
        );
      case "announcements":
        return (
          <Announcements
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            notification={notification}
            setNotification={setNotification}
          />
        );
      case "notifications":
        return <Notification userType="admin" />;
      case "leave":
        return <Notification userType="admin" filterKind="Leave Request" filterRole="student" />;
      case "last_minute_cancel":
        return <Notification userType="admin" filterKind="Last Minute Cancellation" filterRole="student" />;
      case "class-arrangement":
        return (
          <Class_arrangement
            students={students}
            teachers={teachers}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        );
      case "group-arrangement":
        return <GroupArrangement />;
      case "dashboard":
      default:
        return (
          <Dashboard
            counts={counts}
            schedules={schedules}
            preload={{ students, teachers, announcements }}
            onView={(row) => {
              setEditingRow(row);
              setActiveTab("enrollment");
            }}
            onViewSchedule={() => setActiveTab("class-arrangement")}
            onViewGroups={() => setActiveTab("group-arrangement")}
          />
        );
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${MAIN}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("username");
        sessionStorage.clear();
        await new Promise((r) => setTimeout(r, 300));
        navigate("/");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => {
              setActiveTab("dashboard");
              setShowNotificationSubmenu(false);
              window.scrollTo(0, 0);
            }}
          >
            <span className="arrow">←</span>
          </button>
          <button
            className="forward-btn"
            onClick={() => {
              setActiveTab(getNextTab(activeTab));
              setShowNotificationSubmenu(false);
              window.scrollTo(0, 0);
            }}
          >
            <span className="arrow">→</span>
          </button>
          <button className="menu-toggle" onClick={() => setSidebarOpen((s) => !s)}>
            <span></span><span></span><span></span>
          </button>
          <div className="logo">
            <img src="images/amj-logo.png" alt="AMJ Academy Logo" className="logo-image" />
            <span className="logo-text">AMJ Academy</span>
          </div>
        </div>

        <div className="header-center">
          <nav className="header-nav">
            <a href="#" className="nav-link" onClick={handleLogout}>HOME</a>
            <a
              href="#"
              className="nav-link active"
              onClick={() => {
                setActiveTab("dashboard");
                setShowNotificationSubmenu(false);
                window.scrollTo(0, 0);
              }}
            >
              DASHBOARD
            </a>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar"><span>{initials}</span></div>
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
                  {item.id === "notifications" ? (
                    <div style={{ position: "relative" }}>
                      <button
                        className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                        onClick={() => setShowNotificationSubmenu((v) => !v)}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {apiCounts.notifications > 0 && (
                          <span className="nav-badge">({apiCounts.notifications})</span>
                        )}
                      </button>
                      {showNotificationSubmenu && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            zIndex: 1000,
                            minWidth: "200px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <button
                            onClick={() => {
                              setActiveTab("leave");
                              setShowNotificationSubmenu(false);
                              setSidebarOpen(false);
                              window.scrollTo(0, 0);
                            }}
                            style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}
                          >
                            Leave
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("last_minute_cancel");
                              setShowNotificationSubmenu(false);
                              setSidebarOpen(false);
                              window.scrollTo(0, 0);
                            }}
                            style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}
                          >
                            Last Minute Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                        setShowNotificationSubmenu(false);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.id === "notifications" && apiCounts.notifications > 0 && (
                        <span className="nav-badge">({apiCounts.notifications})</span>
                      )}
                    </button>
                  )}
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
        <main className="main-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Footer />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleLogout}>OK</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <PopupNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
