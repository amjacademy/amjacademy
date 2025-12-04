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
  const [students, setStudents] = useState([]);
  const image = "/images/amj-logo.png";
  // Map frontend tab to backend status in arrangements table
  const getStatusValue = (tab) => {
    switch (tab) {
      case "upcoming":
        return "upcoming";
      case "completed":
        return "completed";
      case "Missing":
        return "Missing"; // backend should handle fetching leave, cancel, notshown together
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
        student_id: filterBy,
        date_from: fromDate,
        date_to: toDate,
      });

      const response = await fetch(
        `${MAIN}/api/teacher/classreport/fetchclasses?${queryParams}`,
        { credentials: "include" }
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

  //Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const res = await fetch(
          `${MAIN}/api/teacher/classreport/getstudents?user_id=${userId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudents();
  }, []);

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
            <option value="">Filter by Student</option>
            <option value="all">All Students</option>

            {students.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.name}
              </option>
            ))}
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
                    Student:
                    {classItem.type === "group" ? (
                      <> Group Class </>
                    ) : (classItem.batch_type ||
                        classItem.arrangements?.batch_type) === "dual" ? (
                      <>
                        {" "}
                        {classItem.student1_name || "N/A"} &{" "}
                        {classItem.student2_name || "N/A"}
                      </>
                    ) : (
                      <> {classItem.student_name || "N/A"} </>
                    )}
                  </div>

                  {/* Missing tab details */}
                  {activeTab === "Missing" && (
                    <>
                      <p className="class-status-detail">
                        {classItem.status === "leave"
                          ? "Leave"
                          : classItem.status === "cancel"
                          ? "Last Minute Cancel"
                          : classItem.status === "notshown"
                          ? "Not Shown"
                          : "Missing"}
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
                          (window.location.href = "/teacher-dashboard")
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
