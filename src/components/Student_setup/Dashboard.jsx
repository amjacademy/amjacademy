"use client"

import { useState, useEffect } from "react"
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
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const announcementClosed = localStorage.getItem('announcementClosed')
    console.log("announcementClosed flag:", announcementClosed)
    if (announcementClosed === 'true') {
      setShowAnnouncement(false)
    }
    // Load announcements from localStorage and filter for Students or All
    const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]')
    console.log("Stored announcements:", storedAnnouncements)
    const filtered = storedAnnouncements.filter(a => a.receiver === "Students" || a.receiver === "All")
    console.log("Filtered announcements for Students:", filtered)
    setAnnouncements(filtered)
  }, [])


  // Get username from localStorage
  const username = localStorage.getItem('username') || 'User'

  const defaultAnnouncement = {
    id: 1,
    title: "Ganesh Chaturthi Holiday",
    message: "On account of Ganesh Chaturthi, AMJ Academy will not be conducting classes between 3 AM IST on Wednesday, 27 Aug 2025 and 2 AM IST on Thursday, 28 Aug 2025. Classes will resume normally from 3 AM IST on Thursday, 28 Aug 2025.",
    duration: "03:00",
    receiver: "All"
  }
  const [announcements, setAnnouncements] = useState([defaultAnnouncement])

  // Get first and last letter of username
  const getInitials = (name) => {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return 'U'
    const firstLetter = trimmedName[0].toUpperCase()
    const lastLetter = trimmedName[trimmedName.length - 1].toUpperCase()
    return firstLetter + lastLetter
  }

  const initials = getInitials(username)

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false)
    localStorage.setItem('announcementClosed', 'true')
  }

  const [studentId, setStudentId] = useState(() => {
    let id = localStorage.getItem('student_id')
    if (!id) {
      const adminStudents = JSON.parse(localStorage.getItem('admin_students') || '[]')
      if (adminStudents.length > 0) {
        id = adminStudents[0].id
        localStorage.setItem('student_id', id)
        localStorage.setItem('username', adminStudents[0].name || 'Student')
        localStorage.setItem('userType', 'student')
      } else {
        id = 'AMJS00001'
      }
    }
    return id
  })

  const [upcomingClasses, setUpcomingClasses] = useState([])

  useEffect(() => {
    const classes = JSON.parse(localStorage.getItem(`student_upcoming_classes_${studentId}`) || '[]')
    setUpcomingClasses(classes)
  }, [studentId])

  const completedClasses = [
    {
      id: 4,
      title: "Rhythm Basics",
      instructor: "Ms. Lisa",
      time: "Yesterday at 3:00 PM",
      duration: "45 min",
      level: "Beginner",
      image: "images/amj-logo.png?height=120&width=200",
      status: "completed",
      rating: 5,
    },
    {
      id: 5,
      title: "Vocal Warm-ups",
      instructor: "Mr. David",
      time: "Mon at 11:00 AM",
      duration: "45 min",
      level: "Beginner",
      image: "images/amj-logo.png?height=120&width=200",
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
      subItems: [
        { id: "shared", label: "Share with me" },
        { id: "my-uploads", label: "My Upload" },
        { id: "assessments", label: "Assessments" },
      ],
    },
    // Student-specific items
    { id: "my-schedule", label: "My Schedule", icon: "📅" },
    // { id: "session-count", label: "Session Count Report", icon: "📈" },
    // { id: "holidays", label: "Upcoming Holidays", icon: "🏖️" },
    // { id: "demo-insight", label: "Post Demo Insight", icon: "💡" },
    // { id: "extra-booking", label: "Extra Hour Request", icon: "➕" },
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
      case "assignments-shared":
        return <MyAssignments initialSection="shared" />
      case "assignments-my-uploads":
        return <MyAssignments initialSection="uploads" />
      case "assignments-assessments":
        return <MyAssignments initialSection="assessments" />
      case "my-schedule":
        return (
          <div>
            <h2>My Schedule</h2>
            <p>Student schedule content here.</p>
          </div>
        )
      case "dashboard":
      default:
        return (
          <>
            <div className="content-header1">
              <h1>DASHBOARD</h1>
            </div>


            {/* Announcements */}
            {showAnnouncement && announcements.length > 0 && (
              <div className="announcement announcement-upcoming">
                <div className="announcement-icon">📢</div>
                <div className="announcement-content">
                  <strong>Announcement:</strong> {announcements[0].message}
                </div>
                <button className="announcement-close" onClick={handleCloseAnnouncement}>×</button>
              </div>
            )}

            {/* Upcoming Classes */}
            <section className="classes-section">
              <div className="section-header">
                <h2>UPCOMING CLASSES</h2>
              </div>
              <div className="classes-list">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="class-card-horizontal"
                    onClick={() => setSelectedClassId(classItem.id)}
                  >
                    <div className="class-image">
                      <img
                        src={classItem.image || "/placeholder.svg?height=120&width=200&query=keyboard lesson"}
                        alt={classItem.title}
                      />
                    </div>
                    <div className="class-info">
                      <div className="class-time">{classItem.time}</div>
                      <div className="class-badges">
                        <span className="badge individual">{classItem.batch}</span>
                        <span className="badge keyboard">Keyboard</span>
                        <span className="badge not-started">Not Started</span>
                      </div>
                      <div className="class-details">
                        <p>Teacher Name: {classItem.teachers.join(", ")}</p>
                        <p>Level: {classItem.level}</p>
                        <p>Contract ID: {classItem.contractId}</p>
                        <p>Plan: {classItem.plan}</p>
                        <p>Duration: {classItem.duration}</p>
                      </div>
                    </div>
                    <div className="class-actions">
                      <button className="start-class-btn">JOIN CLASS</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Class Details */}
            {selectedClassId && (
              <section className="class-details-section">
                <div className="section-header">
                  <h2>CLASS DETAILS</h2>
                </div>
                {(() => {
                  const selectedClass = upcomingClasses.find((c) => c.id === selectedClassId)
                  return selectedClass ? (
                    <div className="class-details-card">
                      <div className="class-image">
                        <img
                          src={selectedClass.image || "/placeholder.svg?height=120&width=200&query=keyboard lesson"}
                          alt={selectedClass.title}
                        />
                      </div>
                      <div className="class-info">
                        <h3>{selectedClass.title}</h3>
                        <p>Teacher Name: {selectedClass.teachers.join(", ")}</p>
                        <p>Time: {selectedClass.time}</p>
                        <p>Duration: {selectedClass.duration}</p>
                        <p>Batch: {selectedClass.batch}</p>
                        <p>Level: {selectedClass.level}</p>
                        <p>Contract ID: {selectedClass.contractId}</p>
                        <p>Plan: {selectedClass.plan}</p>
                      </div>
                      <div className="class-actions">
                        <button className="start-class-btn">JOIN CLASS</button>
                        <button className="close-btn" onClick={() => setSelectedClassId(null)}>CLOSE</button>
                      </div>
                    </div>
                  ) : null
                })()}
              </section>
            )}

            {/* Completed Classes */}
            {/* <section className="classes-section">
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
                      <div className="class-title">View Post-Class Review</div>
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
            </section> */}
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
            <img src="images/amj-logo.png" alt="AMJ Academy Logo" className="logo-image" />
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
              className={`nav-link ${activeTab === "my-schedule" ? "active" : ""}`}
              onClick={() => setActiveTab("my-schedule")}
            >
              MY SCHEDULE
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
                    className={`nav-item ${activeTab === item.id || (item.hasDropdown && activeTab.startsWith(item.id + '-')) ? "active" : ""}`}
                    onClick={() => {
                      if (item.hasDropdown) {
                        toggleAssignments()
                      } else {
                        setActiveTab(item.id)
                        setSidebarOpen(false)
                      }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.hasDropdown && <span className={`dropdown-arrow ${item.isOpen ? "open" : ""}`}>▼</span>}
                  </button>
                  {item.hasDropdown && item.isOpen && item.subItems && (
                    <div className="sub-menu">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.id}
                          className={`nav-item sub-item ${activeTab === `assignments-${sub.id}` ? "active" : ""}`}
                          onClick={() => {
                            setActiveTab(`assignments-${sub.id}`)
                            setSidebarOpen(false)
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
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
              <button className="btn-confirm" onClick={() => {
                localStorage.removeItem('username');
                window.location.href = '/';
              }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
