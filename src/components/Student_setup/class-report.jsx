"use client";

import { useState, useEffect } from "react";
import "./class-report.css";

const ClassReport = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterBy, setFilterBy] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Map frontend tab to backend status in arrangements table
  const getStatusValue = (tab) => {
  switch (tab) {
    case "upcoming":
      return "upcoming";
    case "completed":
      return "completed";
    case "leave":
      return "leave";       // updated
    case "cancel":
      return "cancel";      // updated
    case "notshown":
      return "notshown";      // updated
    default:
      return "upcoming";
  }
};

  // Fetch classes from backend
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID not found in localStorage!");
        setLoading(false);
        return;
      }

      const status = getStatusValue(activeTab);

      const queryParams = new URLSearchParams({
        user_id: userId,
        status,
        subject: filterBy,
        date_from: fromDate,
        date_to: toDate,
      });

      const response = await fetch(
        `https://amjacademy-working.onrender.com/api/classreport/fetchclasses?${queryParams}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch classes");
      
      setClassData(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClassData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [activeTab, filterBy, fromDate, toDate]);

  // Badge helpers
  const getStatusBadge = (status) => {
    const statusClasses = {
      upcoming: "status-not-started",
      completed: "status-completed",
      leave: "status-cancelled",
      cancel: "status-missed",
      notshown: "status-notshown",
    };
    return statusClasses[status] || "status-default";
  };

  const getSubjectBadge = (subject) => {
    const subjectClasses = {
      Keyboard: "subject-keyboard",
      Piano: "subject-piano",
      Guitar: "subject-guitar",
      Violin: "subject-violin",
      Drums: "subject-drums",
    };
    return subjectClasses[subject] || "subject-default";
  };

  const getSubjectImage = (subject) => {
    switch (subject) {
      case "Piano": return "/piano-lesson.png";
      case "Guitar": return "/guitar-lesson.png";
      case "Violin": return "/violin-lesson.jpg";
      case "Drums": return "/drums-lesson.jpg";
      default: return "/keyboard-lesson.jpg";
    }
  };

  return (
    <div className="class-report-container">
      <div className="content-header3">
        <h1>CLASS REPORT</h1>
      </div>

      {/* Filters */}
      <div className="class-report-filters">
        <div className="date-filter">
          <div className="date-from">
            <label>Date From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-to">
            <label>Date To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
        <div className="student-filter">
          <select
            className="filter-select"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="keyboard">Keyboard</option>
            <option value="piano">Piano</option>
            <option value="guitar">Guitar</option>
            <option value="violin">Violin</option>
            <option value="drums">Drums</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="class-tabs">
  {["upcoming", "completed", "leave", "cancel", "notshown"].map((tab) => (
    <button
      key={tab}
      className={`tab-btn ${activeTab === tab ? "active" : ""}`}
      onClick={() => setActiveTab(tab)}
    >
      {tab === "leave"
        ? "LEAVE"
        : tab === "cancel"
        ? "LAST MINUTE CANCEL"
        : tab === "notshown"
        ? "NOT SHOWN"
        : tab.toUpperCase()}
    </button>
  ))}
  <div className="total-classes">
    Total{" "}
    {activeTab === "leave"
      ? "Leave"
      : activeTab === "cancel"
      ? "Last Minute Cancel"
      : activeTab === "notshown"
      ? "Not Shown"
      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
    Classes: <span className="count">{classData.length}</span>
  </div>
</div>


      {/* Class Cards */}
      <div className="classes-content">
        {loading ? (
          <p>Loading classes...</p>
        ) :classData.length > 0 ? (
  classData.map((classItem) => {
    const { arrangements } = classItem;

    // Safety check: skip or show placeholder if arrangements is missing
    if (!arrangements) {
      return (
        <div key={classItem.id} className="class-item">
          <div className="class-details">
            <div className="class-date">No schedule available</div>
          </div>
        </div>
      );
    }

    return (
      <div key={classItem.id} className="class-item">
        <div className="class-image">
          <img
            src={getSubjectImage(arrangements.subject)}
            alt={arrangements.subject}
          />
        </div>
        <div className="class-details">
          <div className="class-date">
            {new Date(arrangements.date).toLocaleDateString()} {arrangements.day} at{" "}
            {new Date(arrangements.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="class-badges">
            <span className="badge type-badge">{classItem.batch_type}</span>
            <span
              className={`badge subject-badge ${getSubjectBadge(arrangements.subject)}`}
            >
              {arrangements.subject}
            </span>
            <span
              className={`badge status-badge ${getStatusBadge(classItem.status)}`}
            >
              {classItem.status === "leave"
                ? "Leave"
                : classItem.status === "cancel"
                ? "Last Minute Cancel"
                : classItem.status === "notshown"
                ? "Not Shown"
                : classItem.status}
            </span>
          </div>
          <div className="class-curriculum">
            Curriculum Stamp: {classItem.curriculum || "N/A"}
          </div>
          <div className="class-instructor">
            Instructor: {classItem.teacher_id || "N/A"}
          </div>
        </div>
        <div className="class-actions">
          {activeTab === "upcoming" && (
            <button
              className="action-btn start-btn"
              onClick={() => (window.location.href = "/student-dashboard")}
            >
              GO TO DASHBOARD
            </button>
          )}
          {activeTab === "completed" && (
            <button className="action-btn view-btn">VIEW</button>
          )}
          {(activeTab === "leave" || activeTab === "cancel") && (
            <>
              <button className="action-btn reschedule-btn">RESCHEDULE</button>
            </>
          )}
          {activeTab === "notshown" && (
            <button className="action-btn contact-btn">RESCHEDULE</button>
          )}
        </div>
      </div>
    );
  })
) : (
  <p>No classes found for this filter.</p>
)}
      </div>

      {/* Completed Extra Section */}
      {activeTab === "completed" && classData.length > 0 && (
        <div className="view-more-section">
          <button className="view-more-btn">View Post-Class Review</button>
          <button className="view-more-btn secondary">VIEW MORE</button>
        </div>
      )}
    </div>
  );
};

export default ClassReport;
