"use client"
import axios from "axios";
import { useState, useEffect } from "react"
import "./Dashboard.css"
import Profile from "./Profile.jsx"
import Message from "./Message.jsx"
import Footer from "../Footer/footer.jsx"
import ClassReport from "./class-report.jsx"
import MyAssignments from "./my-assignments.jsx"
import PunctualityReport from "./punctuality-repot.jsx"
import LeaveModal from "../common/LeaveModal.jsx"

const Dashboard = () => {
  const userType="Student";
  const userId=localStorage.getItem('user_id');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard") // This would come from auth context
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assignmentsOpen, setAssignmentsOpen] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveClass, setSelectedLeaveClass] = useState(null);

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const m = parseInt(minutes);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${ampm}`;
};

useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("https://amjacademy-working.onrender.com/api/student/fetchannouncements?");
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
  const announcementClosed = localStorage.getItem("announcementClosed")
  if (announcementClosed === "true") {
    setShowAnnouncement(false)
  }
}, [])

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000); // every 1 second

  return () => clearInterval(timer); // cleanup
}, []);

  // Get username from localStorage
  const username = localStorage.getItem('username') || 'User'

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
  localStorage.setItem("announcementClosed", "true")
} 
  const [studentId]=useState(1);
  
useEffect(() => {
  const fetchUpcomingClasses = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://amjacademy-working.onrender.com/api/student/upcoming-classes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user_id": userId, // pass user_id in headers
        },
        credentials: "include", // instead of withCredentials (fetch uses this)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      /* console.log("Upcoming classes data:", data); */
      if (data.success) {
        // Map backend data to match frontend fields
        const classes = data.upcomingClasses.map((cls) => ({
          id: cls.student1_id + "_" + cls.date + "_" + cls.time, // unique key
          time: cls.time,
          date: cls.date,
          batch: cls.batch_type,
          teachers: [cls.teacher_name],
          level: cls.level,
          plan: cls.plan,
          duration: cls.duration || "45mins", // default
          contractId: cls.contract_id || "ic-405", // default
          image: "/placeholder.svg?height=120&width=200&query=keyboard lesson",
          title: `${cls.profession} Class`,
          status: cls.status || "not started", // default
          link: cls.link,
        }));
        // SORT: most recent upcoming class first
  classes.sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeA - dateTimeB; // ascending order: earliest first
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
}, [userId]);


  /* const completedClasses = [
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
 */
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
    { id: "punctuality-report", label: "Punctuality Report", icon: "⏰" },
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

  const handleLeaveSubmit = async (leaveData) => {
    try {
      const response = await fetch("https://amjacademy-working.onrender.com/api/leave/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user_id": userId,
        },
        body: JSON.stringify(leaveData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        alert("Leave request submitted successfully!");
        // Optionally, refresh the upcoming classes or update the state
        fetchUpcomingClasses();
      } else {
        alert("Failed to submit leave request: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert("Failed to submit leave request. Please try again.");
    }
  };
 // Utility function to check if join button should be enabled
const isJoinEnabled = (classTime) => {
  const now = new Date(); // current user local time
  const classDateTime = new Date(classTime); // UTC timestamp from DB converted to local

  // 5 minutes before to 15 minutes after
  const fiveMinutesBefore = new Date(classDateTime.getTime() - 5 * 60 * 1000);
  const fifteenMinutesAfter = new Date(classDateTime.getTime() + 15 * 60 * 1000);

  return now >= fiveMinutesBefore && now <= fifteenMinutesAfter;
};


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
      case "punctuality-report":
        return <PunctualityReport />
      case "dashboard":
      default:
        return (
          <>
            <div className="content-header1">
              <h1>DASHBOARD</h1>
            </div>


            {/* Announcements */}
{showAnnouncement && announcements.length > 0 &&
  announcements.map((a) => (
    <div key={a.id} className="announcement announcement-upcoming">
      <div className="announcement-icon">📢</div>
      <div className="announcement-content">
        <strong>{a.title}</strong>  <br />
        <strong>Message:</strong> {a.message}
      </div>
      <button className="announcement-close" onClick={handleCloseAnnouncement}>
        ×
      </button>
    </div>
  ))
}

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
                  src={classItem.image}
                  alt={classItem.title}
                />
              </div>
              <div className="class-info">
                <div className="class-time">{classItem.date}&nbsp;&nbsp;Time: {new Date(classItem.time).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                        })}</div>
                <div className="class-badges">
                  <span className="badge individual">{classItem.batch}</span>
                  <span className="badge keyboard">{classItem.plan}</span>
                  <span className="badge not-started">{classItem.status}</span>
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
                <button
  className="start-class-btn"
  onClick={() => window.open(classItem.link, "_blank")}
  disabled={!isJoinEnabled(classItem.time, classItem.date)}
>
  JOIN CLASS
</button>
                <button
                  className="leave-class-btn"
                  onClick={() => {
                    setSelectedLeaveClass(classItem);
                    setShowLeaveModal(true);
                  }}
                >
                  LEAVE
                </button>
                <button
                  className="last-minute-cancel-btn"
                  onClick={() => {
                    setSelectedLeaveClass(classItem);
                    setShowLeaveModal(true);
                  }}
                >
                  LAST MINUTE CANCEL
                </button>
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
            const selectedClass = upcomingClasses.find((c) => c.id === selectedClassId);
            return selectedClass ? (
              <div className="class-details-card">
                <div className="class-image">
                  <img
                    src={selectedClass.image}
                    alt={selectedClass.title}
                  />
                </div>
                <div className="class-info">
                  <h3>{selectedClass.title}</h3>
                  <p>Teacher Name: {selectedClass.teachers.join(", ")}</p>
                  <p>
                      Time: {new Date(selectedClass.time).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                        })}
                  </p>

                  <p>Duration: {selectedClass.duration}</p>
                  <p>Batch: {selectedClass.batch}</p>
                  <p>Level: {selectedClass.level}</p>
                  <p>Contract ID: {selectedClass.contractId}</p>
                  <p>Plan: {selectedClass.plan}</p>
                </div>
                <div className="class-actions">
                  <button className="start-class-btn" onClick={() => window.open(selectedClass.link, "_blank")}>
                    JOIN CLASS
                  </button>
                  <button
                    className="leave-class-btn"
                    onClick={() => {
                      setSelectedLeaveClass(selectedClass);
                      setShowLeaveModal(true);
                    }}
                  >
                    LEAVE
                  </button>
                  <button
                    className="last-minute-cancel-btn"
                    onClick={() => {
                      setSelectedLeaveClass(selectedClass);
                      setShowLeaveModal(true);
                    }}
                  >
                    LAST MINUTE CANCEL
                  </button>
                  <button className="close-btn" onClick={() => setSelectedClassId(null)}>CLOSE</button>
                </div>
              </div>
            ) : null;
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
              className={`nav-link ${activeTab === "punctuality-report" ? "active" : ""}`}
              onClick={() => setActiveTab("punctuality-report")}
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
  )
}

export default Dashboard
