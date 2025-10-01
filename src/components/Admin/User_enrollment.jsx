import { useEffect, useMemo, useState } from "react"
import "./User_enrollment.css"

function IdTools({ value, onChange, students, teachers, role }) {
  const [disabled, setDisabled] = useState(false)
  const [timer, setTimer] = useState(0)

  const genId = () => {
    if (disabled) return
    setDisabled(true)
    setTimer(30)
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

  useEffect(() => {
    if (timer === 0) {
      setDisabled(false)
      return
    }
    const interval = setInterval(() => {
      setTimer(t => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  return (
    <div className="id-tools">
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter or generate ID"
        aria-label="ID"
      />
      <button type="button" className="btn btn-secondary" onClick={genId} disabled={disabled}>
        Generate
      </button>
      {disabled && <div className="timer-text">{timer}s</div>}
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

function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h4 className="empty-title">{title}</h4>
      <p className="empty-subtitle">{subtitle}</p>
    </div>
  )
}

export default function User_enrollment({ students, setStudents, teachers, setTeachers }) {
  const [role, setRole] = useState("Student")
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [profession, setProfession] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [batchType, setBatchType] = useState("individual")
  const [plan, setPlan] = useState("Beginner")
  const [level, setLevel] = useState("1")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")

  const generatePassword = () => {
    if (!username) {
      alert("Generate username first")
      return
    }
    const maxLength = username.length
    const numberAllocation = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    let pwd = username + numberAllocation
    while (pwd.length < maxLength) {
      pwd += Math.floor(Math.random() * 10).toString()
    }
    setPassword(pwd)
  }

  const generateUsername = () => {
    if (!name.trim()) return
    let baseName = name.replace(/\s+/g, '') // Remove spaces from name
    baseName = baseName.substring(0, 8) // Limit to first 8 characters

    // Collect all usernames from students and teachers
    const allUsernames = [...students, ...teachers].map(item => item.username || '')

    // Filter usernames that start with baseName and extract numbers
    const usedNumbers = allUsernames
      .filter(u => u.startsWith(baseName))
      .map(u => {
        const match = u.match(new RegExp(`^${baseName}(\\d+)$`))
        return match ? parseInt(match[1], 10) : null
      })
      .filter(n => n !== null)

    // Find the next available number
    let number = 1
    while (usedNumbers.includes(number)) {
      number++
    }

    // Format number with leading zeros to 4 digits
    const formattedNumber = number.toString().padStart(4, '0')

    setUsername(baseName + formattedNumber)
  }

  useEffect(() => {
    generateUsername()
  }, [name])

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
    if (!id || !name || !age || !phone || !email || !password || !username || !batchType || !plan || !level) {
      setError("Please fill all required fields.")
      return
    }
    const exists = list.some((x) => x.id === id)
    if (exists) {
      setError("ID already exists in this module.")
      return
    }
    const newEntry = { id, name, age, profession, phone, email, image, password, username }
    if (role === "Student") {
      newEntry.batchType = batchType
      newEntry.plan = plan
      newEntry.level = level
    } else {
      newEntry.experienceLevel = experienceLevel
    }
    setList([newEntry, ...list])
    localStorage.setItem(`profile_${role.toLowerCase()}`, JSON.stringify(newEntry))
    setId("")
    setName("")
    setAge("")
    setProfession("")
    setPhone("")
    setEmail("")
    setImage("")
    setPassword("")
    setUsername("")
    setBatchType("individual")
    setPlan("Beginner")
    setLevel("1")
    setExperienceLevel("")
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
          <select
            className="input"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            aria-label="Profession"
          >
            <option value="">Select Profession</option>
            <option value="piano">Piano</option>
            <option value="keyboard">Keyboard</option>
          </select>
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
        <div className="field">
          <label className="label">Email Address</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            aria-label="Email"
            required
          />
        </div>
        <div className="field">
          <label className="label">Password</label>
          <div className="id-tools">
            <input
              className="input"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Generated password"
              aria-label="Password"
              required
            />
            <button type="button" className="btn btn-secondary" onClick={generatePassword}>
              Generate
            </button>
          </div>
        </div>
        <div className="field">
          <label className="label">Username</label>
          <div className="id-tools">
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Generated username"
              aria-label="Username"
              required
            />
            <button type="button" className="btn btn-secondary" onClick={generateUsername}>
              Generate
            </button>
          </div>
        </div>
        {role === "Student" ? (
          <>
            <div className="field">
              <label className="label">Batch Type</label>
              <select
                className="input"
                value={batchType}
                onChange={(e) => setBatchType(e.target.value)}
                aria-label="Batch Type"
              >
                <option value="individual">Individual</option>
                <option value="dual">Dual</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Basic Plan</label>
            <select
              className="input"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              aria-label="Basic Plan"
            >
              <option value="3 month">3 month</option>
              <option value="6 month">6 month</option>
              <option value="9 month">9 month</option>
            </select>
            </div>
            <div className="field">
              <label className="label">Level</label>
            <select
              className="input"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              aria-label="Level"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advance">Advance</option>
            </select>
            </div>
          </>
        ) : (
          <div className="field">
            <label className="label">Experience Level</label>
            <input
              className="input"
              type="text"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              placeholder="Enter experience level"
              aria-label="Experience Level"
            />
          </div>
        )}
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
