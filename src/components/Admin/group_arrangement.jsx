"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./group_arrangement.css"

const GroupArrangement = () => {
  const [arrangements, setArrangements] = useState([])
  const [formData, setFormData] = useState({
    groupName: "",
    students: [],
    classLink: "",
    teacherId: "",
    sessionForWeek: "1 day",
    scheduleFor: "12",
    day: "",
    secondDay: "",
    endDate: "",
    hour: "",
    minute: "",
    ampm: "AM",
  })
  const [studentInput, setStudentInput] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)

  // Filter states
  const [studentFilter, setStudentFilter] = useState("")

  const availableStudents = [
    { id: "AMJS0001", name: "Ajay Kumar" },
    { id: "AMJS0002", name: "Priya Singh" },
    { id: "AMJS0003", name: "Rahul Patel" },
    { id: "AMJS0004", name: "Neha Sharma" },
    { id: "AMJS0005", name: "Vikram Desai" },
    { id: "AMJS0006", name: "Ananya Gupta" },
    { id: "AMJS0007", name: "Rohan Verma" },
    { id: "AMJS0008", name: "Divya Nair" },
  ]

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Session mapping (1 day/week and 2 days/week)
  const sessionMap = {
    "1 day": [1, 4, 12, 24, 36],
    "2 days": [1, 8, 24, 48, 72],
  };

  // Utility helpers
  const getSessions = (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 1 : num;
  };

  const getNextOccurrence = (fromDate, dayName) => {
    // Returns a Date object for next occurrence (strictly in future) of dayName starting from fromDate
    const targetIndex = daysOfWeek.indexOf(dayName);
    const base = new Date(fromDate);
    const baseIndex = base.getDay();
    let diff = (targetIndex - baseIndex + 7) % 7;
    if (diff === 0) diff = 7; // next week if same day
    const result = new Date(base);
    result.setDate(base.getDate() + diff);
    return result;
  };

  const getNextOccurrenceIncludingToday = (fromDate, dayName) => {
    // Returns a Date object for next occurrence (including today if matches) of dayName
    const targetIndex = daysOfWeek.indexOf(dayName);
    const base = new Date(fromDate);
    const baseIndex = base.getDay();
    let diff = (targetIndex - baseIndex + 7) % 7;
    const result = new Date(base);
    result.setDate(base.getDate() + diff);
    return result;
  };

  const getDateForDay = (startDate, dayName) => {
    const start = new Date(startDate);
    const startDayIndex = start.getDay();
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    const diff = (targetDayIndex - startDayIndex + 7) % 7;
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const convertTo24 = (h, m, ap) => {
    if (!h || !m) return ""
    let hh = parseInt(h, 10)
    if (ap === "PM" && hh !== 12) hh += 12
    if (ap === "AM" && hh === 12) hh = 0
    return `${hh.toString().padStart(2,'0')}:${m.padStart(2,'0')}`
  }

  const generateScheduleSessions = () => {
    const sessions = []
    const sessionsCount = getSessions(formData.scheduleFor)
    const daysPerWeek = formData.sessionForWeek === "2 days" ? 2 : 1

    // Calculate startDate as the earliest upcoming date for the chosen days
    const today = new Date()
    const candidates = [formData.day]
    if (formData.sessionForWeek === "2 days") candidates.push(formData.secondDay)
    const nextDates = candidates
      .filter(Boolean)
      .map(d => getNextOccurrenceIncludingToday(today, d))
    const startDate = nextDates.reduce((a, b) => (a < b ? a : b), nextDates[0])

    for (let i = 0; i < sessionsCount; i++) {
      // Determine the day for this session
      let sessionDay
      if (formData.sessionForWeek === "1 day") {
        sessionDay = formData.day
      } else {
        // Alternate between day and secondDay
        sessionDay = i % 2 === 0 ? formData.day : formData.secondDay
      }

      // Calculate the week start for this session
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + Math.floor(i / daysPerWeek) * 7)

      // Find the date of sessionDay in that week
      const sessionDate = getDateForDay(weekStart.toISOString().split('T')[0], sessionDay)

      sessions.push({
        date: new Date(sessionDate).toLocaleDateString(),
        day: sessionDay,
        time: `${formData.hour}:${formData.minute} ${formData.ampm}`,
        sessionNumber: i + 1,
      })
    }

    return sessions
  }

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data } = await axios.get("https://amjacademy-working.onrender.com/api/arrangements/fetchusers");
        setTeachers(data.teachers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, []);

  // When sessionForWeek changes, update scheduleFor to a sensible default from sessionMap
  useEffect(() => {
    const options = sessionMap[formData.sessionForWeek].map(String);
    if (!options.includes(formData.scheduleFor)) {
      // choose a reasonable default: prefer 12 for 1-day, 24 for 2-days if available
      const preferred = formData.sessionForWeek === "1 day" ? "12" : (options.includes("24") ? "24" : options[0]);
      setFormData(prev => ({ ...prev, scheduleFor: preferred }));
    }
    // Recompute end date if possible (below effect will handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sessionForWeek]);

  // Auto-calculate end date based on chosen days and schedule count
  useEffect(() => {
    // Need at least one chosen day
    const hasDay = formData.sessionForWeek === "2 days" ? (formData.day && formData.secondDay) : formData.day;
    if (!hasDay || !formData.scheduleFor) return;

    const sessions = getSessions(formData.scheduleFor);
    const daysPerWeek = formData.sessionForWeek === "2 days" ? 2 : 1;

    // Determine earliest upcoming start date among chosen days (including today if same weekday)
    const today = new Date();
    const candidates = [formData.day];
    if (formData.sessionForWeek === "2 days") candidates.push(formData.secondDay);

    // get the next occurrences (including today if same)
    const nextDates = candidates
      .filter(Boolean)
      .map(d => getNextOccurrenceIncludingToday(today, d));

    // pick the earliest of nextDates as startDate
    let startDate = nextDates.reduce((a, b) => (a < b ? a : b), nextDates[0]);

    // total weeks needed (number of calendar weeks that will contain sessions)
    const totalWeeks = Math.ceil(sessions / daysPerWeek);

    // end date is startDate + (totalWeeks - 1) * 7 days, then we might need to adjust
    const computedEnd = new Date(startDate);
    computedEnd.setDate(computedEnd.getDate() + (totalWeeks - 1) * 7);

    // But computedEnd may fall on a different weekday than the last occurrence — that's fine:
    // we store the ISO date for the user as the "ending session date" (meaning the calendar week end).
    setFormData(prev => ({ ...prev, endDate: computedEnd.toISOString().split("T")[0] }));
  }, [formData.sessionForWeek, formData.scheduleFor, formData.day, formData.secondDay]);

  useEffect(() => {
    const saved = localStorage.getItem("groupArrangements")
    if (saved) {
      setArrangements(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("groupArrangements", JSON.stringify(arrangements))
  }, [arrangements])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (
      !formData.groupName ||
      formData.students.length === 0 ||
      !formData.classLink ||
      !formData.teacherId ||
      !formData.day ||
      !formData.hour ||
      !formData.minute
    ) {
      alert("Please fill all required fields")
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const generatedSessions = generateScheduleSessions()

    if (editingId) {
      setArrangements(
        arrangements.map((arr) =>
          arr.id === editingId
            ? {
                ...formData,
                sessions: generatedSessions,
                id: editingId,
                createdAt: arr.createdAt,
              }
            : arr,
        ),
      )
      setEditingId(null)
    } else {
      setArrangements([
        ...arrangements,
        {
          ...formData,
          sessions: generatedSessions,
          id: Date.now(),
          createdAt: new Date().toLocaleDateString(),
        },
      ])
    }

    setFormData({
      groupName: "",
      students: [],
      classLink: "",
      teacherId: "",
      sessionForWeek: "1 day",
      scheduleFor: "12",
      day: "",
      secondDay: "",
      endDate: "",
      hour: "",
      minute: "",
      ampm: "AM",
    })
    setShowForm(false)
    setLoading(false)
  }

  const handleEdit = (arrangement) => {
    setFormData(arrangement)
    setEditingId(arrangement.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this group arrangement?")) {
      setArrangements(arrangements.filter((arr) => arr.id !== id))
    }
  }

  const handleCancel = () => {
    setFormData({
      groupName: "",
      students: [],
      classLink: "",
      teacherId: "",
      sessionForWeek: "1 day",
      scheduleFor: "12",
      day: "",
      secondDay: "",
      endDate: "",
      hour: "",
      minute: "",
      ampm: "AM",
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="group-arrangement-container">
      <div className="content-header">
        <h1>GROUP ARRANGEMENT</h1>
      </div>

      {!showForm && (
        <button className="add-new-btn" onClick={() => setShowForm(true)}>
          + Add New Group
        </button>
      )}

      {showForm && (
        <div className="form-section">
          <div className="form-card">
            <h2>{editingId ? "Edit Group Arrangement" : "Create New Group Arrangement"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Piano Batch A"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Class Link *</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={formData.classLink}
                    onChange={(e) => setFormData({ ...formData, classLink: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sessions per Week *</label>
                  <select
                    value={formData.sessionForWeek}
                    onChange={(e) => setFormData({ ...formData, sessionForWeek: e.target.value })}
                    required
                  >
                    <option value="1 day">1 day</option>
                    <option value="2 days">2 days</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Search students by ID or name..."
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="student-filter-input"
                />
                <label>Add Students *</label>
                <div className="student-input-group">
                  <select
                    multiple
                    size="5"
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
                      setFormData({ ...formData, students: selectedOptions })
                    }}
                  >
                    {availableStudents
                      .filter((student) =>
                        student.id.toLowerCase().includes(studentFilter.toLowerCase()) ||
                        student.name.toLowerCase().includes(studentFilter.toLowerCase())
                      )
                      .map((student) => (
                        <option key={student.id} value={student.id} selected={formData.students.includes(student.id)}>
                          {student.id} - {student.name}
                        </option>
                      ))}
                  </select>
                </div>

                {formData.students.length > 0 && (
                  <div className="selected-students">
                    <p className="students-label">Selected Students ({formData.students.length}):</p>
                    <div className="student-tags">
                      {formData.students.map((studentId) => {
                        const student = availableStudents.find(s => s.id === studentId)
                        return (
                          <div key={studentId} className="student-tag">
                            <span>{student ? `${student.id} - ${student.name}` : studentId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  students: formData.students.filter((s) => s !== studentId),
                                })
                              }}
                              className="remove-tag"
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="schedule-section">
                <h3>Schedule Sessions</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Schedule For *</label>
                    <select
                      value={formData.scheduleFor}
                      onChange={(e) => setFormData({ ...formData, scheduleFor: e.target.value })}
                      required
                    >
                      {sessionMap[formData.sessionForWeek].map((num) => (
                        <option key={num} value={num.toString()}>
                          {num} sessions
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Day *</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      required
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.sessionForWeek === "2 days" && (
                    <div className="form-group">
                      <label>Second Day *</label>
                      <select
                        value={formData.secondDay}
                        onChange={(e) => setFormData({ ...formData, secondDay: e.target.value })}
                        required
                      >
                        <option value="">Select Second Day</option>
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Time *</label>
                    <div className="time-input-group">
                      <select
                        value={formData.hour}
                        onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                        required
                      >
                        <option value="">Hour</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h.toString().padStart(2, '0')}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        value={formData.minute}
                        onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                        required
                      >
                        <option value="">Minute</option>
                        {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                          <option key={m} value={m.toString().padStart(2, '0')}>
                            {m.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.ampm}
                        onChange={(e) => setFormData({ ...formData, ampm: e.target.value })}
                        required
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Processing..." : editingId ? "Update Group" : "Create Group"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="arrangements-list">
        {arrangements.length === 0 ? (
          <div className="empty-state">
            <p>No group arrangements yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="arrangements-grid">
            {arrangements.map((arrangement) => (
              <div key={arrangement.id} className="arrangement-card">
                <div className="card-header">
                  <h3>{arrangement.groupName}</h3>
                </div>

                <div className="card-content">
                  <div className="info-item">
                    <span className="label">Students:</span>
                    <span className="value">{arrangement.students.length} students</span>
                  </div>

                  <div className="students-list">
                    {arrangement.students.map((studentId) => {
                      const student = availableStudents.find(s => s.id === studentId)
                      return (
                        <div key={studentId} className="student-item">
                          👤 {student ? `${student.id} - ${student.name}` : studentId}
                        </div>
                      )
                    })}
                  </div>

                  <div className="info-item">
                    <span className="label">Class Link:</span>
                    <a href={arrangement.classLink} target="_blank" rel="noopener noreferrer" className="class-link">
                      Join Class →
                    </a>
                  </div>

                  <div className="schedule-info">
                    <h4>Schedule</h4>
                    <div className="info-item">
                      <span className="label">Sessions per Week:</span>
                      <span className="value">{arrangement.sessionForWeek}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Days:</span>
                      <span className="value">
                        {arrangement.sessionForWeek === "2 days"
                          ? `${arrangement.day}, ${arrangement.secondDay}`
                          : arrangement.day}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Time:</span>
                      <span className="value">{`${arrangement.hour}:${arrangement.minute} ${arrangement.ampm}`}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Total Sessions:</span>
                      <span className="value">{arrangement.sessions?.length || 0}</span>
                    </div>
                  </div>

                  {arrangement.sessions && arrangement.sessions.length > 0 && (
                    <div className="sessions-timeline">
                      <h4>Upcoming Sessions</h4>
                      <div className="sessions-list">
                        {arrangement.sessions.slice(0, 3).map((session) => (
                          <div key={session.sessionNumber} className="session-item">
                            <span className="session-date">{session.date}</span>
                            <span className="session-time">{session.time}</span>
                          </div>
                        ))}
                        {arrangement.sessions.length > 3 && (
                          <div className="session-item more">+{arrangement.sessions.length - 3} more sessions</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="info-item">
                    <span className="label">Created:</span>
                    <span className="value">{arrangement.createdAt}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEdit(arrangement)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(arrangement.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupArrangement
