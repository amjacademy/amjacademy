import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "./Notification.jsx";
import GroupArrangement from "./group_arrangement.jsx";

const BASE = /* "http://localhost:5000" */"https://amjacademy-working.onrender.com";

/* ---------- Announcements ---------- */
function AnnouncementsTable({ onBack, preload = [] }) {
  const [announcements, setAnnouncements] = useState(preload);

  useEffect(() => {
    if (preload && preload.length) return; // already have data
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/announcements/receive`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    })();
  }, [preload]);

// ✅ Format timestamp in 24-hour format
const fmt = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);

  // Format: YYYY-MM-DD HH:mm (24h)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// ✅ Show created_at as start and end_time as end
const duration = (row) => {
  if (!row?.created_at && !row?.end_time) return "—";
  return `${fmt(row.created_at)} → ${fmt(row.end_time)}`;
};


  return (
    <div>
      <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Announcements Table</h2>
      <button onClick={onBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Receiver</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.message}</td>
                <td>{a.receiver}</td>
                <td>{duration(a)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------- Schedules ---------- */
function SchedulesTable({ schedules, onBack, onViewSchedule }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/arrangements/fetchusers`, {
          credentials: "include",
        });
        const data = await res.json();
        setStudents(data.students || []);
        setTeachers(data.teachers || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const lookupStudentName = (id) => {
    const found = students.find((x) => String(x.id) === String(id));
    return found?.name || id;
  };

  const lookupTeacherName = (id) => {
    const found = teachers.find((x) => String(x.id) === String(id));
    return found?.name || id;
  };

  return (
    <div>
      <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Schedules Table</h2>
      <button onClick={onBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
      {schedules.length === 0 ? (
        <p>No schedules available.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Teacher</th>
              <th>Subject</th>
              <th>Batch</th>
              <th>Date</th>
              <th>Time</th>
              <th>Link</th>
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
                <td>{s.subject || "—"}</td>
                <td>{s.batch_type === "dual" ? "Dual" : "Individual"}</td>
                <td>{s.date}</td>
                <td>
                  {new Date(s.time).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td>
                  {s.link ? (
                    <a href={s.link} target="_blank" rel="noreferrer">Join</a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------- Students ---------- */
function StudentsTable({ students, onBack, onView }) {
  return (
    <div>
      <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Students Table</h2>
      <button onClick={onBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
      {students.length === 0 ? (
        <p>No students available.</p>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((row, index) => (
              <tr key={row.id || `${row.name}-${index}`}>
                <td>
                 {row.image ? (
  <img src={row.image} alt={row.name} className="avatar-sm" />
) : (
  <div className="avatar-sm avatar-sm--placeholder" />
)}
                </td>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.profession || "—"}</td>
                <td>{row.age || "—"}</td>
                <td>{row.phone_number}</td>
                <td>
                  <button onClick={() => onView?.(row)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------- Teachers ---------- */
function TeachersTable({ teachers, onBack, onView }) {
  return (
    <div>
      <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Teachers Table</h2>
      <button onClick={onBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
      {teachers.length === 0 ? (
        <p>No teachers available.</p>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((row, index) => (
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
                <td>{row.phone}</td>
                <td>
                  <button onClick={() => onView?.(row)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------- Dashboard Shell ---------- */
export default function Dashboard({
  counts,
  schedules,
  onViewSchedule,
  onView,             // ✅ add this
  onViewGroups,
  preload = { students: [], teachers: [], announcements: [] },
}) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const [students, setStudents] = useState(preload.students || []);
  const [teachers, setTeachers] = useState(preload.teachers || []);
  const [announcements, setAnnouncements] = useState(preload.announcements || []);
  const [arrangements, setArrangements] = useState([]);
  const navigate = useNavigate();

  // ✅ View logic for student/teacher
  // ✅ Replace your handleView with this
const handleView = async (user) => {
  try {
    const res = await fetch(`${BASE}/api/enrollments/get/${user.id}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data && data.id) {
      // directly call parent handler to switch tab + pass user
      if (typeof onView === "function") {
        onView(data);
      }
    } else {
      alert("User data not found.");
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
  }
};


  const handleBack = () => setSelectedModule(null);

  return (
    <>
      {/* Overview cards */}
      <div className="stats-overview">
        <div className="stat" onClick={() => { setSelectedModule("students"); setShowNotificationMenu(false); }}>
          <span className="stat-num">{counts.students}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("teachers"); setShowNotificationMenu(false); }}>
          <span className="stat-num">{counts.teachers}</span>
          <span className="stat-label">Teachers</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("announcements"); setShowNotificationMenu(false); }}>
          <span className="stat-num">{counts.announcements}</span>
          <span className="stat-label">Announcements</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("schedules"); setShowNotificationMenu(false); }}>
          <span className="stat-num">{counts.schedules}</span>
          <span className="stat-label">Schedules</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("groups"); setShowNotificationMenu(false); }}>
          <span className="stat-num">{counts.groups}</span>
          <span className="stat-label">Groups</span>
        </div>
        <div
          className="stat"
          style={{ position: "relative", cursor: "pointer" }}
          onClick={() => setShowNotificationMenu(!showNotificationMenu)}
        >
          <span className="stat-num">{counts.notifications || 0}</span>
          <span className="stat-label">Notifications</span>
          {showNotificationMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                zIndex: 1000,
                minWidth: "150px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule("leave");
                  setShowNotificationMenu(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Leave
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule("last_minute_cancel");
                  setShowNotificationMenu(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Last Minute Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Module Sections */}
      {selectedModule === "students" && (
        <StudentsTable students={students} onBack={handleBack} onView={handleView} />
      )}
      {selectedModule === "teachers" && (
        <TeachersTable teachers={teachers} onBack={handleBack} onView={handleView} />
      )}
      {selectedModule === "announcements" && (
        <AnnouncementsTable onBack={handleBack} preload={announcements} />
      )}
      {selectedModule === "schedules" && (
        <SchedulesTable schedules={schedules} onBack={handleBack} onViewSchedule={onViewSchedule} />
      )}
      {selectedModule === "leave" && (
        <div>
          <button onClick={handleBack} className="btn btn-primary" style={{ marginBottom: "10px" }}>
            Back
          </button>
          <Notification userType="admin" filterKind="Leave Request" filterRole="student" />
        </div>
      )}
      {selectedModule === "last_minute_cancel" && (
        <div>
          <button onClick={handleBack} className="btn btn-primary" style={{ marginBottom: "10px" }}>
            Back
          </button>
          <Notification userType="admin" filterKind="Last Minute Cancellation" filterRole="student" />
        </div>
      )}
      {selectedModule === "groups" && (
        <div>
          <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Group Arrangement</h2>
          <button onClick={handleBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}>Back</button>
          <GroupArrangement />
        </div>
      )}
    </>
  );
}
