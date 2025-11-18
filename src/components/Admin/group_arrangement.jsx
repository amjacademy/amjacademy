"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./group_arrangement.css";

const GroupArrangement = () => {

  const MAIN = "https://amjacademy-working.onrender.com";
  const TEST= "http://localhost:5000";

 // Set globally for all requests
 axios.defaults.withCredentials = true;
  const [arrangements, setArrangements] = useState([]);
  const [formData, setFormData] = useState({
    groupName: "",
    students: [],
    classLink: "",
    teacherId: "",
    teacherName: "",
    sessionForWeek: "1 day",
    scheduleFor: "12",
    day: "",
    secondDay: "",
    endDate: "",
    hour: "",
    minute: "",
    ampm: "AM",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [studentFilter, setStudentFilter] = useState("");

  // KEEPING your static list (no breaking changes)
  const [availableStudents, setAvailableStudents] = useState([]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const sessionMap = {
    "1 day": [1, 4, 12, 24, 36],
    "2 days": [1, 8, 24, 48, 72],
  };

  const getSessions = (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 1 : num;
  };

  const getNextOccurrenceIncludingToday = (fromDate, dayName) => {
    const idx = daysOfWeek.indexOf(dayName);
    const base = new Date(fromDate);
    const diff = (idx - base.getDay() + 7) % 7;
    const result = new Date(base);
    result.setDate(base.getDate() + diff);
    return result;
  };

  const getDateForDay = (startDate, dayName) => {
    const start = new Date(startDate);
    const target = new Date(start);
    const diff = (daysOfWeek.indexOf(dayName) - start.getDay() + 7) % 7;
    target.setDate(start.getDate() + diff);
    return target.toISOString().split("T")[0];
  };

  const generateScheduleSessions = () => {
    const sessions = [];
    const sessionsCount = getSessions(formData.scheduleFor);
    const daysPerWeek = formData.sessionForWeek === "2 days" ? 2 : 1;

    const today = new Date();
    const days = [formData.day];
    if (formData.sessionForWeek === "2 days") days.push(formData.secondDay);

    const nextDates = days.map((d) =>
      getNextOccurrenceIncludingToday(today, d)
    );
    const startDate = nextDates.reduce((a, b) => (a < b ? a : b));

    for (let i = 0; i < sessionsCount; i++) {
      const sessionDay =
        formData.sessionForWeek === "1 day"
          ? formData.day
          : i % 2 === 0
          ? formData.day
          : formData.secondDay;

      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + Math.floor(i / daysPerWeek) * 7);

      const sessionDate = getDateForDay(
        weekStart.toISOString().split("T")[0],
        sessionDay
      );

   sessions.push({
  date: sessionDate, // ISO yyyy-mm-dd
  displayDate: new Date(sessionDate).toLocaleDateString(),
  sessionNumber: i + 1,
  day: sessionDay,
});


    }

    return sessions;
  };
  // Auto-calculate endDate whenever sessionForWeek, scheduleFor, day, or secondDay changes
  useEffect(() => {
    const hasDay =
      formData.sessionForWeek === "2 days"
        ? formData.day && formData.secondDay
        : formData.day;
    if (!hasDay || !formData.scheduleFor) return;

    const sessions = getSessions(formData.scheduleFor);
    const daysPerWeek = formData.sessionForWeek === "2 days" ? 2 : 1;

    const today = new Date();
    const candidates = [formData.day];
    if (formData.sessionForWeek === "2 days")
      candidates.push(formData.secondDay);

    const nextDates = candidates
      .filter(Boolean)
      .map((d) => getNextOccurrenceIncludingToday(today, d));

    let startDate = nextDates.reduce((a, b) => (a < b ? a : b), nextDates[0]);

    const totalWeeks = Math.ceil(sessions / daysPerWeek);

    const computedEnd = new Date(startDate);
    computedEnd.setDate(computedEnd.getDate() + (totalWeeks - 1) * 7);

    setFormData((prev) => ({
      ...prev,
      endDate: computedEnd.toISOString().split("T")[0],
    }));
  }, [
    formData.sessionForWeek,
    formData.scheduleFor,
    formData.day,
    formData.secondDay,
  ]);


  // -------------------------
  // 🔗 FETCH TEACHERS (BACKEND)
  // -------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          `${MAIN}/api/grouparrangements/fetchusers`, {
  withCredentials: true
}
        );
        // set teachers and students from DB
        setTeachers(data.teachers || []);
        setAvailableStudents(data.students || []);
      } catch (err) {
        console.error("fetchUsers error:", err);
      }
    };
    fetchUsers();
  }, []);

  // -------------------------
  // 🔗 FETCH GROUPS (BACKEND)
  // -------------------------
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get(
          `${MAIN}/api/grouparrangements`, {
  withCredentials: true
}
        );
        setArrangements(data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    fetchGroups();
  }, []);

  // -------------------------
  // 🔗 SUBMIT FORM (CREATE / UPDATE)
  // -------------------------

  const convert12hto24h = (hour, minute, ampm) => {
  let h = parseInt(hour);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minute}`;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.groupName ||
      formData.students.length === 0 ||
      !formData.classLink
    ) {
      alert("Please fill all required fields");
      setLoading(false);
      return;
    }

    // Prepare timestamptz start time
    const jsTime = new Date(
      `2000-01-01 ${formData.hour}:${formData.minute} ${formData.ampm}`
    );
    const startTimeISO = jsTime.toISOString();

    const generatedSessions = generateScheduleSessions();

    const sessionPayload = generatedSessions.map((s) => {
  const isoDate = s.date; // already "YYYY-MM-DD"
  const time24 = convert12hto24h(formData.hour, formData.minute, formData.ampm);

  const sessionAt = new Date(`${isoDate}T${time24}:00`).toISOString();

  return {
    sessionNumber: s.sessionNumber,
    day: s.day,
    sessionAt,
  };
});

    const payload = {
      groupData: {
        group_name: formData.groupName,
        class_link: formData.classLink,
        teacher_id: formData.teacherId,
        teacher_name: formData.teacherName,
        session_for_week: formData.sessionForWeek,
        schedule_for: parseInt(formData.scheduleFor),
        day: formData.day,
        second_day: formData.secondDay || null,
        start_time: startTimeISO,
        end_date: formData.endDate,
      },
      students: formData.students,
      sessions: sessionPayload,
    };

    try {
      if (editingId) {
        await axios.put(
          `${MAIN}/api/grouparrangements/${editingId}`,
          payload, {
  withCredentials: true
}
        );
      } else {
        await axios.post(
          `${MAIN}/api/grouparrangements`,
          payload, {
  withCredentials: true
}
        );
      }

      const { data } = await axios.get(
        `${MAIN}/api/grouparrangements`, {
  withCredentials: true
}
      );
      setArrangements(data);
      /* console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2)); */

      alert("Saved successfully!");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error saving group");
    }

    setLoading(false);
    setShowForm(false);
  };

  // -------------------------
  // 🔗 DELETE GROUP
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;

    try {
      await axios.delete(`${MAIN}/api/grouparrangements/${id}`, {
  withCredentials: true
});
      const { data } = await axios.get(
        `${MAIN}/api/grouparrangements`, {
  withCredentials: true
}
      );
      setArrangements(data);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete");
    }
  };

  // Edit - unchanged
  const handleEdit = (arr) => {

  // Convert timestamptz → hour/min/ampm
  const dateObj = new Date(arr.start_time);
  let hour = dateObj.getHours();
  const minute = dateObj.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  hour = hour.toString().padStart(2, "0");

  setFormData({
    groupName: arr.group_name,
    classLink: arr.class_link,
    teacherId: arr.teacher_id,

    sessionForWeek: arr.session_for_week,
    scheduleFor: arr.schedule_for.toString(),

    day: arr.day,
    secondDay: arr.second_day || "",

    hour,
    minute,
    ampm,

    endDate: arr.end_date || "",
    students: arr.students || []
  });

  setEditingId(arr.id);
  setShowForm(true);
};


  // Cancel - unchanged
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
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="group-arrangement-container">
      {/* <div className="content-header">
        <h1>GROUP ARRANGEMENT</h1>
      </div> */}

      {!showForm && (
        <button className="add-new-btn" onClick={() => setShowForm(true)}>
          + Add New Group
        </button>
      )}

      {showForm && (
        <div className="form-section">
          <div className="form-card">
            <h2>
              {editingId
                ? "Edit Group Arrangement"
                : "Create New Group Arrangement"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Piano Batch A"
                    value={formData.groupName}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Class Link *</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={formData.classLink}
                    onChange={(e) =>
                      setFormData({ ...formData, classLink: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => {
                      const selectedOption = e.target.options[e.target.selectedIndex];
                      setFormData({
                        ...formData,
                        teacherId: selectedOption.value,
                        teacherName: selectedOption.getAttribute("data-name"),
                      });
                    }}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option 
                        key={teacher.id} 
                        value={teacher.id} 
                        data-name={teacher.name}
                      >
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sessions per Week *</label>
                  <select
                    value={formData.sessionForWeek}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sessionForWeek: e.target.value,
                      })
                    }
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
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (o) => o.value
                      );
                      setFormData({ ...formData, students: selected });
                    }}
                  >
                    {availableStudents
                      .filter(
                        (student) =>
                          student.id
                            .toLowerCase()
                            .includes(studentFilter.toLowerCase()) ||
                          student.name
                            .toLowerCase()
                            .includes(studentFilter.toLowerCase())
                      )
                      .map((student) => (
                        <option key={student.id} value={student.id}>

                          {student.id} - {student.name}
                        </option>
                      ))}
                  </select>
                </div>

                {formData.students.length > 0 && (
                  <div className="selected-students">
                    <p className="students-label">
                      Selected Students ({formData.students.length}):
                    </p>
                    <div className="student-tags">
                      {formData.students.map((studentId) => {
                        const student = availableStudents.find(
                          (s) => s.id === studentId
                        );
                        return (
                          <div key={studentId} className="student-tag">
                            <span>
                              {student
                                ? `${student.id} - ${student.name}`
                                : studentId}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  students: formData.students.filter(
                                    (s) => s !== studentId
                                  ),
                                })
                              }
                              className="remove-tag"
                            >
                              ×
                            </button>
                          </div>
                        );
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduleFor: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, day: e.target.value })
                      }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondDay: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, hour: e.target.value })
                        }
                        required
                      >
                        <option value="">Hour</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (h) => (
                            <option
                              key={h}
                              value={h.toString().padStart(2, "0")}
                            >
                              {h}
                            </option>
                          )
                        )}
                      </select>
                      <span>:</span>
                      <select
                        value={formData.minute}
                        onChange={(e) =>
                          setFormData({ ...formData, minute: e.target.value })
                        }
                        required
                      >
                        <option value="">Minute</option>
                        {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                          <option key={m} value={m.toString().padStart(2, "0")}>
                            {m.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.ampm}
                        onChange={(e) =>
                          setFormData({ ...formData, ampm: e.target.value })
                        }
                        required
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={formData.endDate} readOnly />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : editingId
                    ? "Update Group"
                    : "Create Group"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
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
            {arrangements.map((arr) => (
              <div key={arr.id} className="arrangement-card">
                <div className="card-header">
                  <h3>{arr.group_name}</h3>
                </div>

                <div className="card-content">
                  <div className="info-item">
                    <span className="label">Students:</span>
                    <span className="value">
                      {arr.students.length} students
                    </span>
                  </div>

                  <div className="students-list">
                    {arr.students.map((studentId) => {
                      const student = availableStudents.find(
                        (s) => s.id === studentId
                      );
                      return (
                        <div key={studentId} className="student-item">
                          👤{" "}
                          {student
                            ? `${student.id} - ${student.name}`
                            : studentId}
                        </div>
                      );
                    })}
                  </div>

                  <div className="info-item">
                    <span className="label">Class Link:</span>
                    <a
                      href={arr.class_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="class-link"
                    >
                      Join Class →
                    </a>
                  </div>

                  <div className="schedule-info">
                    <h4>Schedule</h4>
                    <div className="info-item">
                      <span className="label">Sessions per Week:</span>
                      <span className="value">{arr.session_for_week}</span>
                    </div>

                    <div className="info-item">
                      <span className="label">Days:</span>
                      <span className="value">
                        {arr.session_for_week === "2 days"
                          ? `${arr.day}, ${arr.second_day}`
                          : arr.day}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="label">Time:</span>
                      <span className="value">
                        {new Date(arr.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="label">Total Sessions:</span>
                      <span className="value">{arr.sessions?.length || 0}</span>
                    </div>
                  </div>

                  {arr.sessions && arr.sessions.length > 0 && (
                    <div className="sessions-timeline">
                      <h4>Upcoming Sessions</h4>
                      <div className="sessions-list">
                        {arr.sessions.slice(0, 3).map((session) => (
                          <div
                            key={session.session_number}
                            className="session-item"
                          >
                            <span className="session-date">
                              {new Date(
                                session.session_at
                              ).toLocaleDateString()}
                            </span>
                            <span className="session-time">
                              {new Date(session.session_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        ))}
                        {arr.sessions.length > 3 && (
                          <div className="session-item more">
                            +{arr.sessions.length - 3} more sessions
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="info-item">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(arr.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEdit({
                        ...arr,
                        groupName: arr.group_name,
                        classLink: arr.class_link,
                        teacherId: arr.teacher_id,
                        sessionForWeek: arr.session_for_week,
                        scheduleFor: arr.schedule_for,
                      })
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(arr.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupArrangement;
