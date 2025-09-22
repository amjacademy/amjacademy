"use client"

import { useState } from "react"
import "./my-assignments.css"

const MyAssignments = () => {
  const [activeSection, setActiveSection] = useState("shared")
  const [activeTab, setActiveTab] = useState("videos")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchDate, setSearchDate] = useState("")

  const sharedAssignments = [
    {
      id: 1,
      title: "Keyboard Practice Session",
      sharedBy: "S",
      type: "video",
      thumbnail: "images/keyboard-practice.jpg",
      description: "Basic scales and chord progressions",
    },
  ]

  const myUploads = {
    videos: [],
    audio: [],
    photos: [],
    docs: [],
  }

  const assessments = [
    {
      id: 1,
      studentName: "Rihan Sandipatham",
      age: "9 Years",
      subject: "Keyboard | Intermediate Level 1",
      stage: "Intermediate Level 1",
      reviewer: "Dhawal Shethia",
      dueDate: "22 Apr, 2025",
      progress: "Overall: 31/33, Current: 8/10",
      isReopen: false,
      lastRemark: "N/A",
      status: "Pending Approval",
      actions: ["View"],
    },
    {
      id: 2,
      studentName: "Elorah Michael",
      age: "8 Years",
      subject: "Keyboard | Beginner",
      stage: "Half Term",
      reviewer: "Dhawal Shethia",
      dueDate: "30 Apr, 2025",
      progress: "Overall: 24/24, Current: 24/24",
      isReopen: false,
      lastRemark: "N/A",
      status: "Pending Approval",
      actions: ["View"],
    },
    {
      id: 3,
      studentName: "Haniel null",
      age: "8 Years",
      subject: "Keyboard | Beginner",
      stage: "Half Term",
      reviewer: "Dhawal Shethia",
      dueDate: "30 Apr, 2025",
      progress: "Overall: 24/24, Current: 24/24",
      isReopen: false,
      lastRemark: "N/A",
      status: "Pending Approval",
      actions: ["View"],
    },
  ]

  const renderSharedAssignments = () => (
    <div className="shared-assignments">
      <div className="assignments-header">
        <h2>ASSIGNMENTS SHARED</h2>
      </div>

      <div className="content-tabs">
        <button
          className={`content-tab ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`content-tab ${activeTab === "photos" ? "active" : ""}`}
          onClick={() => setActiveTab("photos")}
        >
          Photos
        </button>
        <button className={`content-tab ${activeTab === "docs" ? "active" : ""}`} onClick={() => setActiveTab("docs")}>
          Docs
        </button>
      </div>

      <div className="assignments-content">
        {sharedAssignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-thumbnail">
              <img src={assignment.thumbnail || "/placeholder.svg"} alt={assignment.title} />
            </div>
            <div className="assignment-info">
              <div className="shared-by">
                Shared by <span className="shared-badge">{assignment.sharedBy}</span>
              </div>
              <h3>{assignment.title}</h3>
              <p>{assignment.description}</p>
            </div>
            <div className="assignment-actions">
              <button className="view-btn">VIEW</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMyUploads = () => (
    <div className="my-uploads">
      <div className="uploads-header">
        <h2>ASSIGNMENT UPLOADS</h2>
        <button className="upload-btn">UPLOAD</button>
      </div>

      <div className="content-tabs">
        <button
          className={`content-tab ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`content-tab ${activeTab === "audio" ? "active" : ""}`}
          onClick={() => setActiveTab("audio")}
        >
          Audio
        </button>
        <button
          className={`content-tab ${activeTab === "photos" ? "active" : ""}`}
          onClick={() => setActiveTab("photos")}
        >
          Photos
        </button>
        <button className={`content-tab ${activeTab === "docs" ? "active" : ""}`} onClick={() => setActiveTab("docs")}>
          Docs
        </button>
      </div>

      <div className="search-section">
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Search By Keyword"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="date-input"
          />
          <button className="search-btn">🔍 Search</button>
        </div>
      </div>

      <div className="uploads-content">
        <div className="empty-state">
          <p>You do not have any {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}.</p>
        </div>
      </div>
    </div>
  )

  const renderAssessments = () => (
    <div className="assessments-section">
      <div className="assessments-header">
        <h2>Assessments</h2>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <span>Filter By</span>
          <span>Due Date</span>
          <select className="subject-select">
            <option>Select Subject</option>
            <option>Keyboard</option>
            <option>Piano</option>
            <option>Guitar</option>
          </select>
          <select className="stage-select">
            <option>Select Stage</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <input type="text" placeholder="Student Name" className="student-input" />
          <button className="refresh-btn">🔄</button>
        </div>

        <div className="status-filters">
          <label>
            <input type="radio" name="status" value="all" defaultChecked /> All
          </label>
          <label>
            <input type="radio" name="status" value="due" /> Due
          </label>
          <label>
            <input type="radio" name="status" value="overdue" /> Overdue
          </label>
          <label>
            <input type="radio" name="status" value="pending" /> Pending Approval
          </label>
          <label>
            <input type="radio" name="status" value="approved" /> Approved
          </label>
          <label>
            <input type="radio" name="status" value="completed" /> Completed
          </label>
          <label>
            <input type="radio" name="status" value="reopen" /> Re-open
          </label>
        </div>
      </div>

      <div className="table-controls">
        <span>
          Show
          <select className="entries-select">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>{" "}
          entries
        </span>
        <div className="export-buttons">
          <button className="export-btn">📄</button>
          <button className="export-btn">📊</button>
        </div>
      </div>

      <div className="assessments-table">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Subject & Level</th>
              <th>Stage</th>
              <th>Reviewer</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th>Is Reopen</th>
              <th>Last Remark</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment.id}>
                <td>
                  <div className="student-info">
                    <strong>{assessment.studentName}</strong>
                    <br />
                    <small>{assessment.age}</small>
                  </div>
                </td>
                <td>{assessment.subject}</td>
                <td>{assessment.stage}</td>
                <td>{assessment.reviewer}</td>
                <td>{assessment.dueDate}</td>
                <td>
                  <div className="progress-info">
                    <div>{assessment.progress}</div>
                  </div>
                </td>
                <td>{assessment.isReopen ? "Yes" : "No"}</td>
                <td>{assessment.lastRemark}</td>
                <td>
                  <span className="status-badge pending">{assessment.status}</span>
                </td>
                <td>
                  <button className="action-view-btn">👁 View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Showing 1 to 10 of 13 entries</span>
        <div className="pagination-controls">
          <button>Previous</button>
          <button className="active">1</button>
          <button>2</button>
          <button>Next</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="my-assignments-container">
      <div className="assignments-nav">
        <button
          className={`nav-btn ${activeSection === "shared" ? "active" : ""}`}
          onClick={() => setActiveSection("shared")}
        >
          Shared With Me
        </button>
        <button
          className={`nav-btn ${activeSection === "uploads" ? "active" : ""}`}
          onClick={() => setActiveSection("uploads")}
        >
          My Uploads
        </button>
        <button
          className={`nav-btn ${activeSection === "assessments" ? "active" : ""}`}
          onClick={() => setActiveSection("assessments")}
        >
          Assessments
        </button>
      </div>

      <div className="assignments-content">
        {activeSection === "shared" && renderSharedAssignments()}
        {activeSection === "uploads" && renderMyUploads()}
        {activeSection === "assessments" && renderAssessments()}
      </div>
    </div>
  )
}

export default MyAssignments
