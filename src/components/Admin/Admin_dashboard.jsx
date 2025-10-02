"use client"

import { useEffect, useState } from "react"
import "./Admin_dashboard.css"
import Footer from "../Footer/footer.jsx"
import Dashboard from "./Dashboard.jsx"
import User_enrollment from "./User_enrollment.jsx"
import Announcements from "./Announcements.jsx"
import Class_arrangement from "./Class_arrangement.jsx"
import { HiAnnotation } from "react-icons/hi"
import axios from "axios";
import { useNavigate } from "react-router-dom";

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })
  
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState]
}

export default function Admin_Dashboard() {
  const navigate = useNavigate();
  // Enrollment data
  const [students, setStudents] = useLocalStorage("admin_students", [])
  const [teachers, setTeachers] = useLocalStorage("admin_teachers", [])
  // Announcements
  const [announcements, setAnnouncements] = useLocalStorage("announcements", [])
  // Schedules
  const [schedules, setSchedules] = useLocalStorage("admin_schedules", [])

  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Get username from localStorage
  const username = localStorage.getItem('admin_username') || 'Admin'

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/check-auth", {
          withCredentials: true // important to send cookies
        });

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
  // Get first and last letter of username
  const getInitials = (name) => {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return 'A'
    const firstLetter = trimmedName[0].toUpperCase()
    const lastLetter = trimmedName[trimmedName.length - 1].toUpperCase()
    return firstLetter + lastLetter
  }

  const initials = getInitials(username)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "enrollment", label: "User Enrollment", icon: "👥" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "class-arrangement", label: "Class Arrangement", icon: "📅" },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Derived counts
  const counts = {
    students: students.length,
    teachers: teachers.length,
    announcements: announcements.length,
    schedules: schedules.length,
  }

  const renderContent = () => {
    switch (activeTab) {
      case "enrollment":
        return (
          <User_enrollment
            students={students}
            setStudents={setStudents}
            teachers={teachers}
            setTeachers={setTeachers}
          />
        )
      case "announcements":
        return (
          <Announcements announcements={announcements} setAnnouncements={setAnnouncements} />
        )
      case "class-arrangement":
        return (
          <Class_arrangement
            students={students}
            teachers={teachers}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        )
      case "dashboard":
      default:
        return <Dashboard counts={counts} />
    }
  }
const handleLogout = async () => {
  try {
    // call backend logout to clear cookie
    await fetch("http://localhost:5000/api/admin/logout", {
      method: "POST",
      credentials: "include", // important for cookies
    });

    // clear all localStorage
    localStorage.clear();

    // redirect to login page
    window.location.href = "/AdminLogin";
  } catch (err) {
    console.error("Logout error:", err);
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
            <img src="images/amj-logo.png" alt="AMJ Academy Logo" className="logo-image" />
            <span className="logo-text">AMJ Academy</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <a href="#" className="nav-link active" onClick={() => setActiveTab("dashboard")}>
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
                  <button
                    className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
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
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleLogout()}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
