"use client"

import { useState } from "react"
import "./class-report.css"

const ClassReport = () => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [filterBy, setFilterBy] = useState("all")
  const [dateRange, setDateRange] = useState("Aug 20, 2025 - Sep 18, 2025")

  const classData = {
    upcoming: [
      {
        id: 1,
        date: "Thursday, 21st Aug at 10:00 AM",
        type: "Individual Batch",
        subject: "Keyboard",
        status: "Not Started",
        curriculum: "N/A",
        instructor: "Ms. Sarah",
        image: "/keyboard-lesson.jpg",
      },
      {
        id: 2,
        date: "Thursday, 22nd Aug at 03:00 AM",
        type: "Group Batch For Buddy (1/2)",
        subject: "Piano",
        status: "Not Started",
        curriculum: "N/A",
        instructor: "Mr. John",
        image: "/piano-lesson.png",
      },
      {
        id: 3,
        date: "Thursday, 23rd Aug at 04:00 AM",
        type: "Group Batch For Buddy (1/2)",
        subject: "Guitar",
        status: "Not Started",
        curriculum: "N/A",
        instructor: "Ms. Emily",
        image: "/guitar-lesson.png",
      },
    ],
    completed: [
      {
        id: 4,
        date: "Wednesday, 20th Aug at 10:00 PM",
        type: "Individual Batch",
        subject: "Keyboard",
        status: "Completed",
        curriculum: "S-4 Intermediate ()",
        instructor: "Ms. Sarah",
        image: "/keyboard-lesson.jpg",
      },
      {
        id: 5,
        date: "Tuesday, 19th Aug at 11:00 PM",
        type: "Sibling Batch",
        subject: "Piano",
        status: "Completed",
        curriculum: "S-5 Intermediate ()",
        instructor: "Mr. David",
        image: "/piano-lesson.png",
      },
    ],
    cancelled: [
      {
        id: 6,
        date: "Monday, 18th Aug at 09:00 AM",
        type: "Group Batch For LB",
        subject: "Violin",
        status: "Cancelled",
        curriculum: "N/A",
        instructor: "Ms. Lisa",
        image: "/violin-lesson.jpg",
      },
    ],
    missed: [
      {
        id: 7,
        date: "Sunday, 17th Aug at 02:00 PM",
        type: "Individual Batch",
        subject: "Drums",
        status: "Missed",
        curriculum: "N/A",
        instructor: "Mr. Mike",
        image: "/drums-lesson.jpg",
      },
    ],
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      "Not Started": "status-not-started",
      Completed: "status-completed",
      Cancelled: "status-cancelled",
      Missed: "status-missed",
    }
    return statusClasses[status] || "status-default"
  }

  const getSubjectBadge = (subject) => {
    const subjectClasses = {
      Keyboard: "subject-keyboard",
      Piano: "subject-piano",
      Guitar: "subject-guitar",
      Violin: "subject-violin",
      Drums: "subject-drums",
    }
    return subjectClasses[subject] || "subject-default"
  }

  return (
    <div className="class-report-container">
      <div className="class-report-header">
        <h1>CLASSES</h1>
      </div>

      <div className="class-report-filters">
        <div className="date-filter">
          <input type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="date-input" />
        </div>
        <div className="student-filter">
          <select className="filter-select">
            <option>Filter by Student</option>
            <option>All Students</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
          </select>
        </div>
      </div>

      <div className="class-tabs">
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          UPCOMING
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          COMPLETED
        </button>
        <button
          className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          CANCELLED
        </button>
        <button className={`tab-btn ${activeTab === "missed" ? "active" : ""}`} onClick={() => setActiveTab("missed")}>
          MISSED
        </button>
        <div className="total-classes">
          Total Upcoming Classes: <span className="count">66</span>
        </div>
      </div>

      <div className="classes-content">
        {classData[activeTab]?.map((classItem) => (
          <div key={classItem.id} className="class-item">
            <div className="class-image">
              <img src={classItem.image || "/placeholder.svg"} alt={classItem.subject} />
            </div>
            <div className="class-details">
              <div className="class-date">{classItem.date}</div>
              <div className="class-badges">
                <span className={`badge type-badge`}>{classItem.type}</span>
                <span className={`badge subject-badge ${getSubjectBadge(classItem.subject)}`}>{classItem.subject}</span>
                <span className={`badge status-badge ${getStatusBadge(classItem.status)}`}>{classItem.status}</span>
              </div>
              <div className="class-curriculum">Curriculum Stamp: {classItem.curriculum}</div>
              <div className="class-instructor">Instructor: {classItem.instructor}</div>
            </div>
            <div className="class-actions">
              {activeTab === "upcoming" && <button className="action-btn start-btn">START</button>}
              {activeTab === "completed" && <button className="action-btn view-btn">VIEW</button>}
              {(activeTab === "cancelled" || activeTab === "missed") && (
                <button className="action-btn reschedule-btn">RESCHEDULE</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeTab === "completed" && (
        <div className="view-more-section">
          <button className="view-more-btn">View Sales Pre-Demo Insight</button>
          <button className="view-more-btn secondary">VIEW MORE</button>
        </div>
      )}
    </div>
  )
}

export default ClassReport
