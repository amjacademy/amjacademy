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
import { HiAnnotation } from "react-icons/hi";
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
  // Enrollment data
  const [students, setStudents] = useLocalStorage("admin_students", []);
  const [teachers, setTeachers] = useLocalStorage("admin_teachers", []);
  // Announcements
  const [announcements, setAnnouncements] = useLocalStorage(
    "announcements",
    []
  );
  // Schedules
  const [schedules, setSchedules] = useLocalStorage("admin_schedules", []);
  const [notifications, setNotifications] = useLocalStorage(
    "admin_notifications",
    []
  );
  // Groups
  const [groups, setGroups] = useLocalStorage("admin_groups", []);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingRow, setEditingRow] = useState(null);

  // Check for editingRow in location state
  useEffect(() => {
    if (location.state?.editingRow) {
      setActiveTab("enrollment");
      setEditingRow(location.state.editingRow);
    }
  }, [location.state]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationSubmenu, setShowNotificationSubmenu] = useState(false);
  const [apiCounts, setApiCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Get username from localStorage
  const username = localStorage.getItem("admin_username") || "Admin";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(
          "https://amjacademy-working.onrender.com/api/admin/check-auth",
          {
            withCredentials: true, // important to send cookies
          }
        );

        if (!res.data.success) {
          alert("Session expired. Please login again.");
          navigate("/AdminLogin");
        }
      } catch (err) {
        alert("Session expired. Please login again.");
        navigate("/AdminLogin");
      }
    };

    checkSession();

    // Optional: periodic check every 1 min
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(
          "https://amjacademy-working.onrender.com/api/counts",
          {
            credentials: "include", // ✅ add this line // important to send cookies
          }
        );
        const data = await res.json();
        setApiCounts(data);
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          "https://amjacademy-working.onrender.com/api/arrangements/getdetails",
          {
            withCredentials: true, // important to send cookies
          }
        );
        setSchedules(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Get first and last letter of username
  const getInitials = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return "A";
    const firstLetter = trimmedName[0].toUpperCase();
    const lastLetter = trimmedName[trimmedName.length - 1].toUpperCase();
    return firstLetter + lastLetter;
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getNextTab = (currentTab) => {
    const tabOrder = [
      "dashboard",
      "enrollment",
      "announcements",
      "notifications",
      "class-arrangement",
      "group-arrangement",
    ];
    const currentIndex = tabOrder.indexOf(currentTab);
    const nextIndex = (currentIndex + 1) % tabOrder.length;
    return tabOrder[nextIndex];
  };

  // Derived counts
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
          />
        );
      case "announcements":
        return (
          <Announcements
            announcements={announcements}
            setAnnouncements={setAnnouncements}
          />
        );
      case "notifications":
        return <Notification userType="admin" />;
      case "leave":
        return (
          <Notification
            userType="admin"
            filterKind="Leave Request"
            filterRole="student"
          />
        );
      case "last_minute_cancel":
        return (
          <Notification
            userType="admin"
            filterKind="Last Minute Cancellation"
            filterRole="student"
          />
        );
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
            onView={(row) => {
              setActiveTab("enrollment");
              setEditingRow(row);
            }}
            onViewSchedule={() => setActiveTab("class-arrangement")}
            onViewGroups={() => setActiveTab("group-arrangement")}
          />
        );
    }
  };
  const handleLogout = async () => {
    try {
         // Call backend logout
                        const res = await fetch(
                      "https://amjacademy-working.onrender.com/api/admin/logout",
                      {
                        method: "POST",
                        credentials: "include", // send cookies
                      }
                    );

                    const data = await res.json();
                    console.log("Logout response:", data);

                    if (data.success) {
                      // Clear all possible client data
                      localStorage.removeItem("username");
                      sessionStorage.clear();

                      // Wait a tiny bit to ensure cookie is fully removed
                      await new Promise((r) => setTimeout(r, 300));

                      // Force full page reload (not cached)
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
              window.scrollTo(0, 0);
            }}
          >
            <span className="arrow">←</span> <span className="btn-text"></span>
          </button>
          <button
            className="forward-btn"
            onClick={() => {
              setActiveTab(getNextTab(activeTab));
              window.scrollTo(0, 0);
            }}
          >
            <span className="btn-text"></span> <span className="arrow">→</span>
          </button>
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
            <a
              href="#"
              className="nav-link"
              onClick={handleLogout}
            >
              HOME
            </a>
            <a
              href="#"
              className="nav-link active"
              onClick={() => {
                setActiveTab("dashboard");
                window.scrollTo(0, 0);
              }}
            >
              DASHBOARD
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
                  {item.id === "notifications" ? (
                    <div style={{ position: "relative" }}>
                      <button
                        className={`nav-item ${
                          activeTab === item.id ? "active" : ""
                        }`}
                        onClick={() =>
                          setShowNotificationSubmenu(!showNotificationSubmenu)
                        }
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {item.id === "notifications" &&
                          apiCounts.notifications > 0 && (
                            <span className="nav-badge">
                              ({apiCounts.notifications})
                            </span>
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
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "none",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
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
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "none",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            Last Minute Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`nav-item ${
                        activeTab === item.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                        setShowNotificationSubmenu(false);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.id === "notifications" &&
                        apiCounts.notifications > 0 && (
                          <span className="nav-badge">
                            ({apiCounts.notifications})
                          </span>
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
                onClick={handleLogout}
              >
                OK
              </button>

              {/* <button className="btn-confirm" onClick={handleLogout()}>
                OK
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
