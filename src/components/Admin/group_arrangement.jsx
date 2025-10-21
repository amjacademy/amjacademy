"use client"

import { useState, useEffect } from "react"
import "./group_arrangement.css"

const GroupArrangement = () => {
  const [arrangements, setArrangements] = useState([])
  const [formData, setFormData] = useState({
    groupName: "",
    students: [],
    classLink: "",
    classType: "common",
  })

  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sample student list
  const availableStudents = [
    "Ajay Kumar",
    "Priya Singh",
    "Rahul Patel",
    "Neha Sharma",
    "Vikram Desai",
    "Ananya Gupta",
    "Rohan Verma",
    "Divya Nair",
  ]

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("groupArrangements")
    if (saved) {
      setArrangements(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("groupArrangements", JSON.stringify(arrangements))
  }, [arrangements])



  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.groupName || formData.students.length === 0 || !formData.classLink) {
      alert("Please fill all fields and add at least one student")
      setLoading(false)
      return
    }

    // Simulate async operation (e.g., API call)
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingId) {
      setArrangements(
        arrangements.map((arr) =>
          arr.id === editingId ? { ...formData, id: editingId, createdAt: arr.createdAt } : arr,
        ),
      )
      setEditingId(null)
    } else {
      setArrangements([
        ...arrangements,
        {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toLocaleDateString(),
        },
      ])
    }

    setFormData({
      groupName: "",
      students: [],
      classLink: "",
      classType: "common",
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
      classType: "common",
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="group-arrangement-container">
      <div className="content-header">
        <h1>GROUP ARRANGEMENT</h1>
      </div>

      {/* Add New Button */}
      {!showForm && (
        <button className="add-new-btn" onClick={() => setShowForm(true)}>
          + Add New Group
        </button>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="form-section">
          <div className="form-card">
            <h2>{editingId ? "Edit Group Arrangement" : "Create New Group Arrangement"}</h2>

            <form onSubmit={handleSubmit}>
              {/* Group Name */}
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

              {/* Class Type */}
              <div className="form-group">
                <label>Class Type *</label>
                <select
                  value={formData.classType}
                  onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                >
                  <option value="common">Common</option>
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>

              {/* Class Link */}
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

              {/* Add Students */}
              <div className="form-group">
                <label>Add Students *</label>
                <div className="student-input-group">
                  <select multiple size="5" value={formData.students} onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, students: selectedOptions });
                  }}>
                    {availableStudents.map((student) => (
                      <option key={student} value={student}>
                        {student}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Students */}
                {formData.students.length > 0 && (
                  <div className="selected-students">
                    <p className="students-label">Selected Students ({formData.students.length}):</p>
                    <div className="student-tags">
                      {formData.students.map((student) => (
                        <div key={student} className="student-tag">
                          <span>{student}</span>
                          <button type="button" onClick={() => {
                            setFormData({
                              ...formData,
                              students: formData.students.filter((s) => s !== student),
                            })
                          }} className="remove-tag">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Processing..." : (editingId ? "Update Group" : "Create Group")}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Arrangements List */}
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
                  <span className="class-type-badge">{arrangement.classType}</span>
                </div>

                <div className="card-content">
                  <div className="info-item">
                    <span className="label">Students:</span>
                    <span className="value">{arrangement.students.length} students</span>
                  </div>

                  <div className="students-list">
                    {arrangement.students.map((student) => (
                      <div key={student} className="student-item">
                        👤 {student}
                      </div>
                    ))}
                  </div>

                  <div className="info-item">
                    <span className="label">Class Link:</span>
                    <a href={arrangement.classLink} target="_blank" rel="noopener noreferrer" className="class-link">
                      Join Class →
                    </a>
                  </div>

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
