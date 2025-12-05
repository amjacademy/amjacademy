"use client"

import { useState, useEffect } from "react"
import "./my-assignments.css"

const MyAssignments = () => {

  const MAIN=import.meta.env.VITE_MAIN;
  const TEST=import.meta.env.VITE_TEST;

  const [showForm, setShowForm] = useState(false)
  const [formAnswers, setFormAnswers] = useState({})
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null)
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [assessments, setAssessments] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const questions = [
    "Did the student come prepared for the class?",
    "Did the student practice at least once between sessions?",
    "Did the student recall what was taught in the previous session?",
    "Did the student follow the instructions properly during the class?",
    "Did the student stay focused throughout the session?",
    "Did the student show improvement on the mistakes pointed out in the last class?",
    "Did the student ask for help when they didn’t understand something?",
    "Did the student cooperate well during group or pair activities?",
    "Did the student practice the assigned piece/exercise at home?",
    "Did the student appear more confident compared to the previous session?",
    "Teacher’s comments about the student:"
  ]


const applyFilters = () => {
      let data = [...assessments];
      //subject filtering
      if (selectedSubject !== "all") {
    data = data.filter(a => a.subject === selectedSubject);
  }
      // Status Filter
      if (selectedStatus !== "all") {
        data = data.filter((a) => a.status === selectedStatus);
      }

      setFilteredAssessments(data);
};

const fetchAssessments = async () => {

      const res = await fetch(
        `${MAIN}/api/teacher/assignment/user`,
        { method: "GET", credentials: "include" }
      );

      const json = await res.json();

      if (json.success) {
        const formatted = json.data.map((a) => ({
          id: a.id,
          subject: a.subject.toLowerCase(),   // ensure lowercase
          level: a.student_level,
          student: a.student_name,
          student_id: a.student_id,
          // dueDate: a.due_date
          //   ? new Date(a.due_date).toDateString()
          //   : "No Due Date",
          progress: `Checkpoint: ${a.progress}`,
          no_of_classes: a.no_of_classes,
          total_attended_classes: a.total_attended_classes,
          status: a.is_completed ? "Completed" : "Incomplete",
          actions: [a.is_completed ? "Submited" : "View"],
        }));

        setAssessments(formatted);
        setFilteredAssessments(formatted);
      }
};

useEffect(() => {
  fetchAssessments();
}, []);

useEffect(() => {
    applyFilters();
}, [selectedSubject, selectedStatus, assessments]);

 const handleRefresh = async () => {
    setSelectedSubject("all");
    setSelectedStatus("all");

    await fetchAssessments();  // fetch new data from backend
};


  const handleViewClick = (assessmentId, studentId) => {
  setCurrentAssessmentId(assessmentId);
  setCurrentStudentId(studentId);
  setShowForm(true);
};


  const handleFormSubmit = async(e) => {
    e.preventDefault()

      const res = await fetch(`${MAIN}/api/teacher/assignment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: currentAssessmentId,
          answers: formAnswers, // JSON sent as-is
          student_id:currentStudentId,
        }),
        credentials: "include",
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error);
        return;
      }

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
          <select
            className="subject-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">Select Subject</option>
            <option value="keyboard">Keyboard</option>
            <option value="piano">Piano</option>
          </select>
            {/* <option>Guitar</option> */}
          {/* <select className="stage-select">
            <option>Select level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select> */}
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄
          </button>
        </div>

        <div className="status-filters">
           <label>
            <input
              type="radio"
              name="status"
              value="all"
              checked={selectedStatus === "all"}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
            All
          </label>
          {/* <label>
            <input type="radio" name="status" value="due" /> Due
          </label>
          <label>
            <input type="radio" name="status" value="overdue" /> Overdue
          </label> */}
          <label>
            <input
              type="radio"
              name="status"
              value="Incomplete"
              checked={selectedStatus === "Incomplete"}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
            Incomplete
          </label>
          <label>
            <input
              type="radio"
              name="status"
              value="Completed"
              checked={selectedStatus === "Completed"}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
            Completed
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject & Level</th>
                <th>Student Names</th>
                {/* <th>Due Date</th> */}
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td>{`${assessment.subject} | ${assessment.level} `}</td>
                  <td>{assessment.student}</td>
                  {/* <td>{assessment.dueDate}</td> */}
                  <td>
                    <div className="progress-info">
                     <div>
                        {assessment.progress}/
                        {assessment.no_of_classes}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${assessment.status.toLowerCase().replace(' ', '')}`}>{assessment.status}</span>
                  </td>
                  <td>
                    {assessment.actions.map((action) => (
                       <button
                        key={`${assessment.id}-${action}`}
                        className={`action-view-btn ${
                          action === "Submited" ? "completed" : ""
                        }`}
                        onClick={
                          action === "View"
                            ? () => handleViewClick(assessment.id, assessment.student_id)
                            : undefined
                        }
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
          <h2>🎵 Weekly Music Assessment <span className="music-icon">🎼</span></h2>
          <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
        </div>
        <form onSubmit={handleFormSubmit} className="assessment-form">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <p className="question-text">🎼 {index + 1}. {question}</p>
              {index === 10 ? (
                <textarea
                  className="feedback-textarea"
                  value={formAnswers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Please share your feedback about the student..."
                  rows="4"
                  required
                />
              ) : (
                <div className="answer-options">
                  <label className="option-label yes-option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="Yes"
                      checked={formAnswers[index] === "Yes"}
                      onChange={() => handleAnswerChange(index, "Yes")}
                      required
                    />
                    <span className="option-text">Yes 👍</span>
                  </label>
                  <label className="option-label no-option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="No"
                      checked={formAnswers[index] === "No"}
                      onChange={() => handleAnswerChange(index, "No")}
                      required
                    />
                    <span className="option-text">No 👎</span>
                  </label>
                </div>
              )}
            </div>
          ))}
          <div className="form-actions">
            <button type="submit" className="submit-btn">🚀 Submit My Assessment!</button>
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
