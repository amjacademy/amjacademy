import { useEffect, useMemo, useState } from "react"
import "./User_enrollment.css"

function IdTools({ value, onChange, students, teachers, role, setStudents, setTeachers  }) {
  const [disabled, setDisabled] = useState(false)
  const [timer, setTimer] = useState(0)
const fetchEnrollments = async () => {
  try {
    const res = await fetch("https://amjacademy-working.onrender.com/api/enrollments/getall", {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) {
      console.error("Failed to fetch enrollments:", res.status);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Enrollments data is not an array:", data);
      return;
    }

    const studentsList = data.filter(item => item.role === "student");
    const teachersList = data.filter(item => item.role === "teacher");

    setStudents(studentsList);
    setTeachers(teachersList);

  } catch (err) {
    console.error("Error fetching enrollments:", err);
  }
};

useEffect(() => {
  fetchEnrollments();
}, []);

  const genId = () => {
    if (disabled) return
    setDisabled(true)
    setTimer(30)
    // Determine prefix based on role
    const prefix = role === "student" ? "AMJS" : "AMJT"
    // Get all existing IDs for the current role
    const roleIds = (role === "student" ? students : teachers).map(item => item.id)
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
   const [preview, setPreview] = useState(value || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => setPreview(value || ""), [value]);

  const onFile = async (file) => {
    if (!file) return;

    // Show local preview while uploading
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to server -> Cloudinary
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://amjacademy-working.onrender.com/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) {
        setPreview(data.url); // Cloudinary URL preview
        onChange(data.url);   // Update parent state with Cloudinary URL
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
        />
        {loading ? (
          <div className="avatar-placeholder" aria-hidden="true">
            Uploading...
          </div>
        ) : preview ? (
          <img src={preview} alt="Profile preview" className="avatar-preview" />
        ) : (
          <div className="avatar-placeholder" aria-hidden="true">
            No image
          </div>
        )}
      </div>
    </div>
  );
}


function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h4 className="empty-title">{title}</h4>
      <p className="empty-subtitle">{subtitle}</p>
    </div>
  )
}

export default function User_enrollment({ students, setStudents, teachers, setTeachers, editingRow }) {
  // If editingRow is passed, populate the form
  useEffect(() => {
    if (editingRow) {
      setEditingId(editingRow.id);
      setId(editingRow.id);
      setName(editingRow.name);
      setAge(editingRow.age);
      setProfession(editingRow.profession);
      setPhone(editingRow.phone || editingRow.phone_number);
      setEmail(editingRow.email);
      setAdditionalEmail(editingRow.additionalEmail || editingRow.additional_email || "");
      setImage(editingRow.image);
      setPassword(editingRow.password);
      setUsername(editingRow.username);
      setBatchType(editingRow.batchtype || "individual");
      setPlan(editingRow.plan || "3month");
      setLevel(editingRow.level || "Beginner");
      setExperienceLevel(editingRow.experiencelevel || "");
      setRole(editingRow.role);
    }
  }, [editingRow]);
  const [role, setRole] = useState("student")
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [profession, setProfession] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [additionalEmail, setAdditionalEmail] = useState("")
  const [image, setImage] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [batchType, setBatchType] = useState("individual")
  const [plan, setPlan] = useState("3month")
  const [level, setLevel] = useState("Beginner")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState(null)

  const generatePassword = () => {
    if (!username) {
      alert("Generate username first")
      return
    }
    const firstFour = username.substring(0, 4)
    const pwd = "123@" + firstFour
    setPassword(pwd)
  }

  const generateUsername = () => {
    if (!name.trim()) return
    let baseName = name.replace(/\s+/g, '') // Remove spaces from name
    baseName = baseName.substring(0, 8) // Limit to first 8 characters
    baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase() // Capitalize first letter, lowercase rest

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
    if (!editingId) {
      generateUsername()
    }
  }, [name, editingId])

  // Clear form fields when role changes, but only if not editing
  useEffect(() => {
    if (!editingId) {
      resetForm();
    }
  }, [role])

  const list = role === "student" ? students : teachers
  const setList = role === "student" ? setStudents : setTeachers

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

 const onSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validation
  if (!id || !name || !age || !phone || !email || !password || !username || (!batchType && role === "student") || (!plan && role === "student") || (!level && role === "student") || (role === "teacher" && !experienceLevel)) {
    setError("Please fill all required fields.");
    return;
  }

  if (editingId) {
    // Update existing entry
    const updateData = {
      role,
      name,
      age,
      profession,
      phone,
      email,
      additionalEmail,
      image,
      password,
      username,
      batchtype: role === "student" ? batchType : null,
      plan: role === "student" ? plan : null,
      level: role === "student" ? level : null,
      experiencelevel: role === "teacher" ? experienceLevel : null
    };

    try {
      const response = await fetch(`https://amjacademy-working.onrender.com/api/enrollments/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include"
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

     const updatedUser = data.updatedUser;

    if (!updatedUser) {
      console.warn("⚠️ No updated record returned from backend");
      return;
    }

    // ✅ Update existing record in list
    setList(prevList =>
      prevList.map(item => (item.id === editingId ? { ...item, ...updatedUser } : item))
    );

    console.log("✅ Updated successfully:", updatedUser);

    // Reset form
    resetForm();

    } catch (error) {
      console.error(error);
      setError("Failed to update. Try again.");
    }
  } else {
    // Create new entry
    const exists = list.some((x) => x.id === id);
    if (exists) {
      setError("ID already exists in this module.");
      return;
    }

    const newEntry = {
      id,
      role,
      name,
      age,
      profession,
      phone,
      email,
      additionalEmail,
      image,
      password,
      username,
      batchtype: role === "student" ? batchType : null,
      plan: role === "student" ? plan : null,
      level: role === "student" ? level : null,
      experiencelevel: role === "teacher" ? experienceLevel : null
    };

    try {
      const response = await fetch("https://amjacademy-working.onrender.com/api/enrollments/addusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
        credentials: "include"
      });

      const data = await response.json();
      console.log("Server response:", data);
      if (!response.ok) {
  // Use data.message safely (it’s a string now)
  setError(data.message || "Something went wrong");
  return;
}
// ✅ data.user is the actual user record returned
if (data.success && data.user) {
  setList(prevList => [data.user, ...prevList]);
} else {
  // If no record returned, still handle gracefully
  console.warn("No user record returned from server");
}
resetForm();

    } catch (err) {
  console.error("Error submitting enrollment:", err);
  alert("Server error. Please try again.");
}
  }
};

const resetForm = () => {
  setId(""); setName(""); setAge(""); setProfession(""); setPhone("");
  setEmail(""); setAdditionalEmail(""); setImage(""); setPassword(""); setUsername("");
  setBatchType("individual"); setPlan("3month"); setLevel("Beginner");
  setExperienceLevel(""); setEditingId(null);
};

const onEdit = (row) => {
  setEditingId(row.id);
  setId(row.id);
  setName(row.name);
  setAge(row.age);
  setProfession(row.profession);
  setPhone(row.phone || row.phone_number );
  setEmail(row.email);
  setAdditionalEmail(row.additionalEmail || row.additional_email || "");
  setImage(row.image);
  setPassword(row.password);
  setUsername(row.username);
  setBatchType(row.batchtype || "individual");
  setPlan(row.plan || "3month");
  setLevel(row.level || "Beginner");
  setExperienceLevel(row.experiencelevel || "");
  setRole(row.role);
};

const onDelete = async (id) => {
  try {
    const response = await fetch(`https://amjacademy-working.onrender.com/api/enrollments/delete/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    // Update state
    if (role === "student") {
      setStudents(students.filter(s => s.id !== id));
    } else if (role === "teacher") {
      setTeachers(teachers.filter(t => t.id !== id));
    }

    setList(list.filter((x) => x.id !== id));

  } catch (err) {
    console.error("Error deleting:", err);
  }
};


  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>User Enrollment</h3>
          <span className="badge">{role}</span>
        </div>
        <div className="role-switch">
          <label className={`switch ${role === "student" ? "switch--active" : ""}`}>
            <input
              type="radio"
              name="role"
              checked={role === "student"}
              onChange={() => setRole("student")}
              aria-label="Student module"
            />
            Student
          </label>
          <label className={`switch ${role === "teacher" ? "switch--active" : ""}`}>
            <input
              type="radio"
              name="role"
              checked={role === "teacher"}
              onChange={() => setRole("teacher")}
              aria-label="Teacher module"
            />
            Teacher
          </label>
        </div>
      </header>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">ID Creation</label>
<IdTools
  value={id}
  onChange={setId}
  students={students}
  teachers={teachers}
  role={role}
  setStudents={setStudents}
  setTeachers={setTeachers}
/>
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
          <label className="label">Additional Email Address</label>
          <input
            className="input"
            type="email"
            value={additionalEmail}
            onChange={(e) => setAdditionalEmail(e.target.value)}
            placeholder="Enter additional email address"
            aria-label="Additional Email"
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
        {role === "student" ? (
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
              <option value="3month">3 month</option>
              <option value="6month">6 month</option>
              <option value="9month">9 month</option>
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
            {editingId ? "Update" : "Enroll"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
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
  {filtered.map((row, index) => (
    <tr key={row.id || `${row.name}-${index}`}>
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
      <td>{row.phone_number}</td>
      <td className="col-actions">
        <button className="btn btn-secondary" onClick={() => onEdit(row)}>
          Edit
        </button>
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
