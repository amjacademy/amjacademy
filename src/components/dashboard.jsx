+"use client"

import { useState, useEffect } from "react"
import "./Dashboard.css"
import Footer from './Footer/footer';
import Profile from './Profile';
import Message from './Message';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userType] = useState("student") // This would come from auth context
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assignmentsOpen, setAssignmentsOpen] = useState(false)
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [completedClasses, setCompletedClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses')
        const data = await response.json()
        
        if (data.success) {
          // Separate upcoming and completed courses
          const upcoming = data.courses.filter(course => course.status === 'upcoming')
          const completed = data.courses.filter(course => course.status === 'completed')
          
          setUpcomingClasses(upcoming)
          setCompletedClasses(completed)
        } else {
          setError('Failed to fetch courses')
        }
      } catch (err) {
        setError('Error fetching courses: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Fallback to static data if API fails
  const staticUpcomingClasses = [
    {
      id: 1,
      name: "Piano Basics",
      title: "Introduction to Piano",
      level: "Beginner",
      duration: "45 min",
      ratings: 4.8,
      instructor: {
        name: "Ms. Sarah Johnson",
        avatar: "images/instructors/sarah.jpg",
        experience: "5+ years"
      },
      time: "Today at 2:00 PM",
      image: "images/amj-logo.png?height=120&width=200",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Guitar Fundamentals",
      title: "Basic Guitar Techniques",
      level: "Intermediate",
      duration: "60 min",
      ratings: 4.6,
      instructor: {
        name: "Mr. John Smith",
        avatar: "images/instructors/john.jpg",
        experience: "8+ years"
      },
      time: "Tomorrow at 10:00 AM",
      image: "images/amj-logo.png?height=120&width=200",
      status: "upcoming",
    },
    {
      id: 3,
      name: "Music Theory",
      title: "Advanced Music Theory",
      level: "Advanced",
      duration: "30 min",
      ratings: 4.9,
      instructor: {
        name: "Dr. Emily Davis",
        avatar: "images/instructors/emily.jpg",
        experience: "10+ years"
      },
      time: "Thu at 4:00 PM",
      image: "images/amj-logo.png?height=120&width=200",
      status: "upcoming",
    },
  ]

  const staticCompletedClasses = [
    {
      id: 4,
      name: "Rhythm Basics",
      title: "Understanding Rhythm",
      level: "Beginner",
      duration: "45 min",
      ratings: 5.0,
      instructor: {
        name: "Ms. Lisa Anderson",
        avatar: "images/instructors/lisa.jpg",
        experience: "6+ years"
      },
      time: "Yesterday at 3:00 PM",
      image: "images/amj-logo.png?height=120&width=200",
      status: "completed",
    },
    {
      id: 5,
      name: "Vocal Warm-ups",
      title: "Vocal Training Basics",
      level: "Beginner",
      duration: "30 min",
      ratings: 4.7,
      instructor: {
        name: "Mr. David Wilson",
        avatar: "images/instructors/david.jpg",
        experience: "7+ years"
      },
      time: "Mon at 11:00 AM",
      image: "images/amj-logo.png?height=120&width=200",
      status: "completed",
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

  return (
    <>
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
              <a href="#" className="nav-link">
                HOME
              </a>
              <a href="#" className="nav-link active">
                DASHBOARD
              </a>
              <a href="#" className="nav-link">
                MY PROFILE
              </a>
              <a href="#" className="nav-link">
                CLASS REPORT
              </a>
              <a href="#" className="nav-link">
                MY ASSIGNMENTS
              </a>
              <a href="#" className="nav-link">
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
          <main className="main-content">
            <div className="content-header">
              <h1>{activeTab.toUpperCase()}</h1>
            </div>

            {activeTab === "dashboard" && (
              <>
                {/* Announcement */}
                <div className="announcement">
                  <div className="announcement-icon">📢</div>
                  <div className="announcement-content">
                    <p>
                      <strong>Announcement:</strong> On account of Ganesh Chaturthi, Amj Academy will not be conducting classes
                      on between 3 AM IST on Wednesday, 27 Aug 2025 and 2 AM IST on Thursday, 28 Aug 2025. Classes will resume
                      normally from 3 AM IST on Thursday, 28 Aug 2025.
                    </p>
                  </div>
                  <button className="announcement-close">×</button>
                </div>

                {/* Upcoming Classes */}
                <section className="classes-section">
                  <div className="section-header">
                    <h2>UPCOMING CLASSES</h2>
                  </div>
                  {loading && <div className="loading">Loading courses...</div>}
                  {error && <div className="error">{error}</div>}
                  <div className="classes-list">
                    {(upcomingClasses.length > 0 ? upcomingClasses : staticUpcomingClasses).map((classItem) => (
                      <div key={classItem.id} className="class-card-horizontal">
                        <div className="class-image">
                          <img
                            src={classItem.image || "/placeholder.svg?height=120&width=200&query=keyboard lesson"}
                            alt={classItem.name || classItem.title}
                          />
                        </div>
                        <div className="class-info">
                          <div className="class-header">
                            <h3 className="class-name">{classItem.name || classItem.title}</h3>
                            <p className="class-title">{classItem.title}</p>
                          </div>
                          
                          <div className="class-meta">
                            <div className="instructor-info">
                              <div className="instructor-avatar">
                                <img 
                                  src={classItem.instructor?.avatar || "/placeholder.svg?height=40&width=40&query=instructor"} 
                                  alt={classItem.instructor?.name || classItem.instructor} 
                                />
                              </div>
                              <div className="instructor-details">
                                <span className="instructor-name">{classItem.instructor?.name || classItem.instructor}</span>
                                {classItem.instructor?.experience && (
                                  <span className="instructor-experience">{classItem.instructor.experience}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="class-badges">
                              <span className={`badge level-badge ${classItem.level?.toLowerCase()}`}>
                                {classItem.level}
                              </span>
                              <span className="badge duration-badge">
                                {classItem.duration}
                              </span>
                            </div>
                          </div>

                          <div className="class-ratings">
                            <div className="stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < Math.floor(classItem.ratings || 0) ? 'filled' : ''}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="rating-value">{classItem.ratings || 0}</span>
                          </div>

                          <div className="class-time">{classItem.time}</div>
                          
                          <div className="class-details">
                            <p><strong>Level:</strong> {classItem.level}</p>
                            <p><strong>Duration:</strong> {classItem.duration}</p>
                            <p><strong>Instructor:</strong> {classItem.instructor?.name || classItem.instructor}</p>
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
                    {(completedClasses.length > 0 ? completedClasses : staticCompletedClasses).map((classItem) => (
                      <div key={classItem.id} className="class-card-horizontal completed">
                        <div className="class-image">
                          <img
                            src={classItem.image || "/placeholder.svg?height=120&width=200&query=keyboard lesson"}
                            alt={classItem.name || classItem.title}
                          />
                        </div>
                        <div className="class-info">
                          <div className="class-header">
                            <h3 className="class-name">{classItem.name || classItem.title}</h3>
                            <p className="class-title">{classItem.title}</p>
                          </div>
                          
                          <div className="class-meta">
                            <div className="instructor-info">
                              <div className="instructor-avatar">
                                <img 
                                  src={classItem.instructor?.avatar || "/placeholder.svg?height=40&width=40&query=instructor"} 
                                  alt={classItem.instructor?.name || classItem.instructor} 
                                />
                              </div>
                              <div className="instructor-details">
                                <span className="instructor-name">{classItem.instructor?.name || classItem.instructor}</span>
                                {classItem.instructor?.experience && (
                                  <span className="instructor-experience">{classItem.instructor.experience}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="class-badges">
                              <span className={`badge level-badge ${classItem.level?.toLowerCase()}`}>
                                {classItem.level}
                              </span>
                              <span className="badge duration-badge">
                                {classItem.duration}
                              </span>
                              <span className="badge completed-badge">
                                COMPLETED
                              </span>
                            </div>
                          </div>

                          <div className="class-ratings">
                            <div className="stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < Math.floor(classItem.ratings || 0) ? 'filled' : ''}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="rating-value">{classItem.ratings || 0}</span>
                          </div>

                          <div className="class-time">{classItem.time}</div>
                          
                          <div className="class-details">
                            <p><strong>Level:</strong> {classItem.level}</p>
                            <p><strong>Duration:</strong> {classItem.duration}</p>
                            <p><strong>Instructor:</strong> {classItem.instructor?.name || classItem.instructor}</p>
                          </div>
                        </div>
                        <div className="class-actions">
                          <button className="view-btn">REVIEW CLASS</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* View More Section */}
                <div className="view-more">
                  <button className="view-more-btn">VIEW ALL CLASSES</button>
                </div>
              </>
            )}

            {activeTab === "profile" && <Profile />}
            {activeTab === "message" && <Message />}

            {/* Placeholder for other tabs */}
            {!["dashboard", "profile", "message"].includes(activeTab) && (
              <div className="placeholder-content">
                <h2>{activeTab.toUpperCase()} CONTENT</h2>
                <p>This section is under development. Content for {activeTab} will be available soon.</p>
              </div>
            )}
          </main>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      </div>
      {/* Footer should be outside dashboard-layout to appear after sidebar/main */}
    </>
  )}

export default Dashboard
