import { useState } from "react"
import "./Class_arrangement.css"

function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h4 className="empty-title">{title}</h4>
      <p className="empty-subtitle">{subtitle}</p>
    </div>
  )
}

export default function Class_arrangement({ students, teachers, schedules, setSchedules }) {
  const [studentId, setStudentId] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [day, setDay] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [link, setLink] = useState("")
  const [error, setError] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!studentId || !teacherId || !day || !date || !time || !link) {
      setError("Please fill Student, Teacher, Day, Date, Time and Link.")
      return
    }
    const sched = {
      id: `${Date.now()}`,
      studentId,
      teacherId,
      when: `${day}, ${date} ${time}`,
      link,
      createdAt: new Date().toISOString(),
    }
    setSchedules([sched, ...schedules])

    // Add to student's upcoming classes
    const studentClasses = JSON.parse(localStorage.getItem(`student_upcoming_classes_${studentId}`) || '[]')
    const student = students.find(s => s.id === studentId)
    const teacher = teachers.find(t => t.id === teacherId)
    const studentClass = {
      id: sched.id,
      title: "Piano Lesson", // Default title, can be customized
      teachers: [teacher?.name || teacherId],
      time: `${day}, ${date} at ${time}`,
      duration: "45 min", // Default duration
      batch: student?.batchType === "individual" ? "Individual Batch" : "Dual Batch",
      level: student?.level || "1",
      contractId: studentId,
      plan: student?.plan || "Beginner",
      image: "images/amj-logo.png",
      status: "upcoming",
    }
    studentClasses.push(studentClass)
    localStorage.setItem(`student_upcoming_classes_${studentId}`, JSON.stringify(studentClasses))

    // Add to teacher's upcoming classes
    const teacherClasses = JSON.parse(localStorage.getItem(`teacher_upcoming_classes_${teacherId}`) || '[]')
    const teacherClass = {
      id: sched.id,
      title: "Piano Lesson", // Default title, can be customized
      students: [student?.name || studentId],
      time: `${day}, ${date} at ${time}`,
      duration: "45 min", // Default duration
      ageOfStudent: student?.age || 0,
      batch: student?.batchType === "individual" ? "Individual Batch" : "Dual Batch",
      level: student?.level || "1",
      contractId: studentId,
      plan: student?.plan || "Beginner",
      image: "images/amj-logo.png",
      status: "upcoming",
    }
    teacherClasses.push(teacherClass)
    localStorage.setItem(`teacher_upcoming_classes_${teacherId}`, JSON.stringify(teacherClasses))

    setStudentId("")
    setTeacherId("")
    setDay("")
    setDate("")
    setTime("")
    setLink("")
  }

  const onDelete = (id) => {
    const sched = schedules.find(s => s.id === id)
    if (sched) {
      // Remove from student's classes
      const studentClasses = JSON.parse(localStorage.getItem(`student_upcoming_classes_${sched.studentId}`) || '[]')
      const filteredStudentClasses = studentClasses.filter(c => c.id !== id)
      localStorage.setItem(`student_upcoming_classes_${sched.studentId}`, JSON.stringify(filteredStudentClasses))

      // Remove from teacher's classes
      const teacherClasses = JSON.parse(localStorage.getItem(`teacher_upcoming_classes_${sched.teacherId}`) || '[]')
      const filteredTeacherClasses = teacherClasses.filter(c => c.id !== id)
      localStorage.setItem(`teacher_upcoming_classes_${sched.teacherId}`, JSON.stringify(filteredTeacherClasses))
    }
    setSchedules(schedules.filter((x) => x.id !== id))
  }

  const lookupStudentName = (id) => {
    const found = students.find((x) => x.id === id)
    return found?.name || id
  }

  const lookupTeacherName = (id) => {
    const found = teachers.find((x) => x.id === id)
    return found?.name || id
  }

  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>Class Arrangement</h3>
        </div>
      </header>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">Select Student</label>
          <select
            className="input"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            aria-label="Select Student"
          >
            <option value="">-- Choose Student --</option>
            {students.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
          {students.length === 0 ? <small className="hint">No students enrolled yet.</small> : null}
        </div>
        <div className="field">
          <label className="label">Select Teachers</label>
          <select
            className="input"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            aria-label="Select Teacher"
          >
            <option value="">-- Choose Teacher --</option>
            {teachers.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
          {teachers.length === 0 ? <small className="hint">No teachers enrolled yet.</small> : null}
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
          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Time"
          />
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
                  <td>{lookupStudentName(s.studentId)}</td>
                  <td>{lookupTeacherName(s.teacherId)}</td>
                  <td>{s.when}</td>
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
