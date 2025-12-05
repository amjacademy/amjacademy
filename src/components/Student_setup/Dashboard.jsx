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
import PunctualityReport from "./punctuality-repot.jsx";
import LeaveModal from "../common/LeaveModal.jsx";
import { supabase } from "../../supabaseClient.js";
const Dashboard = () => {
  const navigate = useNavigate();
  const userType = "student";
  const userId = localStorage.getItem("user_id");
  const MAIN = import.meta.env.VITE_MAIN; // Use localhost for testing
  const TEST = import.meta.env.VITE_TEST;

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
  const [ongoingGroupClass, setOngoingGroupClass] = useState(null);
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
  //announcement
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${MAIN}/api/student/fetchannouncements?`, {
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
    try {
      const response = await fetch(`${MAIN}/api/messages/unread-count`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setMessageUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
      setMessageUnreadCount(0);
    }
  };

  // Fetch unread message count on mount and on user activity
  useEffect(() => {
    refreshUnreadCount();

    // Refresh on window focus
    const handleFocus = () => refreshUnreadCount();

    // Refresh on visibility change (tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUnreadCount();
      }
    };

    // Refresh on user click anywhere on the page
    const handleClick = () => refreshUnreadCount();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
          `${MAIN}/api/assessments/incomplete-count`,
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

    
      fetchIncompleteCount();
      // Refresh on window focus
    const handleFocus = () => refreshUnreadCount();

    // Refresh on visibility change (tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUnreadCount();
      }
    };

    // Refresh on user click anywhere on the page
    const handleClick = () => refreshUnreadCount();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    
  }, []);

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
      const res = await fetch(`${MAIN}/api/student/ongoing-class`, {
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
      const res = await fetch(`${MAIN}/api/student/upcoming-classes`, {
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

  //upcoming classes
  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${MAIN}/api/student/upcoming-classes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          /*  console.log("Raw upcoming classes data:", data.upcomingClasses); */
          // Map backend data to unify with group classes by adding sessionAt
          const classes = data.upcomingClasses.map((cls) => {
            // create sessionAt as ISO string
            const sessionAt =
              makeSessionAtFromDateTime(cls.date, cls.time) ||
              cls.time ||
              cls.session_at;
            return {
              id:
                cls.student1_id +
                "_" +
                (cls.date || "") +
                "_" +
                (cls.time || ""),
              type: "individual",
              sessionAt, // ISO
              rawDate: cls.date,
              rawTime: cls.time,
              batch: cls.batch_type,
              teachers: [cls.teacher_name],
              level: cls.level,
              plan: cls.plan,
              duration: cls.duration || "45 mins",
              teacherId: cls.teacher_id || "AMJT0001",
              image:
                "/images/amj-logo.png?height=120&width=200&query=keyboard lesson",
              title: `${cls.profession} Class`,
              status: cls.status || "not started",
              link: cls.link,
              class_id: cls.class_id,
              rescheduled: cls.rescheduled,
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
  }, []);

  //group classes
  useEffect(() => {


    const fetchGroupClasses = async () => {
      

      const url = `${MAIN}/api/grouparrangements/student/classes`;
      console.log("Fetching group classes from:", url);

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        console.log("Group classes response status:", response.status);
        const data = await response.json();
        console.log("Group classes data:", data);

        if (data.success && data.classes) {
          const formatted = data.classes.map((cls) => {
            const sessionAt = cls.start_time || cls.session_at;
            const groupData = cls.group_arrangements || {};

            return {
              type: "group",
              groupId: cls.group_arrangement_id,
              groupName: groupData.group_name || "Group Class",
              teacherId: groupData.teacher_id,
              teacherName: groupData.teacher_name || "Teacher",
              classLink: groupData.link || "",
              sessionAt,
              sessionNumber: cls.session_number || 1,
              totalSessions: groupData.no_of_sessions || 0,
              sessionForWeek: groupData.no_of_sessions_week || 1,
              duration: "50 mins",
              status: cls.status || "upcoming",
              classId: cls.class_id,
              image: "/images/amj-logo.png",
            };
          });
          console.log("Formatted group classes:", formatted);
          setGroupClasses(formatted);
        }
      } catch (err) {
        console.error("Error fetching group classes:", err);
      }
    };

    fetchGroupClasses();
  }, []);

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

  //ongoing class
  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        const response = await fetch(`${MAIN}/api/student/ongoing-class`, {
          headers: {
            "Content-Type": "application/json",
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
        }
      } catch (err) {
        console.error("Error fetching ongoing class:", err);
      }
    };

    fetchOngoing();
  }, []);

  // Fetch ongoing group class
  const fetchOngoingGroupClass = async () => {
    try {
      const response = await fetch(
        `${MAIN}/api/grouparrangements/ongoing?role=student`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.ongoingGroupClass) {
        setOngoingGroupClass(data.ongoingGroupClass);
      }
    } catch (err) {
      console.error("Error fetching ongoing group class:", err);
    }
  };

  useEffect(() => {
   
      fetchOngoingGroupClass();
  
  }, []);

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
      const isGroupClass = selectedLeaveClass.type === "group";

      // Use different endpoint for group classes
      const endpoint = isGroupClass
        ? `${MAIN}/api/grouparrangements/actions/submit`
        : `${MAIN}/api/student/actions/submit`;

      const payload = {
        class_id: isGroupClass
          ? selectedLeaveClass.classId
          : selectedLeaveClass.class_id,
        action_type: leaveData.actionType,
        reason: leaveData.reason || "",
        role: "student",
      };

      console.log("Submitting leave/cancel:", {
        endpoint,
        payload,
        isGroupClass,
      });

      const response = await fetch(endpoint, {
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

        // Remove the class from the appropriate list
        if (isGroupClass) {
          setGroupClasses((prev) =>
            prev.filter((c) => c.classId !== selectedLeaveClass.classId)
          );
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
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

      const response = await fetch(`${MAIN}/api/student/class-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classItem.class_id,
          status: "ongoing",
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
      // Open the class link
      window.open(cls.classLink, "_blank");

      // Update status in group_class_statuses table
      const response = await fetch(
        `${MAIN}/api/grouparrangements/class-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_id: cls.classId,
            status: "ongoing",
          }),
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log("Join group class response:", data);

      if (data.success) {
        const ongoing = {
          classId: cls.classId,
          groupId: cls.groupId,
          groupName: cls.groupName,
          teacherId: cls.teacherId,
          teacherName: cls.teacherName,
          classLink: cls.classLink,
          sessionAt: cls.sessionAt,
          entryTime: new Date().toISOString(),
          totalSessions: cls.totalSessions,
          students: cls.students || [],
          image: cls.image || "/images/amj-logo.png",
        };

        setOngoingGroupClass(ongoing);

        // Remove from group list
        setGroupClasses((prev) =>
          prev.filter((g) => g.classId !== cls.classId)
        );
      } else {
        console.error("Failed to update group class status:", data.message);
      }
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
      classStart.getTime() - (60 + 5) * 60 * 1000
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
    const teacherName = isGroup
      ? cls.teacherName || cls.teacherId
      : cls.teachers && cls.teachers.join(", ");
    const duration = isGroup ? "50 mins" : cls.duration || "45 mins";
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
            <p>Class ID: {isGroup ? cls.classId : cls.class_id}</p>
            <p>Teacher: {teacherName}</p>
            {!isGroup && cls.level && <p>Level: {cls.level}</p>}
            {!isGroup && cls.plan && <p>Plan: {cls.plan}</p>}
            {isGroup && <p>Group: {cls.groupName}</p>}
            <p>Duration: {duration}</p>
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
                    <p>Class ID: {ongoingClass.class_id}</p>
                    <p>
                      Teacher Name:{" "}
                      {ongoingClass.teachers
                        ? ongoingClass.teachers.join(", ")
                        : ongoingClass.teacherId}
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
                    {/* <p>Level: {ongoingClass.level}</p> */}
                    <p>Teacher ID: {ongoingClass.teacherId}</p>
                    {/* <p>Plan: {ongoingClass.plan}</p> */}
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

            {/* Ongoing Group Class Section */}
            {ongoingGroupClass && (
              <section className="class-details-section">
                <div className="section-header">
                  <h2>ON GOING GROUP CLASS</h2>
                </div>
                <div className="class-details-card">
                  <div className="class-image">
                    <img
                      src={ongoingGroupClass.image || "/images/amj-logo.png"}
                      alt={ongoingGroupClass.groupName}
                    />
                  </div>
                  <div className="class-info">
                    <h3>{ongoingGroupClass.groupName}</h3>
                    <p>Class ID: {ongoingGroupClass.classId}</p>
                    <p>
                      Teacher Name:{" "}
                      {ongoingGroupClass.teacherName ||
                        ongoingGroupClass.teacherId}
                    </p>
                    <p>
                      Time:{" "}
                      {new Date(ongoingGroupClass.sessionAt).toLocaleTimeString(
                        undefined,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </p>
                    <p>Duration: 50 mins</p>
                    <p>Batch: Group</p>
                    <p>Total Sessions: {ongoingGroupClass.totalSessions}</p>
                  </div>
                  <div className="class-actions">
                    <button
                      className="rejoin-btn"
                      onClick={() =>
                        window.open(ongoingGroupClass.classLink, "_blank")
                      }
                    >
                      RE-JOIN
                    </button>
                    <button
                      className="close-btn"
                      onClick={() => setOngoingGroupClass(null)}
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
