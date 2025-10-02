import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    announcements: 0,
    schedules: 0,
  });

 useEffect(() => {
  const fetchCounts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/counts");
      const data = await res.json();
      setCounts(data);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  };
  fetchCounts();
}, []);


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
  );
}
