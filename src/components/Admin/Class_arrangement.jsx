import { useState, useEffect } from "react";
import axios from "axios"; // make sure axios is installed
import "./Class_arrangement.css"

function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h4 className="empty-title">{title}</h4>
      <p className="empty-subtitle">{subtitle}</p>
    </div>
  )
}

export default function Class_arrangement({  schedules, setSchedules }) {
  const [batchType, setBatchType] = useState("individual")
  const [studentId, setStudentId] = useState("")
  const [secondStudentId, setSecondStudentId] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [day, setDay] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [hour, setHour] = useState("")
  const [minute, setMinute] = useState("")
  const [ampm, setAmpm] = useState("AM")
  const [link, setLink] = useState("")
  const [error, setError] = useState("")

  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])

useEffect(() => {
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/arrangements/getdetails"); 
      setSchedules(res.data);  // assume backend sends [{...}, {...}]
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };
  fetchSchedules();
}, []);
 // Fetch students and teachers from Supabase

useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/arrangements/fetchusers");
        console.log(data);
        setStudents(data.students);
        setTeachers(data.teachers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const convertTo24 = (h, m, ap) => {
    if (!h || !m) return ""
    let hh = parseInt(h)
    if (ap === "PM" && hh !== 12) hh += 12
    if (ap === "AM" && hh === 12) hh = 0
    return `${hh.toString().padStart(2,'0')}:${m.padStart(2,'0')}`
  }

const onSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const isDual = batchType === "dual";
  const time24 = convertTo24(hour, minute, ampm);

  if (!studentId || !teacherId || !day || !date || !time24 || !link || (isDual && !secondStudentId)) {
    setError("Please fill all required fields.");
    return;
  }

  const formatDbTime = (t) => t.slice(0,5); // '22:00:00' → '22:00'

const conflict = schedules.some((s) => {
  if (s.date === date && formatDbTime(s.time) === time24) {
    // Teacher conflict
    if (s.teacher_id === teacherId) return true;

    // Students conflict
    const existingStudents = s.batch_type === "dual"
      ? [s.student1_id, s.student2_id].filter(Boolean)
      : [s.student1_id];

    const newStudents = isDual
      ? [studentId, secondStudentId].filter(Boolean)
      : [studentId];

    // Any overlap?
    return existingStudents.some(id => newStudents.includes(id));
  }
  return false;
});


  if (conflict) {
    setError("Conflict: This student or teacher already has a schedule at the same time.");
    return;
  }

  const newSchedule = {
    batch_type: batchType,
    student1_id: studentId,
    student2_id: isDual ? secondStudentId : null,
    teacher_id: teacherId,
    day,
    date,
    time: time24,
    link
  };

  try {
    const res = await axios.post(
      "http://localhost:5000/api/arrangements/create",
      newSchedule
    );
    setSchedules([...schedules, res.data]);
    resetForm();
  } catch (err) {
    console.error("Error saving schedule:", err);
    setError("Failed to save schedule.");
  }
};


  const onDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/arrangements/delete/${id}`);
    setSchedules(schedules.filter(s => s.id !== id));
  } catch (err) {
    console.error("Error deleting schedule:", err);
  }
};


  const lookupStudentName = (id) => {
    const found = students.find((x) => x.id === id)
    return found?.name || id
  }

  const lookupTeacherName = (id) => {
    const found = teachers.find((x) => x.id === id)
    return found?.name || id
  }
const resetForm = () => {
  setBatchType("individual");
  setStudentId("");
  setSecondStudentId("");
  setTeacherId("");
  setDay("");
  setDate("");
  setTime("");
  setHour("");
  setMinute("");
  setAmpm("AM");
  setLink("");
};



  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>Class Arrangement</h3>
        </div>
      </header>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
  <label className="label">Batch Type</label>
  <select
    className="input"
    value={batchType}
    onChange={(e) => {
      setBatchType(e.target.value)
      setStudentId("")
      setSecondStudentId("")
    }}
  >
    <option value="individual">Individual</option>
    <option value="dual">Dual</option>
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
        .filter((s) => s.batchtype === "individual")
        .map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.id})
          </option>
        ))}
    </select>
    {students.filter((s) => s.batchtype === "individual").length === 0 && (
      <small className="hint">No individual students enrolled yet.</small>
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
          setStudentId(e.target.value)
          setSecondStudentId("")
        }}
      >
        <option value="">-- Choose First Student --</option>
        {students
          .filter((s) => s.batchtype === "dual")
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
          .filter((s) => s.batchtype === "dual" && s.id !== studentId)
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
        <div className="field">
          <label className="label">Date</label>
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
          <div className="time-inputs" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="number"
              className="input"
              min="1"
              max="12"
              placeholder="HH"
              value={hour}
              onChange={(e) => {
                const val = e.target.value
                if (/^\d*$/.test(val) && (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12))) {
                  setHour(val)
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
                const val = e.target.value
                if (/^\d*$/.test(val) && (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59))) {
                  setMinute(val)
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
          <button type="submit" className="btn btn-primary">
            Add to Schedule
          </button>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      <div className="table-wrap">
        {schedules.length === 0 ? (
          <EmptyState title="No scheduled classes" subtitle="Create a schedule using the form above." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Teacher</th>
                <th>When</th>
                <th>Link</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
  <td>
    {s.batch_type === "dual"
      ? `${lookupStudentName(s.student1_id)} & ${lookupStudentName(s.student2_id)}`
      : lookupStudentName(s.student1_id)}
  </td>
  <td>{lookupTeacherName(s.teacher_id)}</td>
  <td>{s.date} {s.time}</td>
  <td className="truncate">
    <a href={s.link} target="_blank" rel="noreferrer" className="link">
      {s.link}
    </a>
  </td>
  <td className="col-actions">
    <button className="btn btn-danger" onClick={() => onDelete(s.id)}>
      Delete
    </button>
  </td>
</tr>

              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
