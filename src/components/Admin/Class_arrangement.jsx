import { useState, useEffect } from "react";
import axios from "axios"; // make sure axios is installed
import "./Class_arrangement.css";

function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h4 className="empty-title">{title}</h4>
      <p className="empty-subtitle">{subtitle}</p>
    </div>
  );
}

export default function Class_arrangement({ schedules, setSchedules }) {
  const [classType, setClassType] = useState("Piano");
  const [batchType, setBatchType] = useState("individual");
  const [studentId, setStudentId] = useState("");
  const [secondStudentId, setSecondStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [rescheduleChecked, setRescheduleChecked] = useState(false);
  const [scheduleFor, setScheduleFor] = useState("12");
  const [sessionDates, setSessionDates] = useState([""]);
  const [sessionForWeek, setSessionForWeek] = useState("1 day");
  const [secondDay, setSecondDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filter states
  const [studentFilter, setStudentFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Session mapping (1 day/week and 2 days/week)
  const sessionMap = {
    "1 day": [1, 4, 12, 24, 36],
    "2 days": [1, 8, 24, 48, 72],
  };

  // students / teachers lists
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // New states for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Utility helpers
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
    return targetDate.toISOString().split("T")[0];
  };

  const convertTo24 = (h, m, ap) => {
    if (!h || !m) return "";
    let hh = parseInt(h, 10);
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return `${hh.toString().padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  // Fetch schedules (initial)
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          "https://amjacademy-working.onrender.com/api/arrangements/getdetails",
          {
            withCredentials: true, // important to send cookies
          }
        );
        /* console.log("Fetched schedules:", res.data); */
        setSchedules(res.data); // assume backend sends [{...}, {...}]
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    fetchSchedules();
    // ensure scheduleFor sensible on mount
    if (!Object.values(sessionMap["1 day"]).map(String).includes(scheduleFor)) {
      setScheduleFor("12");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 useEffect(() => {
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        "https://amjacademy-working.onrender.com/api/arrangements/fetchusers",
        { withCredentials: true }
      );

       // 👈 Check what’s returned
      setStudents(data.students);
      setTeachers(data.teachers);
    } catch (err) {
      console.error("❌ Fetch users error:", err);
    }
  };
  fetchUsers();
}, []);


  // When sessionForWeek changes, update scheduleFor to a sensible default from sessionMap
  useEffect(() => {
    const options = sessionMap[sessionForWeek].map(String);
    if (!options.includes(scheduleFor)) {
      // choose a reasonable default: prefer 12 for 1-day, 24 for 2-days if available
      const preferred =
        sessionForWeek === "1 day"
          ? "12"
          : options.includes("24")
          ? "24"
          : options[0];
      setScheduleFor(preferred);
    }
    // Recompute end date if possible (below effect will handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionForWeek]);

  // Auto-calculate end date based on chosen days and schedule count
  useEffect(() => {
    // Need at least one chosen day
    const hasDay = sessionForWeek === "2 days" ? day && secondDay : day;
    if (!hasDay || !scheduleFor) return;

    const sessions = getSessions(scheduleFor);
    const daysPerWeek = sessionForWeek === "2 days" ? 2 : 1;

    // Determine earliest upcoming start date among chosen days (including today if same weekday)
    const today = new Date();
    const candidates = [day];
    if (sessionForWeek === "2 days") candidates.push(secondDay);

    // get the next occurrences (including today if same)
    const nextDates = candidates
      .filter(Boolean)
      .map((d) => getNextOccurrenceIncludingToday(today, d));

    // pick the earliest of nextDates as startDate
    let startDate = nextDates.reduce((a, b) => (a < b ? a : b), nextDates[0]);

    // total weeks needed (number of calendar weeks that will contain sessions)
    const totalWeeks = Math.ceil(sessions / daysPerWeek);

    // end date is startDate + (totalWeeks - 1) * 7 days, then we might need to adjust
    const computedEnd = new Date(startDate);
    computedEnd.setDate(computedEnd.getDate() + (totalWeeks - 1) * 7);

    // But computedEnd may fall on a different weekday than the last occurrence — that's fine:
    // we store the ISO date for the user as the "ending session date" (meaning the calendar week end).
    setDate(computedEnd.toISOString().split("T")[0]);
  }, [sessionForWeek, scheduleFor, day, secondDay]);

  // onSubmit: create schedules
  const onSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const isDual = batchType === "dual";

  if (
    !studentId ||
    !teacherId ||
    !day ||
    !date ||
    !hour ||
    !minute ||
    !ampm ||
    !link ||
    (isDual && !secondStudentId) ||
    (sessionForWeek === "2 days" && !secondDay)
  ) {
    setError("Please fill all required fields.");
    setLoading(false);
    return;
  }

  const convertTo24Local = (hourVal, minuteVal, ampmVal) => {
    let h = parseInt(hourVal, 10);
    if (ampmVal === "PM" && h !== 12) h += 12;
    if (ampmVal === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minuteVal
      .toString()
      .padStart(2, "0")}`;
  };
  const time24 = convertTo24Local(hour, minute, ampm);

  const sessions = getSessions(scheduleFor);
  const scheduleDates = [];

  const daysPerWeek = sessionForWeek === "2 days" ? 2 : 1;
  const totalWeeks = Math.ceil(sessions / daysPerWeek);

  const endDateObj = new Date(date);
  const startDateObj = new Date(endDateObj);
  startDateObj.setDate(endDateObj.getDate() - (totalWeeks - 1) * 7);

  const chosenDays = sessionForWeek === "2 days" ? [day, secondDay] : [day];

  for (let week = 0; week < totalWeeks; week++) {
    const weekBase = new Date(startDateObj);
    weekBase.setDate(startDateObj.getDate() + week * 7);

    for (const chosenDayName of chosenDays) {
      const scheduledDate = getDateForDay(
        weekBase.toISOString().split("T")[0],
        chosenDayName
      );
      scheduleDates.push({ date: scheduledDate, day: chosenDayName });
    }
  }

  const trimmedScheduleDates = scheduleDates.slice(0, sessions);

  const newStudents = isDual
    ? [studentId, secondStudentId].filter(Boolean)
    : [studentId];

  // --- ✅ Smart Conflict Check ---
  const conflict = trimmedScheduleDates.some(({ date: schedDate }) => {
    const localDateTimeStr = `${schedDate}T${time24}:00`;
    const newScheduleTime = new Date(localDateTimeStr).getTime();

    return schedules.some((s) => {
      const sameRecord = String(s.id) === String(editingId);

      // 🧩 Same batch = same teacher + student1 + end_date → ignore conflicts
      const sameBatch =
        String(s.teacher_id) === String(teacherId) &&
        String(s.student1_id) === String(studentId) &&
        s.end_date === date;

      if (sameRecord || sameBatch) return false;

      const existingTime = new Date(s.time).getTime();
      if (s.date === schedDate && existingTime === newScheduleTime) {
        // Same teacher, same time/date → conflict
        if (String(s.teacher_id) === String(teacherId)) return true;

        // Same student(s), same time/date → conflict
        const existingStudents =
          s.batch_type === "dual"
            ? [s.student1_id, s.student2_id].filter(Boolean).map(String)
            : [String(s.student1_id)];

        return existingStudents.some((id) =>
          newStudents.map(String).includes(id)
        );
      }

      return false;
    });
  });

  if (conflict) {
    setError("Conflict: This student or teacher already has a schedule at the same time.");
    setLoading(false);
    return;
  }

  const newSchedules = [];
  try {
    for (let i = 0; i < trimmedScheduleDates.length; i++) {
      const { date: schedDate, day: schedDay } = trimmedScheduleDates[i];
      const localDateTimeStr = `${schedDate}T${time24}:00`;
      const utcTime = new Date(localDateTimeStr).toISOString();

      const scheduleData = {
        subject: classType,
        batch_type: batchType,
        student1_id: studentId,
        student2_id: isDual ? secondStudentId : null,
        teacher_id: teacherId,
        day: schedDay,
        date: schedDate,
        time: utcTime,
        link,
        rescheduled: rescheduleChecked,
        no_of_sessions_week: sessionForWeek === "2 days" ? 2 : 1,
        no_of_sessions: sessions,
        first_day: day,
        second_day: sessionForWeek === "2 days" ? secondDay : null,
        end_date: date,
      };

      if (isEditing && i === 0) {
        const res = await axios.put(
          `https://amjacademy-working.onrender.com/api/arrangements/update/${editingId}`,
          scheduleData,
          { withCredentials: true }
        );
        newSchedules.push(res.data);
      } else if (!isEditing) {
        const res = await axios.post(
          "https://amjacademy-working.onrender.com/api/arrangements/create",
          scheduleData,
          { withCredentials: true }
        );
        newSchedules.push(res.data);
      }
    }

    if (isEditing) {
      setSchedules(
        schedules.map((s) => (s.id === editingId ? newSchedules[0] : s))
      );
    } else {
      setSchedules([...schedules, ...newSchedules]);
    }

    resetForm();
    setLoading(false);
  } catch (err) {
    console.error("Error saving schedule:", err);
    setError("Failed to save schedule.");
    setLoading(false);
  }
};


  const onDelete = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await axios.delete(
        `https://amjacademy-working.onrender.com/api/arrangements/delete/${id}`,
        {
          withCredentials: true, // important to send cookies
        }
      );
      setSchedules(schedules.filter((s) => s.id !== id));
      if (isEditing && editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting schedule:", err);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const onDeleteSelected = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    // Add all selected to deletingIds
    setDeletingIds((prev) => new Set([...prev, ...idsToDelete]));

    try {
      await Promise.all(
        idsToDelete.map((id) =>
          axios.delete(
            `https://amjacademy-working.onrender.com/api/arrangements/delete/${id}`,
            {
              withCredentials: true, // important to send cookies
            }
          )
        )
      );
      setSchedules(schedules.filter((s) => !idsToDelete.includes(s.id)));
      setSelectedIds(new Set());
      setIsSelecting(false);
      if (isEditing && idsToDelete.includes(editingId)) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting selected schedules:", err);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        idsToDelete.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === schedules.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(schedules.map((s) => s.id)));
    }
  };

const onEdit = async (schedule) => {
  try {
    setIsEditing(true);
    setEditingId(schedule.id);
    setLoading(true);

    // ✅ Fetch the original record from backend
    const res = await axios.get(
      `https://amjacademy-working.onrender.com/api/arrangements/get/${schedule.id}`,
      { withCredentials: true }
    );
    const fullRecord = res.data;

    // ✅ Load exact DB values into UI
    setBatchType(fullRecord.batch_type || "individual");
    setStudentId(fullRecord.student1_id || "");
    setSecondStudentId(fullRecord.student2_id || "");
    setTeacherId(fullRecord.teacher_id || "");
    setClassType(fullRecord.subject || "Keyboard");
    setDay(fullRecord.first_day || fullRecord.day || "");
    setSecondDay(fullRecord.second_day || "");
    setDate(fullRecord.end_date || fullRecord.date || "");

    // Handle time conversion from ISO
    const localTime = new Date(fullRecord.time);
    const hours = localTime.getHours();
    const minutes = localTime.getMinutes();
    const isPM = hours >= 12;
    const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinute = minutes.toString().padStart(2, "0");
    setHour(formattedHour.toString());
    setMinute(formattedMinute);
    setAmpm(isPM ? "PM" : "AM");

    setLink(fullRecord.link || "");
    setRescheduleChecked(fullRecord.rescheduled || false);

    // Restore session info
    setSessionForWeek(fullRecord.no_of_sessions_week === 2 ? "2 days" : "1 day");
    setScheduleFor(fullRecord.no_of_sessions?.toString() || "12");

    setError("");
  } catch (err) {
    console.error("❌ Error loading full record:", err);
    setError("Unable to load original data from database.");
  } finally {
    setLoading(false);
  }
};



  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setClassType("Piano");
    setBatchType("individual");
    setStudentId("");
    setSecondStudentId("");
    setTeacherId("");
    setDay("");
    setSecondDay("");
    setDate("");
    setTime("");
    setHour("");
    setMinute("");
    setAmpm("AM");
    setLink("");
    setError("");
    setRescheduleChecked(false);
    setSessionForWeek("1 day");
    // default scheduleFor keep 12 (as in your original) but ensure it's in map
    setScheduleFor("12");
  };

  const lookupStudentName = (id) => {
    const found = students.find((x) => x.id === id);
    return found?.name || id;
  };

  const lookupTeacherName = (id) => {
    const found = teachers.find((x) => x.id === id);
    return found?.name || id;
  };

  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>Class Arrangement</h3>
        </div>
        <div className="section-actions">
          <label>
            <input
              type="checkbox"
              checked={rescheduleChecked}
              onChange={(e) => setRescheduleChecked(e.target.checked)}
            />{" "}
            Reschedule Class
          </label>
        </div>
      </header>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">Class</label>
          <select
            className="input"
            value={classType}
            onChange={(e) => {
              setClassType(e.target.value);
              setStudentId("");
              setSecondStudentId("");
            }}
          >
            <option value="piano">Piano</option>
            <option value="keyboard">Keyboard</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Batch Type</label>
          <select
            className="input"
            value={batchType}
            onChange={(e) => {
              setBatchType(e.target.value);
              setStudentId("");
              setSecondStudentId("");
            }}
          >
            <option value="individual">Individual</option>
            <option value="dual">Dual</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Session for Week</label>
          <select
            className="input"
            value={sessionForWeek}
            onChange={(e) => setSessionForWeek(e.target.value)}
          >
            <option value="1 day">1 day</option>
            <option value="2 days">2 days</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Schedule for</label>
          <select
            className="input"
            value={scheduleFor}
            onChange={(e) => setScheduleFor(e.target.value)}
          >
            {sessionMap[sessionForWeek].map((num) => (
              <option key={num} value={num}>
                {num} sessions
              </option>
            ))}
          </select>
        </div>

        {batchType === "individual" && (
          <div className="field">
            <label className="label">Select Student</label>
            <select
              className="input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Choose Student --</option>
              {students
                .filter((s) => s.batch_type === "individual")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
            </select>
            {students.filter((s) => s.batch_type === "individual").length ===
              0 && (
              <small className="hint">
                No individual students enrolled yet.
              </small>
            )}
          </div>
        )}

        {batchType === "dual" && (
          <>
            <div className="field">
              <label className="label">Select First Student</label>
              <select
                className="input"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setSecondStudentId("");
                }}
              >
                <option value="">-- Choose First Student --</option>
                {students
                  .filter((s) => s.batch_type === "dual")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Select Second Student</label>
              <select
                className="input"
                value={secondStudentId}
                onChange={(e) => setSecondStudentId(e.target.value)}
              >
                <option value="">-- Choose Second Student --</option>
                {students
                  .filter((s) => s.batch_type === "dual" && s.id !== studentId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        <div className="field">
          <label className="label">Select Teacher</label>
          <select
            className="input"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value="">-- Choose Teacher --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.id})
              </option>
            ))}
          </select>
          {teachers.length === 0 && (
            <small className="hint">No teachers enrolled yet.</small>
          )}
        </div>

        <div className="field">
          <label className="label">Day</label>
          <select
            className="input"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            aria-label="Day"
          >
            <option value="">-- Choose Day --</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        {sessionForWeek === "2 days" && (
          <div className="field">
            <label className="label">Second Day</label>
            <select
              className="input"
              value={secondDay}
              onChange={(e) => setSecondDay(e.target.value)}
              aria-label="Second Day"
            >
              <option value="">-- Choose Second Day --</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        )}
        <div className="field">
          <label className="label">End Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
          />
        </div>
        <div className="field">
          <label className="label">Time</label>
          <div
            className="time-inputs"
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="number"
              className="input"
              min="1"
              max="12"
              placeholder="HH"
              value={hour}
              onChange={(e) => {
                const val = e.target.value;
                if (
                  /^\d*$/.test(val) &&
                  (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12))
                ) {
                  setHour(val);
                }
              }}
              aria-label="Hour"
              style={{ minWidth: "4rem", flex: "1 1 auto" }}
            />
            <span>:</span>
            <input
              type="number"
              className="input"
              min="0"
              max="59"
              placeholder="MM"
              value={minute}
              onChange={(e) => {
                const val = e.target.value;
                if (
                  /^\d*$/.test(val) &&
                  (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59))
                ) {
                  setMinute(val);
                }
              }}
              aria-label="Minute"
              style={{ minWidth: "4rem", flex: "1 1 auto" }}
            />
            <select
              className="input"
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              aria-label="AM/PM"
              style={{ minWidth: "5rem", flex: "0 0 auto" }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div className="field field--full">
          <label className="label">Class Link</label>
          <input
            className="input"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://meet.example.com/abc"
            aria-label="Class link"
          />
        </div>
        <div className="field form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Adding..."
              : isEditing
              ? "Update Schedule"
              : "Add to Schedule"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              style={{ marginLeft: "1rem" }}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      {/* Small hint / preview */}
      <div style={{ marginTop: 12 }}>
        <p className="hint">
          Selected: <strong>{sessionForWeek}</strong> per week →{" "}
          <strong>{scheduleFor}</strong> sessions. Ending (calculated) date:{" "}
          <strong>{date || "select day(s)"}</strong>
        </p>
      </div>

      {/* Select Button */}
      <div
        style={{
          marginTop: 12,
          marginBottom: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <button
          className={`btn ${isSelecting ? "btn-secondary" : "btn-primary"}`}
          onClick={() => setIsSelecting(!isSelecting)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            minWidth: "auto",
          }}
        >
          {isSelecting ? "Cancel" : "Select"}
        </button>
        {isSelecting && (
          <>
            <button
              className="btn btn-outline"
              onClick={selectAll}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                minWidth: "auto",
              }}
            >
              {selectedIds.size === schedules.length
                ? "Deselect All"
                : "Select All"}
            </button>
            {selectedIds.size > 0 && (
              <button
                className="btn btn-danger"
                onClick={onDeleteSelected}
                disabled={Array.from(selectedIds).some((id) =>
                  deletingIds.has(id)
                )}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  minWidth: "auto",
                }}
              >
                Delete ({selectedIds.size})
              </button>
            )}
          </>
        )}
      </div>

      {/* Filter Inputs */}
      <div
        style={{
          marginTop: 12,
          marginBottom: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search Student"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="input"
          style={{ minWidth: "150px", flex: "1 1 auto" }}
        />
        <input
          type="text"
          placeholder="Search Teacher"
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          className="input"
          style={{ minWidth: "150px", flex: "1 1 auto" }}
        />
        <input
          type="date"
          placeholder="Filter by Date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input"
          style={{ minWidth: "150px", flex: "1 1 auto" }}
        />
      </div>

      <div className="table-wrap">
        {schedules.length === 0 ? (
          <EmptyState
            title="No scheduled classes"
            subtitle="Create a schedule using the form above."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                {isSelecting && <th>Select</th>}
                <th>Student</th>
                <th>Teacher</th>
                <th>When</th>
                <th>Link</th>
                <th>Class</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...schedules]
                .filter((s) => {
  // Student filter
  const studentName =
    s.batch_type === "dual"
      ? `${lookupStudentName(s.student1_id)} & ${lookupStudentName(s.student2_id)}`
      : lookupStudentName(s.student1_id);

  if (
    studentFilter &&
    !studentName.toLowerCase().includes(studentFilter.toLowerCase())
  ) {
    return false;
  }

  // Teacher filter
  const teacherName = lookupTeacherName(s.teacher_id);
  if (
    teacherFilter &&
    !teacherName.toLowerCase().includes(teacherFilter.toLowerCase())
  ) {
    return false;
  }

  // ✅ Fixed Date filter for DATE + TIMESTAMPTZ combo
  if (dateFilter) {
    // Safely convert any format (ISO, plain date, timestamptz) into YYYY-MM-DD
    const scheduleDate = new Date(s.date).toISOString().split("T")[0];
    const filterDate = new Date(dateFilter).toISOString().split("T")[0];
    if (scheduleDate !== filterDate) {
      return false;
    }
  }

  // ✅ Show all by default (no subject/class filtering)
  return true;
})


                .sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  if (dateA.getTime() !== dateB.getTime()) {
                    return dateA - dateB;
                  }
                  const timeA = new Date(a.time);
                  const timeB = new Date(b.time);
                  return timeA - timeB;
                })
                .map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => isSelecting && toggleSelect(s.id)}
                    style={{ cursor: isSelecting ? "pointer" : "default" }}
                  >
                    {isSelecting && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          disabled={deletingIds.has(s.id)}
                        />
                      </td>
                    )}
                    <td>
                      {s.batch_type === "dual"
                        ? `${lookupStudentName(
                            s.student1_id
                          )} & ${lookupStudentName(s.student2_id)}`
                        : lookupStudentName(s.student1_id)}
                    </td>
                    <td>{lookupTeacherName(s.teacher_id)}</td>
                    <td>
                      {s.date}{" "}
                      {new Date(s.time).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>

                    <td className="truncate">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        {s.link}
                      </a>
                    </td>

                    <td>{s.subject || "Piano"}</td>

                    <td
                      className="col-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-primary"
                        onClick={() => onEdit(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(s.id)}
                        style={{ marginLeft: "0.5rem" }}
                        disabled={deletingIds.has(s.id)}
                      >
                        {deletingIds.has(s.id) ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
