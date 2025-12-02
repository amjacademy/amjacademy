"use client";

import { useState, useEffect } from "react";
import "./my-assignments.css";

const MyAssignments = () => {

  const MAIN=import.meta.env.VITE_MAIN;
  const TEST=import.meta.env.VITE_TEST;

  const [showForm, setShowForm] = useState(false);
  const [formAnswers, setFormAnswers] = useState({});
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
 const [assessments, setAssessments] = useState([]);

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
    "Did you feel more confident compared to last week's session?",
    "Your feedback about the teacher:",
  ];

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
      const userId = localStorage.getItem("user_id");

      const res = await fetch(
        `${MAIN}/api/assessments/user/${userId}`,
        { method: "GET", credentials: "include" }
      );

      const json = await res.json();

      if (json.success) {
        const formatted = json.data.map((a) => ({
          id: a.id,
          subject: a.subject.toLowerCase(),   // ensure lowercase
          level: a.level,
          teacher: a.teacher_name,
          teacher_id: a.teacher_id,
          // dueDate: a.due_date
          //   ? new Date(a.due_date).toDateString()
          //   : "No Due Date",
          progress: a.progress,
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


const handleViewClick = (assessmentId, teacherId) => {
    setCurrentAssessmentId(assessmentId);
    setCurrentTeacherId(teacherId);
    setShowForm(true);
};

const handleFormSubmit = async (e) => {
      e.preventDefault();
      const userId = localStorage.getItem("user_id");

      const res = await fetch(`${MAIN}/api/assessments/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: currentAssessmentId,
          user_id: userId,
          answers: formAnswers, // JSON sent as-is
          teacher_id: currentTeacherId,
        }),
        credentials: "include",
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error);
        return;
      }

      // Update UI
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === currentAssessmentId
            ? { ...a, status: "Completed", actions: ["Submited"] }
            : a
        )
      );

      setShowForm(false);
      setFormAnswers({});
      setCurrentAssessmentId(null);
  };

const handleAnswerChange = (questionIndex, answer) => {
      setFormAnswers((prev) => ({
        ...prev,
        [questionIndex]: answer,
      }));
};

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
                <th>Teacher Name</th>
                {/* <th>Due Date</th> */}
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td>{`${assessment.subject} | ${assessment.level}` }</td>
                  <td>{assessment.teacher}</td>
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
                            ? () => handleViewClick(assessment.id, assessment.teacher_id)
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
  );

  const renderForm = () => (
    <div className="assessment-form-overlay">
      <div className="assessment-form-container">
        <div className="form-header">
          <h2>
            🎵 Weekly Music Assessment <span className="music-icon">🎼</span>
          </h2>
          <button className="close-btn" onClick={() => setShowForm(false)}>
            ×
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="assessment-form">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <p className="question-text">
                🎼 {index + 1}. {question}
              </p>
              {index === 10 ? (
                <textarea
                  className="feedback-textarea"
                  value={formAnswers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Please share your feedback about the teacher..."
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
            <button type="submit" className="submit-btn">
              🚀 Submit My Assessment!
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="my-assignments-container">
      <div className="content-header3">
        <h1>MY ASSIGNMENTS</h1>
      </div>
      <div className="assignments-content">{renderAssessments()}</div>
      {showForm && renderForm()}
    </div>
  );
};

export default MyAssignments;
