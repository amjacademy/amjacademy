import React, { useEffect, useState } from "react";
import Notification from "./Notification.jsx";

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

  const fmt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  };

  const duration = (row) => {
    // your controller returns: { date, end_time }
    // We’ll format “date → end_time” nicely.
    if (!row?.date && !row?.end_time) return "—";
    return `${fmt(row.date)} → ${fmt(row.end_time)}`;
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
  onView,
  onViewSchedule,
  onViewGroups,
  preload = { students: [], teachers: [], announcements: [] },
}) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const [students, setStudents] = useState(preload.students || []);
  const [teachers, setTeachers] = useState(preload.teachers || []);
  const [announcements, setAnnouncements] = useState(preload.announcements || []);
  const [arrangements, setArrangements] = useState([]);

  // If user clicks students/teachers and we don’t yet have them, fetch
  useEffect(() => {
    if (selectedModule === "students" || selectedModule === "teachers") {
      if ((students?.length || 0) > 0 || (teachers?.length || 0) > 0) return;
      (async () => {
        try {
          const res = await fetch(`${BASE}/api/enrollments/getall`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          const studentsList = (enrollData || []).filter(
   (x) => (x.role || "").toLowerCase() === "student"
 );
 const teachersList = (enrollData || []).filter(
   (x) => (x.role || "").toLowerCase() === "teacher"
 );
          setStudents(studentsList);
          setTeachers(teachersList);
        } catch (err) {
          console.error("Error fetching enrollments:", err);
        }
      })();
    }
  }, [selectedModule, students, teachers]);

  // Announcements fallback (if user opens it first & parent didn’t preload)
  useEffect(() => {
    if (selectedModule === "announcements" && announcements.length === 0) {
      (async () => {
        try {
          const res = await fetch(`${BASE}/api/announcements/getall`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching announcements:", err);
        }
      })();
    }
  }, [selectedModule, announcements.length]);

  // Groups (local storage)
  useEffect(() => {
    if (selectedModule === "groups") {
      const saved = localStorage.getItem("groupArrangements");
      if (saved) setArrangements(JSON.parse(saved));
    }
  }, [selectedModule]);

  const handleBack = () => setSelectedModule(null);

  return (
    <>
      <div className="content-header1">
        <h1>DASHBOARD</h1>
      </div>
      <div className="stats-overview">
        <div className="stat" onClick={() => { setSelectedModule("students"); setShowNotificationMenu(false); }} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.students}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("teachers"); setShowNotificationMenu(false); }} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.teachers}</span>
          <span className="stat-label">Teachers</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("announcements"); setShowNotificationMenu(false); }} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.announcements}</span>
          <span className="stat-label">Announcements</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("schedules"); setShowNotificationMenu(false); }} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.schedules}</span>
          <span className="stat-label">Schedules</span>
        </div>
        <div className="stat" onClick={() => { setSelectedModule("groups"); setShowNotificationMenu(false); }} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.groups}</span>
          <span className="stat-label">Groups</span>
        </div>
        <div className="stat" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotificationMenu(!showNotificationMenu)}>
          <span className="stat-num">{counts.notifications || 0}</span>
          <span className="stat-label">Notifications</span>
          {showNotificationMenu && (
            <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 1000, minWidth: '150px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <button onClick={(e) => { e.stopPropagation(); setSelectedModule("leave"); setShowNotificationMenu(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>Leave</button>
              <button onClick={(e) => { e.stopPropagation(); setSelectedModule("last_minute_cancel"); setShowNotificationMenu(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>Last Minute Cancel</button>
            </div>
          )}
        </div>
      </div>

      {selectedModule === "students" && (
        <StudentsTable students={students} onBack={handleBack} onView={onView} />
      )}

      {selectedModule === "teachers" && (
        <TeachersTable teachers={teachers} onBack={handleBack} onView={onView} />
      )}

      {selectedModule === "announcements" && (
        <AnnouncementsTable onBack={handleBack} preload={announcements} />
      )}

      {selectedModule === "schedules" && (
        <SchedulesTable schedules={schedules} onBack={handleBack} onViewSchedule={onViewSchedule} />
      )}

      {selectedModule === "groups" && (
        <div>
          <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Groups Table</h2>
          <button onClick={handleBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
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
                      <div className="schedule-info">
                        <h4>Schedule</h4>
                        <div className="info-item">
                          <span className="label">Sessions per Week:</span>
                          <span className="value">{arrangement.sessionForWeek}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Days:</span>
                          <span className="value">
                            {arrangement.sessionForWeek === "2 days"
                              ? `${arrangement.day}, ${arrangement.secondDay}`
                              : arrangement.day}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Time:</span>
                          <span className="value">{`${arrangement.hour}:${arrangement.minute} ${arrangement.ampm}`}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Total Sessions:</span>
                          <span className="value">{arrangement.sessions?.length || 0}</span>
                        </div>
                      </div>
                      {arrangement.sessions && arrangement.sessions.length > 0 && (
                        <div className="sessions-timeline">
                          <h4>Upcoming Sessions</h4>
                          <div className="sessions-list">
                            {arrangement.sessions.slice(0, 3).map((session) => (
                              <div key={session.sessionNumber} className="session-item">
                                <span className="session-date">{session.date}</span>
                                <span className="session-time">{session.time}</span>
                              </div>
                            ))}
                            {arrangement.sessions.length > 3 && (
                              <div className="session-item more">+{arrangement.sessions - 3} more sessions</div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">Created:</span>
                        <span className="value">{arrangement.createdAt}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="edit-btn" onClick={onViewGroups}>✏️ Edit</button>
                      <button className="delete-btn" onClick={onViewGroups}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedModule === "leave" && (
        <div>
          <button onClick={handleBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>Back</button>
          <Notification userType="admin" filterKind="Leave Request" filterRole="student" />
        </div>
      )}

      {selectedModule === "last_minute_cancel" && (
        <div>
          <button onClick={handleBack} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>Back</button>
          <Notification userType="admin" filterKind="Last Minute Cancellation" filterRole="student" />
        </div>
      )}
    </>
  );
}
