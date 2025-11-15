"use client"

import { useState, useEffect } from "react"
import "./my-assignments.css"

const MyAssignments = () => {
  const [showForm, setShowForm] = useState(false)
  const [formAnswers, setFormAnswers] = useState({})
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null)
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      subject: "Keyboard | Intermediate ",
      teacher: "Anto maria joshua",
      dueDate: "22 Apr, 2025",
      progress: "Overall: 31/33, Current: 8/10",
      status: "Incomplete",
      actions: ["View"],
    },
    {
      id: 2,
      subject: "Keyboard | Beginner",
      teacher: "Developer1",
      dueDate: "30 Apr, 2025",
      progress: "Overall: 24/24, Current: 24/24",
      status: "Completed",
      actions: ["Submited"],
    },
    {
      id: 3,
      subject: "Keyboard | Beginner",
      teacher: "Anto maria joshua",
      dueDate: "30 Apr, 2025",
      progress: "Overall: 24/24, Current: 24/24",
      status: "Completed",
      actions: ["Submited"],
    },
  ])

  const questions = [
    "Did you come prepared for each class?",
    "Did you practice at least once between sessions?",
    "Did you remember what was taught in the previous session?",
    "Did you follow instructions properly during the class?",
    "Did you stay focused for the whole session?",
    "Did you improve on the mistakes the teacher pointed out last time?",
    "Did you ask for help whenever you didn't understand something?",
    "Did you cooperate during group or pair activities?",
    "Did you practice the assigned piece/exercise at home?",
    "Did you feel more confident compared to last week's session?"
  ]

  const handleViewClick = (assessmentId) => {
    setCurrentAssessmentId(assessmentId)
    setShowForm(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted with answers:", formAnswers)

    // Update the assessment status and actions
    setAssessments(prevAssessments =>
      prevAssessments.map(assessment =>
        assessment.id === currentAssessmentId
          ? {
              ...assessment,
              status: "Completed",
              actions: ["Submited"]
            }
          : assessment
      )
    )

    // Here you can handle the submission, e.g., send to API
    setShowForm(false)
    setFormAnswers({})
    setCurrentAssessmentId(null)
  }

  const handleAnswerChange = (questionIndex, answer) => {
    setFormAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const renderAssessments = () => (
    <div className="assessments-section">
      {/* <div className="assessments-header">
        <h2>My Assessments</h2>
      </div> */}

      <div className="filter-section">
        <div className="filter-row">
          <span>Filter By</span>
          <span>Due Date</span>
          <select className="subject-select">
            <option>Select Subject</option>
            <option>Keyboard</option>
            <option>Piano</option>
            {/* <option>Guitar</option> */}
          </select>
          <select className="stage-select">
            <option>Select level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <button className="refresh-btn">🔄</button>
        </div>

        <div className="status-filters">
          <label>
            <input type="radio" name="status" value="all" defaultChecked /> All
          </label>
          {/* <label>
            <input type="radio" name="status" value="due" /> Due
          </label>
          <label>
            <input type="radio" name="status" value="overdue" /> Overdue
          </label> */}
          <label>
            <input type="radio" name="status" value="Incomplete" /> Incomplete
          </label>
          <label>
            <input type="radio" name="status" value="Completed" /> Completed
          </label>
          {/* <label>
            <input type="radio" name="status" value="approved" /> Approved
          </label>
          <label>
            <input type="radio" name="status" value="completed" /> Completed
          </label> */}
        </div>
      </div>

      {/* <div className="table-controls">
        <div className="export-buttons">
          <button className="export-btn">📄</button>
        </div>
      </div> */}

      <div className="assessments-table">
        <table>
          <thead>
            <tr>
              <th>Subject & Level</th>
              <th>Teacher Name</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment.id}>
                <td>{assessment.subject}</td>
                <td>{assessment.teacher}</td>
                <td>{assessment.dueDate}</td>
                <td>
                  <div className="progress-info">
                    <div>{assessment.progress}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${assessment.status.toLowerCase().replace(' ', '')}`}>{assessment.status}</span>
                </td>
                <td>
                  {assessment.actions.map((action) => (
                    <button
                      key={action}
                      className={`action-view-btn ${action === "Submited" ? "completed" : ""}`}
                      onClick={action === "View" ? () => handleViewClick(assessment.id) : undefined}
                    >
                      {action}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {/* <span>Showing 1 to 10 of 13 entries</span> */}
        <div className="pagination-controls">
          <button>Previous</button>
          <button className="active">1</button>
          <button>2</button>
          <button>Next</button>
        </div>
      </div>
    </div>
  )

  const renderForm = () => (
    <div className="assessment-form-overlay">
      <div className="assessment-form-container">
        <div className="form-header">
          <h2>Weekly Assessment</h2>
          <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
        </div>
        <form onSubmit={handleFormSubmit} className="assessment-form">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <p className="question-text">{index + 1}. {question}</p>
              <div className="answer-options">
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value="Yes"
                    checked={formAnswers[index] === "Yes"}
                    onChange={() => handleAnswerChange(index, "Yes")}
                    required
                  />
                  <span className="option-text">Yes</span>
                </label>
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value="No"
                    checked={formAnswers[index] === "No"}
                    onChange={() => handleAnswerChange(index, "No")}
                    required
                  />
                  <span className="option-text">No</span>
                </label>
              </div>
            </div>
          ))}
          <div className="form-actions">
            <button type="submit" className="submit-btn">Submit Assessment</button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="my-assignments-container">
      <div className="content-header3">
        <h1>MY ASSIGNMENTS</h1>
      </div>
      <div className="assignments-content">
        {renderAssessments()}
      </div>
      {showForm && renderForm()}
    </div>
  )
}

export default MyAssignments
