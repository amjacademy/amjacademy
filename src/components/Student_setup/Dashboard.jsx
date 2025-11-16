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
import MyAssignments from "./my-assignments.jsx"
import PunctualityReport from "./punctuality-repot.jsx"
import LeaveModal from "../common/LeaveModal.jsx"

const Dashboard = () => {
  const navigate = useNavigate();
  const userType="Student";
  const userId=localStorage.getItem('user_id');
  const API_BASE = "https://amjacademy-working.onrender.com/api/student";
  /* const API_BASE = "http://localhost:5000/api/student"; */

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard") // This would come from auth context
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assignmentsOpen, setAssignmentsOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveClass, setSelectedLeaveClass] = useState(null);
  const [ongoingClass, setOngoingClass] = useState(null);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [incompleteAssessmentsCount, setIncompleteAssessmentsCount] = useState(1); // Static count for now, 1 incomplete out of 3

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
      const res = await fetch(`${API_BASE}/fetchannouncements?`, {
  credentials: "include", // ✅ add this line
});
      if (!res.ok) throw new Error("Failed to fetch announcements");

      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err.message);
    }
  };

  fetchAnnouncements();
/* const interval = setInterval(fetchAnnouncements, 30000); // refresh every 30s
  return () => clearInterval(interval); */
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

      const response = await fetch(`${API_BASE}/upcoming-classes`, {
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
        console.log("Upcoming classes raw data:", data.upcomingClasses);
        const classes = data.upcomingClasses.map((cls) => ({
          id: cls.student1_id + "_" + cls.date + "_" + cls.time, // unique key
          time: cls.time,
          date: cls.date,
          batch: cls.batch_type,
          teachers: [cls.teacher_name],
          level: cls.level,
          plan: cls.plan,
          duration: cls.duration || "45mins", // default
          teacherId: cls.teacher_id || "AMJT0001", // default
          image: "/images/amj-logo.png?height=120&width=200&query=keyboard lesson",
          title: `${cls.profession} Class`,
          status: cls.status || "not started", // default
          link: cls.link,
          class_id: cls.class_id,
          rescheduled: cls.rescheduled,
        }));
        // SORT: most recent upcoming class first
  const now = new Date();

classes.sort((a, b) => {
  const dateTimeA = new Date(`${a.date}T${a.time}`);
  const dateTimeB = new Date(`${b.date}T${b.time}`);

  // Absolute difference from current time
  const diffA = Math.abs(dateTimeA - now);
  const diffB = Math.abs(dateTimeB - now);

  return diffA - diffB; // closest to now first
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
  /* const interval = setInterval(fetchUpcomingClasses, 15000);

  return () => clearInterval(interval); */
}, [userId]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "message", label: "Message", icon: "💬" },
    // { id: "notification", label: "Notification", icon: "🔔" },
    { id: "class-report", label: "Class Report", icon: "📊" },
    { id: "assignments", label: "My Assignments", icon: "📝", count: incompleteAssessmentsCount },
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

  const toggleNotification = () => {
    setNotificationOpen(!notificationOpen)
  }

const handleLeaveSubmit = async (leaveData) => {
  if (!selectedLeaveClass) return;

  try {
    const payload = {
      user_id: userId, // send from localStorage
      class_id: selectedLeaveClass.class_id,
      action_type: leaveData.actionType, // "leave" or "cancel"
      reason: leaveData.reason || "",
    };
    console.log("Submitting leave/cancel with payload:", payload);

    const response = await fetch(`${API_BASE}/actions/submit`, { // ✅ updated endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
  credentials: "include", // ✅ add this line
    });

    const data = await response.json();

    if (data.success) {
      alert("Request submitted successfully!");
      setShowLeaveModal(false);
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2000ms = 2 seconds
    } else {
      alert("Failed to submit request: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error submitting request:", err);
    alert("Error submitting request. Try again later.");
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

// 🔹 Function to handle Join button click
const handleJoinClass = async (classItem) => {
  try {
    // Open the class link immediately
    window.open(classItem.link, "_blank");

    // Optimistically show as ongoing
    setOngoingClass(classItem);

    // Update backend to set status = "ongoing"
    const response = await fetch(`${API_BASE}/class-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ class_id: classItem.class_id, status: "ongoing",
        user_id: userId }), 
  credentials: "include", // ✅ add this line
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Class started! Status updated to ongoing.");

      // Move from upcoming → ongoing
      setUpcomingClasses((prev) => prev.filter((c) => c.class_id !== classItem.class_id));
      setSelectedClassId(classItem.class_id);
      
      
    } else {
      console.error("❌ Failed to update status:", data.message);
    }
  } catch (err) {
    console.error("⚠️ Error updating status:", err);
  }
};

// LEAVE button: 5 hours before class until 15 minutes before class
const isLeaveEnabled = (classTime) => {
  const now = new Date();
  const classStart = new Date(classTime);
  const oneHourBeforeJoin = new Date(classStart.getTime() - (60 + 5) * 60 * 1000); // 1h5m before class

  return now < oneHourBeforeJoin;
};

// LMC button: 15 minutes before class until 15 minutes after
const isLastMinuteCancelEnabled = (classTime) => {
  const now = new Date();
  const classStart = new Date(classTime);
  const lmcStart = new Date(classStart.getTime() - (65 * 60 * 1000)); // 1h5m before
  const joinEnableTime = new Date(classStart.getTime() - (5 * 60 * 1000)); // 5m before

  return now >= lmcStart && now < joinEnableTime;
};



  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />
      case "message":
        return <Message />
      // case "notification":
      //   return <Notification userType="student" />
      case "class-report":
        return <ClassReport />
      case "punctuality-report":
        return <PunctualityReport />
      case "assignments":
        return <MyAssignments />
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
        <p>Teacher Name: {ongoingClass.teachers.join(", ")}</p>
        <p>
          Time:{" "}
          {new Date(ongoingClass.time).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
        <p>Duration: {ongoingClass.duration}</p>
        <p>Batch: {ongoingClass.batch}</p>
        <p>Level: {ongoingClass.level}</p>
        <p>Teacher ID: {ongoingClass.teacherId}</p>
        <p>Plan: {ongoingClass.plan}</p>
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
        <div className="section-header">
          <h2>UPCOMING CLASSES</h2>
        </div>
        <div className="classes-list">
          {(showAllClasses ? upcomingClasses : upcomingClasses.slice(0, 4)).map((classItem) => (
            <div
              key={classItem.id}
              className={`class-card-horizontal ${classItem.rescheduled ? "rescheduled-card" : ""}`}
              /* onClick={() => setSelectedClassId(classItem.id)} */
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
              <span className={`badge ${classItem.rescheduled ? "rescheduled" : "not-started"}`}>{classItem.rescheduled ? "Rescheduled" : classItem.status}</span>
            </div>
                <div className="class-details">
                  <p>Teacher Name: {classItem.teachers.join(", ")}</p>
                  <p>Level: {classItem.level}</p>
                  <p>Teacher ID: {classItem.teacherId}</p>
                  <p>Plan: {classItem.plan}</p>
                  <p>Duration: {classItem.duration}</p>
                </div>
              </div>
              <div className="class-actions">
               <button
                  className="start-class-btn"
                  onClick={() => { handleJoinClass(classItem)}}
                  disabled={!isJoinEnabled(classItem.time, classItem.date)}
                >
                  JOIN CLASS
                </button>


      <button
        className="leave-class-btn"
        onClick={() => {
          setSelectedLeaveClass({
            ...classItem,
            actionType: "leave", // ✅ set action type
          });
          setShowLeaveModal(true);
        }}
        disabled={!isLeaveEnabled(classItem.time)}
      >
        LEAVE
      </button>

      <button
        className="last-minute-cancel-btn"
        onClick={() => {
          setSelectedLeaveClass({
            ...classItem,
            actionType: "cancel", // ✅ set action type
          });
          setShowLeaveModal(true);
        }}
        disabled={!isLastMinuteCancelEnabled(classItem.time)}
      >
        LAST MINUTE CANCEL
      </button>
              </div>
            </div>
          ))}
        </div>
        {upcomingClasses.length > 4 && (
          <div className="view-more">
            <button className="view-more-btn" onClick={() => setShowAllClasses(!showAllClasses)}>
              {showAllClasses ? "VIEW LESS" : "VIEW MORE"}
            </button>
          </div>
        )}
      </section>

      
                  {/* <button className="start-class-btn" onClick={() => window.open(selectedClass.link, "_blank")}>
                    JOIN CLASS
                  </button>
                <button
  className="leave-class-btn"
  onClick={() => {
    setSelectedLeaveClass(classItem);
    setShowLeaveModal(true);
    selectedLeaveClass.actionType = "leave"; // ✅ tell modal what type
  }}
>
  LEAVE
</button>

<button
  className="last-minute-cancel-btn"
  onClick={() => {
    setSelectedLeaveClass(classItem);
    setShowLeaveModal(true);
    selectedLeaveClass.actionType = "cancel"; // ✅ tell modal what type
  }}
>
  LAST MINUTE CANCEL
</button> */}

           

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
            <a href="#" className="nav-link" onClick={() => navigate('/')}>
              HOME
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => { setActiveTab("dashboard"); window.scrollTo(0, 0); }}
            >
              DASHBOARD
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => { setActiveTab("profile"); window.scrollTo(0, 0); }}
            >
              MY PROFILE
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "class-report" ? "active" : ""}`}
              onClick={() => { setActiveTab("class-report"); window.scrollTo(0, 0); }}
            >
              CLASS REPORT
            </a>
            <a
              href="#"
              className={`nav-link ${activeTab === "punctuality-report" ? "active" : ""}`}
              onClick={() => { setActiveTab("punctuality-report"); window.scrollTo(0, 0); }}
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
                        window.scrollTo(0, 0)
                      }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}{item.count > 0 ? <span style={{color: 'red', fontWeight: 'bold', marginLeft: '20px'}}> ({item.count})</span> : ''}</span>
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
                            window.scrollTo(0, 0)
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
              <button
  className="btn-confirm"
  onClick={async () => {
    try {
      // Call logout endpoint
      const res = await fetch("https://amjacademy-working.onrender.com/api/users/logout", {
        method: "POST",
        credentials: "include", // important for cookie-based auth
      });

      const data = await res.json();
      console.log("Logout response:", data);

      // Clear client-side data
      localStorage.removeItem("username");

      // Redirect to home or login
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
  )
}

export default Dashboard
