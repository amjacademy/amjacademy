"use client";

import { useState, useEffect } from "react";
import "./class-report.css";

const ClassReport = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterBy, setFilterBy] = useState("all");
  const [dateRange, setDateRange] = useState("Aug 20, 2025 - Sep 18, 2025");
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Convert frontend tab to backend status
  const getStatusValue = (tab) => {
    switch (tab) {
      case "upcoming":
        return "upcoming";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      case "missed":
        return "missed";
      default:
        return "upcoming";
    }
  };

  useEffect(() => {
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

        // Backend expects these query params: user_id, status, subject
        const queryParams = new URLSearchParams({
          user_id: userId,
          status,
          subject: filterBy,
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

    fetchClasses();
  }, [activeTab, filterBy]);

  // Badge helpers
  const getStatusBadge = (status) => {
    const statusClasses = {
      upcoming: "status-not-started",
      completed: "status-completed",
      cancelled: "status-cancelled",
      missed: "status-missed",
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

  // Image based on subject
  const getSubjectImage = (subject) => {
    switch (subject) {
      case "Piano":
        return "/piano-lesson.png";
      case "Guitar":
        return "/guitar-lesson.png";
      case "Violin":
        return "/violin-lesson.jpg";
      case "Drums":
        return "/drums-lesson.jpg";
      default:
        return "/keyboard-lesson.jpg";
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
          <input
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="student-filter">
          <select
            className="filter-select"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="Keyboard">Keyboard</option>
            <option value="Piano">Piano</option>
            <option value="Guitar">Guitar</option>
            <option value="Violin">Violin</option>
            <option value="Drums">Drums</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="class-tabs">
        {["upcoming", "completed", "cancelled", "missed"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        <div className="total-classes">
          Total {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Classes:{" "}
          <span className="count">{classData.length}</span>
        </div>
      </div>

      {/* Class Cards */}
      <div className="classes-content">
        {loading ? (
          <p>Loading classes...</p>
        ) : classData.length > 0 ? (
          classData.map((classItem) => (
            <div key={classItem.id} className="class-item">
              <div className="class-image">
                <img src={getSubjectImage(classItem.subject)} alt={classItem.subject} />
              </div>
              <div className="class-details">
                <div className="class-date">
                  {new Date(classItem.date).toLocaleDateString()}{"  "}{classItem.day}{" "}
                  at {new Date(classItem.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="class-badges">
                  <span className="badge type-badge">{classItem.batch_type}</span>
                  <span className={`badge subject-badge ${getSubjectBadge(classItem.subject)}`}>
                    {classItem.subject}
                  </span>
                  <span className={`badge status-badge ${getStatusBadge(classItem.status)}`}>
                    {classItem.status}
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
                {activeTab === "upcoming" && <button className="action-btn start-btn">JOIN</button>}
                {activeTab === "completed" && <button className="action-btn view-btn">VIEW</button>}
                {(activeTab === "cancelled" || activeTab === "missed") && (
                  <button className="action-btn reschedule-btn">RESCHEDULE</button>
                )}
              </div>
            </div>
          ))
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
