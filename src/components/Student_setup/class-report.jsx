"use client";

import { useState, useEffect } from "react";
import "./class-report.css";

const ClassReport = () => {
  const MAIN = import.meta.env.VITE_MAIN;
  const TEST = import.meta.env.VITE_TEST;

  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterBy, setFilterBy] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(false);
  const image = "/images/amj-logo.png";
  // Demo data for each tab
  /*  const getDemoData = (tab) => {
    switch (tab) {
      case "upcoming":
        return [
          {
            id: 1,
            batch_type: "Individual",
            status: "upcoming",
            curriculum: "Keyboard Basics",
            teacher_id: "John Smith",
            arrangements: {
              subject: "Keyboard",
              date: "2025-01-15",
              day: "Monday",
              time: "14:00:00",
            },
          },
          {
            id: 2,
            batch_type: "Group",
            status: "upcoming",
            curriculum: "Piano Fundamentals",
            teacher_id: "Sarah Johnson",
            arrangements: {
              subject: "Piano",
              date: "2025-01-16",
              day: "Tuesday",
              time: "16:30:00",
            },
          },
        ];
      case "completed":
        return [
          {
            id: 3,
            batch_type: "Individual",
            status: "completed",
            curriculum: "Keyboard Intermediate",
            teacher_id: "John Smith",
            arrangements: {
              subject: "Keyboard",
              date: "2025-01-10",
              day: "Wednesday",
              time: "14:00:00",
            },
          },
          {
            id: 4,
            batch_type: "Group",
            status: "completed",
            curriculum: "Piano Scales",
            teacher_id: "Sarah Johnson",
            arrangements: {
              subject: "Piano",
              date: "2025-01-11",
              day: "Thursday",
              time: "16:30:00",
            },
          },
        ];
      case "Missing":
        return [
          {
            id: 5,
            batch_type: "Individual",
            status: "leave",
            curriculum: "Keyboard Advanced",
            teacher_id: "John Smith",
            reason: "Medical leave",
            arrangements: {
              subject: "Keyboard",
              date: "2025-01-08",
              day: "Monday",
              time: "14:00:00",
            },
          },
          {
            id: 6,
            batch_type: "Group",
            status: "cancel",
            curriculum: "Piano Theory",
            teacher_id: "Sarah Johnson",
            reason: "Teacher unavailable",
            arrangements: {
              subject: "Piano",
              date: "2025-01-09",
              day: "Tuesday",
              time: "16:30:00",
            },
          },
          {
            id: 7,
            batch_type: "Individual",
            status: "notshown",
            curriculum: "Keyboard Practice",
            teacher_id: "John Smith",
            reason: "Student did not attend",
            arrangements: {
              subject: "Keyboard",
              date: "2025-01-07",
              day: "Sunday",
              time: "10:00:00",
            },
          },
        ];
      default:
        return [];
    }
  }; */

  // Map frontend tab to backend status in arrangements table
  const getStatusValue = (tab) => {
    switch (tab) {
      case "upcoming":
        return "upcoming";
      case "completed":
        return "completed";
      case "Missing":
        return "missing"; // send keyword Missing only
      // ✅ send all 3 to backend
      default:
        return "upcoming";
    }
  };

  // Fetch classes from backend
  const fetchClasses = async () => {
    try {
      setLoading(true);

      const status = getStatusValue(activeTab);

      const subjectMap = {
        all: "all",
        keyboard: "Keyboard",
        piano: "Piano",
        guitar: "Guitar",
        violin: "Violin",
        drums: "Drums",
      };

      const subjectFilter = subjectMap[filterBy] || "all";

      const queryParams = new URLSearchParams({
        status,
        subject: subjectFilter,
        date_from: fromDate,
        date_to: toDate,
      });
      const response = await fetch(
        `${MAIN}/api/classreport/fetchclasses?${queryParams}`,
        {
          credentials: "include", // ✅ add this line
        }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to fetch classes");

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
    const cleanStatus = status.replace(/\s+/g, "").toLowerCase();

    const statusClasses = {
      upcoming: "status-not-started",
      completed: "status-completed",
      leave: "status-cancelled",
      cancel: "status-missed",
      "not shown": "status-notshown",
    };

    return statusClasses[cleanStatus] || "status-default";
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
        {["upcoming", "completed", "Missing"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        <div className="total-classes">
          Total {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
          Classes: <span className="count">{classData.length}</span>
        </div>
      </div>

      {/* Class Cards */}
      <div className="classes-content">
        {loading ? (
          <p>Loading classes...</p>
        ) : classData.length > 0 ? (
          classData.map((classItem) => {
            const { arrangements } = classItem;

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
                  <img src={image} alt={arrangements.subject} />
                </div>
                <div className="class-details">
                  <div className="class-date">
                    {new Date(arrangements.date).toLocaleDateString()}{" "}
                    {arrangements.day} at{" "}
                    {new Date(arrangements.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="class-badges">
                    <span
                      className={`badge type-badge ${
                        classItem.type === "group" ? "group-badge" : ""
                      }`}
                    >
                      {classItem.batch_type}
                    </span>
                    <span
                      className={`badge subject-badge ${getSubjectBadge(
                        arrangements.subject
                      )}`}
                    >
                      {classItem.type === "group"
                        ? classItem.group_name || arrangements.subject
                        : arrangements.subject}
                    </span>
                    <span
                      className={`badge status-badge ${getStatusBadge(
                        classItem.status
                      )}`}
                    >
                      {classItem.status}
                    </span>
                  </div>

                  {/* Show Class ID */}
                  <div className="class-id">Class ID: {classItem.class_id}</div>

                  {/* <div className="class-curriculum">
                    Curriculum Stamp: {classItem.curriculum || "N/A"}
                  </div> */}
                  <div className="class-instructor">
                    Instructor: {classItem.instructor_name || "N/A"}
                  </div>

                  {/* Missing tab details */}
                  {activeTab === "Missing" && (
                    <>
                      <p className="class-status-detail">
                        {(() => {
                          const s = classItem.status
                            .replace(/\s+/g, "")
                            .toLowerCase();
                          if (s === "leave") return "Leave";
                          if (s === "cancel") return "Last Minute Cancel";
                          if (s === "notshown") return "Not Shown";
                          return "Missing";
                        })()}
                      </p>
                      <p className="class-reason">
                        <strong>Reason:</strong>{" "}
                        {classItem.reason || "No reason provided"}
                      </p>
                      <p className="class-reason">
                        <strong>Applied By:</strong>{" "}
                        {classItem.issuer_name || "No reason provided"}
                      </p>
                      <p className="class-reason">
                        <strong>Role:</strong>{" "}
                        {classItem.issuer_role || "No reason provided"}
                      </p>
                    </>
                  )}
                </div>

                {(activeTab === "upcoming" || activeTab === "completed") && (
                  <div className="class-actions">
                    {activeTab === "upcoming" && (
                      <button
                        className="action-btn start-btn"
                        onClick={() =>
                          (window.location.href = "/student-dashboard")
                        }
                      >
                        GO TO DASHBOARD
                      </button>
                    )}
                    {activeTab === "completed" && (
                      <button className="action-btn view-btn">VIEW</button>
                    )}
                  </div>
                )}
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
