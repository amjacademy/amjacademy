import React, { useEffect, useState } from "react";
import User_enrollment from "./User_enrollment.jsx";
import Class_arrangement from "./Class_arrangement.jsx";
import Notification from "./Notification.jsx";

function AnnouncementsPlaceholder({ onBack, announcements }) {
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>Announcements Details</h2>
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((a) => (
          <div key={a.id} className="announcement-item">
            <h3>{a.title}</h3>
            <p>{a.message}</p>
            <p><strong>Receiver:</strong> {a.receiver}</p>
            <p><strong>Duration:</strong> {a.duration}</p>
          </div>
        ))
      )}
    </div>
  );
}

function SchedulesPlaceholder({ onBack }) {
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>Schedules Details</h2>
      <p>Details for Schedules will be implemented here.</p>
    </div>
  );
}

export default function Dashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    announcements: 0,
    schedules: 0,
    notifications: 0,
  });

  const [selectedModule, setSelectedModule] = useState(null);

  // State for students and teachers data to pass to User_enrollment
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("https://amjacademy-working.onrender.com/api/counts");
        const data = await res.json();
        setCounts(data);
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    };
    fetchCounts();
  }, []);

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
        <div className="stat" onClick={() => setSelectedModule("notifications")} style={{ cursor: "pointer" }}>
          <span className="stat-num">{counts.notifications}</span>
          <span className="stat-label">Notifications</span>
        </div>
      </div>

      {selectedModule === "students" && (
        <div className="detail-section">
          <User_enrollment
            students={students}
            setStudents={setStudents}
            teachers={teachers}
            setTeachers={setTeachers}
          />
          <button onClick={() => setSelectedModule(null)}>Close Details</button>
        </div>
      )}

      {selectedModule === "teachers" && (
        <div className="detail-section">
          <User_enrollment
            students={students}
            setStudents={setStudents}
            teachers={teachers}
            setTeachers={setTeachers}
          />
          <button onClick={() => setSelectedModule(null)}>Close Details</button>
        </div>
      )}

      {selectedModule === "announcements" && (
        <AnnouncementsPlaceholder onBack={() => setSelectedModule(null)} announcements={announcements} />
      )}

      {selectedModule === "schedules" && (
        <Class_arrangement schedules={schedules} setSchedules={setSchedules} />
      )}

      {selectedModule === "notifications" && (
        <div className="detail-section">
          <Notification userType="admin" />
          <button onClick={() => setSelectedModule(null)}>Close Details</button>
        </div>
      )}
    </>
  );
}
