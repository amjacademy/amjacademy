import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import User_enrollment from "./User_enrollment.jsx";
import Notification from "./Notification.jsx";

function AnnouncementsTable({ onBack }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("https://amjacademy-working.onrender.com/api/announcements/getall", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };
    fetchAnnouncements();
  }, []);

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
                <td>{a.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SchedulesTable({ schedules, onBack, onViewSchedule }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://amjacademy-working.onrender.com/api/arrangements/fetchusers");
        const data = await res.json();
        setStudents(data.students);
        setTeachers(data.teachers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const lookupStudentName = (id) => {
    const found = students.find((x) => x.id === id);
    return found?.name || id;
  };

  const lookupTeacherName = (id) => {
    const found = teachers.find((x) => x.id === id);
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
              <th>Class Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Actions</th>
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
                  <button onClick={() => onViewSchedule(s)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

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
                  <button onClick={() => onView(row)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

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
                  <button onClick={() => onView(row)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Dashboard({ counts, schedules, onView, onViewSchedule }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // State for students and teachers data to pass to User_enrollment
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch students and teachers data when needed
  useEffect(() => {
    if (selectedModule === "students" || selectedModule === "teachers") {
      const fetchEnrollments = async () => {
        try {
          const res = await fetch("https://amjacademy-working.onrender.com/api/enrollments/getall", {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          const studentsList = data.filter(item => item.role === "Student");
          const teachersList = data.filter(item => item.role === "Teacher");
          setStudents(studentsList);
          setTeachers(teachersList);
        } catch (err) {
          console.error("Error fetching enrollments:", err);
        }
      };
      fetchEnrollments();
    }
  }, [selectedModule]);

  const handleBack = () => {
    setSelectedModule(null);
  };

  const handleView = (row) => {
    if (onView) {
      onView(row);
    }
  };

  return (
    <>
      <div className="content-header1">
        <h1>DASHBOARD</h1>
      </div>
      <div className="stats-overview">
        <div className="stat" onClick={() => setSelectedModule("students")} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.students}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat" onClick={() => setSelectedModule("teachers")} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.teachers}</span>
          <span className="stat-label">Teachers</span>
        </div>
        <div className="stat" onClick={() => setSelectedModule("announcements")} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.announcements}</span>
          <span className="stat-label">Announcements</span>
        </div>
        <div className="stat" onClick={() => setSelectedModule("schedules")} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.schedules}</span>
          <span className="stat-label">Schedules</span>
        </div>
        <div className="stat" onClick={() => setSelectedModule("groups")} style={{ cursor: "pointer" }}>
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
        <StudentsTable students={students} onBack={() => setSelectedModule(null)} onView={handleView} />
      )}

      {selectedModule === "teachers" && (
        <TeachersTable teachers={teachers} onBack={() => setSelectedModule(null)} onView={handleView} />
      )}



      {selectedModule === "announcements" && (
        <AnnouncementsTable onBack={() => setSelectedModule(null)} />
      )}

      {selectedModule === "schedules" && (
        <SchedulesTable schedules={schedules} onBack={() => setSelectedModule(null)} onViewSchedule={onViewSchedule} />
      )}

      {selectedModule === "groups" && (
        <div>
          <h2 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 242, 254, 0.18)', textAlign: 'center', fontSize: '1.5em', fontWeight: '600', marginBottom: '20px' }}>Groups Table</h2>
          <button onClick={() => setSelectedModule(null)} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
          <p>Groups functionality will be implemented here.</p>
        </div>
      )}

      {selectedModule === "leave" && (
        <div>
          <button onClick={() => setSelectedModule(null)} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>Back</button>
          <Notification userType="admin" filterKind="Leave Request" filterRole="student" />
        </div>
      )}

      {selectedModule === "last_minute_cancel" && (
        <div>
          <button onClick={() => setSelectedModule(null)} style={{ backgroundColor: '#00008B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>Back</button>
          <Notification userType="admin" filterKind="Last Minute Cancellation" filterRole="student" />
        </div>
      )}

    </>
  );
}
