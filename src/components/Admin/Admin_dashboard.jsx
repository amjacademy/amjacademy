"use client"

import { useEffect, useMemo, useState } from "react"
import "./Admin_dashboard.css"
import Footer from "../Footer/footer.jsx"

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

function IdTools({ value, onChange, students, teachers, role }) {
  const genId = () => {
    // Determine prefix based on role
    const prefix = role === "Student" ? "AMJS" : "AMJT"
    // Get all existing IDs for the current role
    const roleIds = (role === "Student" ? students : teachers).map(item => item.id)
    // Extract numbers from the format (AMJSXXXXX or AMJTXXXXX)
    const numbers = roleIds
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.slice(4), 10))
      .filter(num => !isNaN(num))

    // Find the next available number
    let nextNum = 1
    while (numbers.includes(nextNum)) {
      nextNum++
    }

    const id = `${prefix}${nextNum.toString().padStart(5, '0')}`
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
          <IdTools value={id} onChange={setId} students={students} teachers={teachers} role={role} />
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
  const [studentId, setStudentId] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [link, setLink] = useState("")
  const [error, setError] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!studentId || !teacherId || !date || !time || !link) {
      setError("Please fill Student, Teacher, Date, Time and Link.")
      return
    }
    const sched = {
      id: `${Date.now()}`,
      studentId,
      teacherId,
      when: `${date} ${time}`,
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
      time: `${date} at ${time}`,
      duration: "45 min", // Default duration
      batch: "Individual Batch", // Default batch
      level: "Beginner", // Default level
      contractId: studentId,
      plan: "Basic Plan", // Default plan
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
      time: `${date} at ${time}`,
      duration: "45 min", // Default duration
      ageOfStudent: student?.age || 0,
      batch: "Individual Batch", // Default batch
      level: "Beginner", // Default level
      contractId: studentId,
      plan: "Basic Plan", // Default plan
      image: "images/amj-logo.png",
      status: "upcoming",
    }
    teacherClasses.push(teacherClass)
    localStorage.setItem(`teacher_upcoming_classes_${teacherId}`, JSON.stringify(teacherClasses))

    setStudentId("")
    setTeacherId("")
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
          <label className="label">Select Teacher</label>
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

export default function Admin_Dashboard() {
  // Enrollment data
  const [students, setStudents] = useLocalStorage("admin_students", [])
  const [teachers, setTeachers] = useLocalStorage("admin_teachers", [])
  // Announcements
  const [announcements, setAnnouncements] = useLocalStorage("admin_announcements", [])
  // Schedules
  const [schedules, setSchedules] = useLocalStorage("admin_schedules", [])

  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Get username from localStorage
  const username = localStorage.getItem('admin_username') || 'Admin'

  // Get first and last letter of username
  const getInitials = (name) => {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return 'A'
    const firstLetter = trimmedName[0].toUpperCase()
    const lastLetter = trimmedName[trimmedName.length - 1].toUpperCase()
    return firstLetter + lastLetter
  }

  const initials = getInitials(username)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "enrollment", label: "User Enrollment", icon: "👥" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "class-arrangement", label: "Class Arrangement", icon: "📅" },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Derived counts
  const counts = {
    students: students.length,
    teachers: teachers.length,
    announcements: announcements.length,
    schedules: schedules.length,
  }

  const renderContent = () => {
    switch (activeTab) {
      case "enrollment":
        return (
          <EnrollmentModule
            students={students}
            setStudents={setStudents}
            teachers={teachers}
            setTeachers={setTeachers}
          />
        )
      case "announcements":
        return (
          <AnnouncementsModule announcements={announcements} setAnnouncements={setAnnouncements} />
        )
      case "class-arrangement":
        return (
          <ClassArrangementModule
            students={students}
            teachers={teachers}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        )
      case "dashboard":
      default:
        return (
          <>
            <div className="content-header1">
              <h1>DASHBOARD</h1>
            </div>
            <div className="stats-overview">
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
          </>
        )
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="logo">
            <img src="images/amj-logo.png" alt="AMJ Academy Logo" className="logo-image" />
            <span className="logo-text">AMJ Academy</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <a href="#" className="nav-link active" onClick={() => setActiveTab("dashboard")}>
              DASHBOARD
            </a>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              <span>{initials}</span>
            </div>
            <span className="user-name">{username}</span>
          </div>
          <button className="help-btn">NEED HELP?</button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            <div className="menu-items">
              {menuItems.map((item) => (
                <div key={item.id} className="nav-item-container">
                  <button
                    className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="logout-section">
              <div className="menu-separator"></div>
              <div className="nav-item-container">
                <button
                  className="nav-item logout-item"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <span className="nav-icon">🚪</span>
                  <span className="nav-label">Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">{renderContent()}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Footer */}
      <Footer />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={() => {
                localStorage.removeItem('admin_username');
                window.location.href = '/admin-login';
              }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
