import React from "react";

export default function Dashboard({ counts }) {
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
