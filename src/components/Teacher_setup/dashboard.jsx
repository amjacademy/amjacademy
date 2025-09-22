"use client"

import { useState } from "react"
import "./Dashboard.css"
import Profile from "./Profile.jsx"
import Message from "./Message.jsx"
import Footer from "../Footer/footer.jsx"
import ClassReport from "./class-report.jsx"
import MyAssignments from "./my-assignments.jsx"

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userType] = useState("student") // This would come from auth context
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assignmentsOpen, setAssignmentsOpen] = useState(false)

  const upcomingClasses = [
    {
      id: 1,
      title: "Piano Basics",
      instructor: "Ms. Sarah",
      time: "Today at 2:00 PM",
      duration: "45 min",
      level: "Beginner",
      image: "/placeholder.svg?height=120&width=200",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Guitar Fundamentals",
      instructor: "Mr. John",
      time: "Tomorrow at 10:00 AM",
      duration: "60 min",
      level: "Intermediate",
      image: "/placeholder.svg?height=120&width=200",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Music Theory",
      instructor: "Dr. Emily",
      time: "Thu at 4:00 PM",
      duration: "30 min",
      level: "Advanced",
      image: "/placeholder.svg?height=120&width=200",
      status: "upcoming",
    },
  ]

  const completedClasses = [
    {
      id: 4,
      title: "Rhythm Basics",
      instructor: "Ms. Lisa",
      time: "Yesterday at 3:00 PM",
      duration: "45 min",
      level: "Beginner",
      image: "/placeholder.svg?height=120&width=200",
      status: "completed",
      rating: 5,
    },
    {
      id: 5,
      title: "Vocal Warm-ups",
      instructor: "Mr. David",
      time: "Mon at 11:00 AM",
      duration: "30 min",
      level: "Beginner",
      image: "/placeholder.svg?height=120&width=200",
      status: "completed",
      rating: 4,
    },
  ]

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "message", label: "Message", icon: "💬" },
    { id: "class-report", label: "Class Report", icon: "📊" },
    {
      id: "assignments",
      label: "My Assignments",
      icon: "📝",
      hasDropdown: true,
      isOpen: assignmentsOpen,
    },
    { id: "student-attendance", label: "Student Attendance", icon: "📅" },
    { id: "session-count", label: "Student Session Count Report", icon: "📈" },
    { id: "holidays", label: "Upcoming Holidays", icon: "🏖️" },
    { id: "punctuality", label: "Punctuality Reports", icon: "⏰" },
    { id: "cancellation", label: "Class Cancellation Reports", icon: "❌" },
    { id: "demo-insight", label: "Due Post Demo Insight", icon: "💡" },
    { id: "assessments", label: "Assessments", icon: "📋" },
    { id: "extra-booking", label: "Extra Hour Booking Request", icon: "➕" },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleAssignments = () => {
    setAssignmentsOpen(!assignmentsOpen)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />
      case "message":
        return <Message />
      case "class-report":
        return <ClassReport />
      case "assignments":
        return <MyAssignments />
      case "dashboard":
      default:
        return (
          <>
            <div className="content-header">
              <h1>DASHBOARD</h1>
            </div>

            {/* Announcement */}
            <div className="announcement">
              <div className="announcement-icon">📢</div>
              <div className="announcement-content">
                <p>
                  <strong>Announcement:</strong> On account of Ganesh Chaturthi, AMJ Academy will not be conducting
                  classes on between 3 AM IST on Wednesday, 27 Aug 2025 and 2 AM IST on Thursday, 28 Aug 2025. Classes
                  will resume normally from 3 AM IST on Thursday, 28 Aug 2025.
                </p>
              </div>
              <button className="announcement-close">×</button>
            </div>

            {/* Upcoming Classes */}
            <section className="classes-section">
              <div className="section-header">
                <h2>UPCOMING CLASSES</h2>
              </div>
              <div className="classes-list">
                {upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="class-card-horizontal">
                    <div className="class-image">
                      <img
                        src={classItem.image || "/placeholder.svg?height=120&width=200&query=keyboard lesson"}
                        alt={classItem.title}
                      />
                    </div>
                    <div className="class-info">
                      <div className="class-time">{classItem.time}</div>
                      <div className="class-badges">
                        <span className="badge individual">Individual Batch</span>
                        <span className="badge keyboard">Keyboard</span>
                        <span className="badge not-started">Not Started</span>
                      </div>
                      <div className="class-details">
                        <p>Curriculum Stamp: N/A</p>
                        <p>Topic: Basic scales and chords</p>
                      </div>
                    </div>
                    <div className="class-actions">
                      <button className="start-class-btn">START CLASS</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Completed Classes */}
            <section className="classes-section">
              <div className="section-header">
                <h2>COMPLETED CLASSES</h2>
              </div>
              <div className="classes-list">
                {completedClasses.map((classItem) => (
                  <div key={classItem.id} className="class-card-horizontal completed">
                    <div className="class-image">
                      <img
                        src={classItem.image || "/placeholder.svg?height=120&width=200&query=keyboard lesson"}
                        alt={classItem.title}
                      />
                    </div>
                    <div className="class-info">
                      <div className="class-time">{classItem.time}</div>
                      <div className="class-badges">
                        <span className="badge completed-badge">Completed</span>
                      </div>
                      <div className="class-title">View Teacher Post-Demo Insight</div>
                      <div className="class-subject">Keyboard</div>
                    </div>
                    <div className="class-actions">
                      <button className="view-btn">View</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="view-more">
                <button className="view-more-btn">VIEW MORE</button>
              </div>
            </section>
          </>
        )
    }
  }

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
            <span className="logo-text">AMJ Academy</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <a href="#" className="nav-link" onClick={() => setActiveTab("dashboard")}>
              HOME
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              DASHBOARD
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              MY PROFILE
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "class-report" ? "active" : ""}`}
              onClick={() => setActiveTab("class-report")}
            >
              CLASS REPORT
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "assignments" ? "active" : ""}`}
              onClick={() => setActiveTab("assignments")}
            >
              MY ASSIGNMENTS
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "student-attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("student-attendance")}
            >
              STUDENT
            </a>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              <span>AM</span>
            </div>
            <span className="user-name">ANTIQ MARIA</span>
          </div>
          <button className="help-btn">NEED HELP?</button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <div key={item.id} className="nav-item-container">
                <button
                  className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => {
                    if (item.hasDropdown) {
                      toggleAssignments()
                    } else {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }
                  }}
                >
                  <span className="nav-label">{item.label}</span>
                  {item.hasDropdown && <span className={`dropdown-arrow ${item.isOpen ? "open" : ""}`}>▼</span>}
                </button>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">{renderContent()}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Dashboard
