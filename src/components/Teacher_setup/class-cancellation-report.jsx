"use client"

import { useMemo, useState } from "react"
import "./class-cancellation-report.css"

const types = ["All", "Class", "Demo"]
const slotStatuses = ["All", "Slot Deleted", "Rescheduled"]

function toCsv(rows) {
  const headers = ["Slot Id", "Type", "Student", "Course", "Class Date & Time", "Slot Status", "Reason"]
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const body = rows
    .map((r) =>
      [r.slotId, r.type, r.student, r.course, r.dateTime, r.slotStatus, r.reason || "-"].map(escape).join(","),
    )
    .join("\n")
  return [headers.join(","), body].join("\n")
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function makeDummyRow(i) {
  const slotId = String(1100000 + i)
  const type = i % 5 === 2 ? "Demo" : "Class"
  const studentPool = ["n/a", "Anaya", "Shreyas", "Kesar", "Eloah Michael, Haniel", "Aaryan", "Johann"]
  const student = type === "Demo" ? studentPool[(i + 3) % studentPool.length] : "n/a"
  const coursePool = [
    "Online Keyboard And Piano Classes for Kids",
    "Beginner Guitar Batch",
    "Vocal Warmups & Rhythm",
    "Music Theory Essentials",
  ]
  const course = coursePool[i % coursePool.length]
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayName = days[i % 7]
  const dd = String(20 + (i % 10)).padStart(2, "0")
  const hh = String((10 + i) % 12 || 12).padStart(2, "0")
  const mm = String((i * 7) % 60).padStart(2, "0")
  const ampm = i % 2 === 0 ? "AM" : "PM"
  const dateTime = `${dayName}, ${dd} Aug at ${hh}:${mm} ${ampm}`

  const reasons = [
    "Contract Terminated",
    "Teacher not available",
    "Student not available",
    "Student contract is on hold / dormant / terminated / expired",
    "Reschedule Demo/Class",
  ]
  const reason = reasons[i % reasons.length]
  const slotStatus = reason.includes("Reschedule") ? "Rescheduled" : "Slot Deleted"

  return {
    id: i + 1,
    slotId,
    type,
    student,
    course,
    dateTime,
    slotStatus,
    reason,
  }
}

export default function ClassCancellationReport() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [type, setType] = useState("All")
  const [status, setStatus] = useState("All")
  const [keyword, setKeyword] = useState("")

  // many rows to make report longer
  const allRows = useMemo(() => Array.from({ length: 80 }, (_, i) => makeDummyRow(i)), [])

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      const matchType = type === "All" || r.type === type
      const matchStatus = status === "All" || r.slotStatus === status
      const kw = keyword.trim().toLowerCase()
      const matchKw =
        !kw ||
        r.slotId.toLowerCase().includes(kw) ||
        r.student.toLowerCase().includes(kw) ||
        r.course.toLowerCase().includes(kw) ||
        r.reason.toLowerCase().includes(kw)

      // naive day-of-month filter derived from date text
      const dayNum = Number.parseInt(r.dateTime.slice(5, 7), 10) || 20
      const sd = startDate ? Number.parseInt(startDate.split("-")[2], 10) : null
      const ed = endDate ? Number.parseInt(endDate.split("-")[2], 10) : null
      const matchStart = sd ? dayNum >= sd : true
      const matchEnd = ed ? dayNum <= ed : true

      return matchType && matchStatus && matchKw && matchStart && matchEnd
    })
  }, [allRows, type, status, keyword, startDate, endDate])

  const onDownload = () => {
    const csv = toCsv(filtered)
    download("class-cancellation-report.csv", csv)
  }

  return (
    <>
      <div className="content-header">
        <h1>CLASS CANCELLATION REPORTS</h1>
      </div>

      <div className="cc-controls">
        <div className="cc-left">
          <div className="cc-field">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="cc-field">
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="cc-field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="cc-field">
            <label>Slot Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {slotStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="cc-field cc-grow">
            <label>Search</label>
            <input
              type="text"
              placeholder="Slot Id, student, course, reason..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button className="cc-search">Search</button>
        </div>

        <div className="cc-right">
          <div className="cc-total">
            <span>Total Records:</span>
            <strong>{filtered.length}</strong>
          </div>
          <button className="cc-download" onClick={onDownload} aria-label="Download report as CSV">
            Download CSV
          </button>
        </div>
      </div>

      <div className="cc-table-card">
        <div className="cc-table-scroll">
          <table className="cc-table">
            <thead>
              <tr>
                <th>Slot Id</th>
                <th>Type</th>
                <th>Student</th>
                <th>Course</th>
                <th>Class Date &amp; Time</th>
                <th>Slot Status</th>
                <th>Reason</th>
                <th className="cc-right-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.slotId}</td>
                  <td>{r.type}</td>
                  <td>{r.student}</td>
                  <td className="cc-course">{r.course}</td>
                  <td>{r.dateTime}</td>
                  <td>
                    <span className={`cc-badge ${r.slotStatus === "Rescheduled" ? "rescheduled" : "deleted"}`}>
                      {r.slotStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`cc-reason ${
                        /Reschedule/i.test(r.reason) ? "warn" : /Teacher|Student/i.test(r.reason) ? "info" : "muted"
                      }`}
                    >
                      {r.reason}
                    </span>
                  </td>
                  <td className="cc-right-col">
                    <button
                      className="cc-problem-btn"
                      onClick={() => alert(`Report submitted for Slot ${r.slotId}`)}
                      aria-label={`Report a problem for Slot ${r.slotId}`}
                    >
                      Report a Problem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
