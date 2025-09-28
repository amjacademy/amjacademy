"use client"

import { useEffect, useMemo, useState } from "react"
import "./Admin_dashboard.css"

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState]
}

const TabButton = ({ active, onClick, children }) => (
  <button type="button" className={`tab-btn ${active ? "tab-btn--active" : ""}`} onClick={onClick}>
    {children}
  </button>
)

const EmptyState = ({ title, subtitle }) => (
  <div className="empty-state" role="status" aria-live="polite">
    <h4 className="empty-title">{title}</h4>
    <p className="empty-subtitle">{subtitle}</p>
  </div>
)

function IdTools({ value, onChange }) {
  const genId = () => {
    const id = `${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    onChange(id)
  }
  return (
    <div className="id-tools">
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter or generate ID"
        aria-label="ID"
      />
      <button type="button" className="btn btn-secondary" onClick={genId}>
        Generate
      </button>
    </div>
  )
}

function ImagePicker({ value, onChange, label }) {
  const [preview, setPreview] = useState(value || "")
  useEffect(() => setPreview(value || ""), [value])

  const onFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(String(e.target?.result || ""))
      setPreview(String(e.target?.result || ""))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="image-picker">
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          aria-label="Profile image upload"
        />
        {preview ? (
          <img src={preview || "/placeholder.svg"} alt="Profile preview" className="avatar-preview" />
        ) : (
          <div className="avatar-placeholder" aria-hidden="true">
            No image
          </div>
        )}
      </div>
    </div>
  )
}

function EnrollmentModule({ students, setStudents, teachers, setTeachers }) {
  const [role, setRole] = useState("Student")
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [profession, setProfession] = useState("")
  const [phone, setPhone] = useState("")
  const [image, setImage] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")

  const list = role === "Student" ? students : teachers
  const setList = role === "Student" ? setStudents : setTeachers

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((x) =>
      [x.id, x.name, x.phone, x.profession].some((f) =>
        String(f || "")
          .toLowerCase()
          .includes(q),
      ),
    )
  }, [list, query])

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!id || !name || !age || !phone) {
      setError("Please fill ID, Name, Age, and Phone.")
      return
    }
    const exists = list.some((x) => x.id === id)
    if (exists) {
      setError("ID already exists in this module.")
      return
    }
    setList([{ id, name, age, profession, phone, image }, ...list])
    setId("")
    setName("")
    setAge("")
    setProfession("")
    setPhone("")
    setImage("")
  }

  const onDelete = (rid) => {
    setList(list.filter((x) => x.id !== rid))
  }

  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>User Enrollment</h3>
          <span className="badge">{role}</span>
        </div>
        <div className="role-switch">
          <label className={`switch ${role === "Student" ? "switch--active" : ""}`}>
            <input
              type="radio"
              name="role"
              checked={role === "Student"}
              onChange={() => setRole("Student")}
              aria-label="Student module"
            />
            Student
          </label>
          <label className={`switch ${role === "Teacher" ? "switch--active" : ""}`}>
            <input
              type="radio"
              name="role"
              checked={role === "Teacher"}
              onChange={() => setRole("Teacher")}
              aria-label="Teacher module"
            />
            Teacher
          </label>
        </div>
      </header>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">ID Creation</label>
          <IdTools value={id} onChange={setId} />
        </div>
        <div className="field">
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            aria-label="Name"
            required
          />
        </div>
        <div className="field">
          <label className="label">Age</label>
          <input
            className="input"
            type="number"
            min="1"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            aria-label="Age"
            required
          />
        </div>
        <div className="field">
          <label className="label">Profession</label>
          <input
            className="input"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder={role === "Student" ? "Grade / Interest" : "Subject / Expertise"}
            aria-label="Profession"
          />
        </div>
        <div className="field">
          <label className="label">Phone Number</label>
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +1 555 123 4567"
            aria-label="Phone number"
            required
          />
        </div>
        <ImagePicker value={image} onChange={setImage} label="Profile Image" />
        <div className="field form-actions">
          <button type="submit" className="btn btn-primary">
            Enroll
          </button>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      <div className="table-tools">
        <input
          className="input input--search"
          placeholder="Search by name, phone, profession, or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search enrolled"
        />
        <div className="count">
          Total: <strong>{list.length}</strong>
        </div>
      </div>

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <EmptyState title="No records yet" subtitle="Enroll the first person using the form above." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Profession</th>
                <th>Phone</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.image ? (
                      <img src={row.image || "/placeholder.svg"} alt={`${row.name} avatar`} className="avatar-sm" />
                    ) : (
                      <div className="avatar-sm avatar-sm--placeholder" aria-hidden="true" />
                    )}
                  </td>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.age}</td>
                  <td>{row.profession || "—"}</td>
                  <td>{row.phone}</td>
                  <td className="col-actions">
                    <button className="btn btn-danger" onClick={() => onDelete(row.id)}>
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

function AnnouncementsModule({ announcements, setAnnouncements }) {
  const [receiver, setReceiver] = useState("Students")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!title || !message) {
      setError("Please add a title and message for the announcement.")
      return
    }
    const item = {
      id: `${Date.now()}`,
      receiver,
      title,
      message,
      createdAt: new Date().toISOString(),
    }
    setAnnouncements([item, ...announcements])
    setTitle("")
    setMessage("")
  }

  const onDelete = (id) => {
    setAnnouncements(announcements.filter((x) => x.id !== id))
  }

  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>Announcements</h3>
          <span className="badge">{receiver}</span>
        </div>
      </header>

      <form className="form-grid annc-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">Receiver</label>
          <select
            className="input"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            aria-label="Announcement receiver"
          >
            <option>Students</option>
            <option>Teachers</option>
            <option>All</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            aria-label="Title"
            required
          />
        </div>
        <div className="field field--full">
          <label className="label">Message</label>
          <textarea
            className="input textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            aria-label="Message"
            required
          />
        </div>
        <div className="field form-actions">
          <button className="btn btn-primary" type="submit">
            Post Announcement
          </button>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      <div className="list">
        {announcements.length === 0 ? (
          <EmptyState title="No announcements" subtitle="Post your first announcement using the form above." />
        ) : (
          announcements.map((a) => (
            <article key={a.id} className="annc">
              <div className="annc-head">
                <h4 className="annc-title">{a.title}</h4>
                <span
                  className={`pill pill--${a.receiver === "Students" ? "blue" : a.receiver === "Teachers" ? "green" : "gray"}`}
                >
                  {a.receiver}
                </span>
              </div>
              <p className="annc-msg">{a.message}</p>
              <footer className="annc-foot">
                <time className="meta">{new Date(a.createdAt).toLocaleString()}</time>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(a.id)}>
                  Delete
                </button>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function ClassArrangementModule({ students, teachers, schedules, setSchedules }) {
  const [role, setRole] = useState("Student")
  const [personId, setPersonId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [link, setLink] = useState("")
  const [error, setError] = useState("")

  const people = role === "Student" ? students : teachers

  useEffect(() => {
    // reset selection when role changes
    setPersonId("")
  }, [role])

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!personId || !date || !time || !link) {
      setError("Please fill Person, Date, Time and Link.")
      return
    }
    const sched = {
      id: `${Date.now()}`,
      role,
      personId,
      when: `${date} ${time}`,
      link,
      createdAt: new Date().toISOString(),
    }
    setSchedules([sched, ...schedules])
    setPersonId("")
    setDate("")
    setTime("")
    setLink("")
  }

  const onDelete = (id) => {
    setSchedules(schedules.filter((x) => x.id !== id))
  }

  const lookupName = (id) => {
    const src = role === "Student" ? students : teachers
    const found = src.find((x) => x.id === id)
    return found?.name || id
  }

  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>Class Arrangement</h3>
          <span className="badge">{role}</span>
        </div>
        <div className="role-switch">
          <label className={`switch ${role === "Student" ? "switch--active" : ""}`}>
            <input
              type="radio"
              name="arr-role"
              checked={role === "Student"}
              onChange={() => setRole("Student")}
              aria-label="Student schedule"
            />
            Student
          </label>
          <label className={`switch ${role === "Teacher" ? "switch--active" : ""}`}>
            <input
              type="radio"
              name="arr-role"
              checked={role === "Teacher"}
              onChange={() => setRole("Teacher")}
              aria-label="Teacher schedule"
            />
            Teacher
          </label>
        </div>
      </header>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">Select {role}</label>
          <select
            className="input"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            aria-label={`Select ${role}`}
          >
            <option value="">-- Choose --</option>
            {people.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
          {people.length === 0 ? <small className="hint">No {role.toLowerCase()}s enrolled yet.</small> : null}
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
                <th>Role</th>
                <th>Person</th>
                <th>When</th>
                <th>Link</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>{s.role}</td>
                  <td>
                    {(s.role === "Student" ? students : teachers).find((p) => p.id === s.personId)?.name || s.personId}
                  </td>
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

export default function Admin_Dashboard() {
  // Enrollment data
  const [students, setStudents] = useLocalStorage("admin_students", [])
  const [teachers, setTeachers] = useLocalStorage("admin_teachers", [])
  // Announcements
  const [announcements, setAnnouncements] = useLocalStorage("admin_announcements", [])
  // Schedules
  const [schedules, setSchedules] = useLocalStorage("admin_schedules", [])

  const [active, setActive] = useState("Enrollment")

  // Derived counts
  const counts = {
    students: students.length,
    teachers: teachers.length,
    announcements: announcements.length,
    schedules: schedules.length,
  }

  return (
    <main className="admin-wrap">
      <header className="admin-header">
        <h2 className="title text-balance">Admin Dashboard</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-num">{counts.students}</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat">
            <span className="stat-num">{counts.teachers}</span>
            <span className="stat-label">Teachers</span>
          </div>
          <div className="stat">
            <span className="stat-num">{counts.announcements}</span>
            <span className="stat-label">Announcements</span>
          </div>
          <div className="stat">
            <span className="stat-num">{counts.schedules}</span>
            <span className="stat-label">Schedules</span>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Admin sections">
        <TabButton active={active === "Enrollment"} onClick={() => setActive("Enrollment")}>
          User Enrollment
        </TabButton>
        <TabButton active={active === "Announcements"} onClick={() => setActive("Announcements")}>
          Announcements
        </TabButton>
        <TabButton active={active === "Class"} onClick={() => setActive("Class")}>
          Class Arrangement
        </TabButton>
      </nav>

      <div className="sections">
        {active === "Enrollment" && (
          <EnrollmentModule
            students={students}
            setStudents={setStudents}
            teachers={teachers}
            setTeachers={setTeachers}
          />
        )}
        {active === "Announcements" && (
          <AnnouncementsModule announcements={announcements} setAnnouncements={setAnnouncements} />
        )}
        {active === "Class" && (
          <ClassArrangementModule
            students={students}
            teachers={teachers}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        )}
      </div>
    </main>
  )
}
