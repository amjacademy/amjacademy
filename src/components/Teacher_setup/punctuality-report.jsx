"use client"

import { useMemo, useState } from "react"
import "./punctuality-report.css"
import "./Dashboard.css"

const sessionTypes = ["All Classes", "Regular", "Special", "Demo"]
const slotStatuses = [
  "All Slots",
  "As schedule",
  "Late-In",
  "Late-Out",
  "Early-In",
  "On Time",
  "Behind schedule",
  "Early-Out"
]

function toCsv(rows) {
  const headers = [
    "Class Date & Time",
    "Students",
    "Check-in Time",
    "Checkout Time",
    "Check-in Status",
    "Checkout Status",
    "Class Duration",
    "Reason",
  ]
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const body = rows
    .map((r) =>
      [
        r.dateTime,
        r.students.join("; "),
        r.checkinTime,
        r.checkoutTime,
        r.checkinStatus,
        r.checkoutStatus,
        r.duration,
        r.reason || "-",
      ]
        .map(escape)
        .join(","),
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
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const day = days[i % 7]
  const hour = String((i % 12) + 1).padStart(2, "0")
  const minute = String((i * 7) % 60).padStart(2, "0")
  const ampm = i % 2 === 0 ? "AM" : "PM"
  const sessionType = ["Regular", "Special", "Demo"][i % 3]
  const classType = ["Group Class", "Individual Class", "Group Demo", "Individual Demo"][i % 4]
  const slotStatus = ["As schedule","Behind schedule","After schedule"][i % 3]
  const checkinStatus = [
    "As scheduled",    // renamed from 'As schedule'
    "After Scheduled",
    "After Scheduled",
  ][i % 3]

  const checkoutStatus = [
    "As scheduled",    // renamed from 'As schedule'
    "After scheduled",
    "Behind schedule"
  ][i % 3]

  const duration = `${30 + (i % 10) * 3} min.`
  const reason = slotStatus.includes("Behind") ? "Traffic" : slotStatus.includes("Early") ? "Left early" : ""

  return {
    id: i + 1,
    dateTime: `${day}, ${20 + (i % 9)} Aug at ${hour}:${minute} ${ampm}`,
    students: ["Anya", "Shreya", "Kesar", "Michael", "Haniel", "Aaryan"].slice(0, (i % 3) + 1),
    slotStatus,
    checkinTime: `${String((7 + (i % 5)) % 12 || 12).padStart(2, "0")}:${String((10 + i) % 60).padStart(2, "0")} AM`,
    checkoutTime: `${String((8 + (i % 5)) % 12 || 12).padStart(2, "0")}:${String((35 + i) % 60).padStart(2, "0")} PM`,
    checkinStatus,
    checkoutStatus,
    duration,
    sessionType,
    classType,
    reason,
  }
}

export default function PunctualityReport() {
  const [ startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sessionType, setSessionType] = useState("All Classes")
  const [slotStatus, setSlotStatus] = useState("All Slots")
  const [keyword, setKeyword] = useState("")

  // generate many rows
  const allRows = useMemo(() => {
    const rows = Array.from({ length: 60 }, (_, i) => makeDummyRow(i))
    return rows
  }, [])

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      const matchSession = sessionType === "All Classes" || r.sessionType === sessionType
      const matchSlot = slotStatus === "All Slots" || r.slotStatus === slotStatus
      const matchKeyword =
        !keyword ||
        r.students.join(" ").toLowerCase().includes(keyword.toLowerCase()) ||
        r.classType.toLowerCase().includes(keyword.toLowerCase())
      // simple date filter by detecting day number in dateTime text
      const dayNum = Number.parseInt(r.dateTime.slice(5, 7), 10) || 20
      const sd = startDate ? Number.parseInt(startDate.split("-")[2], 10) : null
      const ed = endDate ? Number.parseInt(endDate.split("-")[2], 10) : null
      const matchStart = sd ? dayNum >= sd : true
      const matchEnd = ed ? dayNum <= ed : true
      return matchSession && matchSlot && matchKeyword && matchStart && matchEnd
    })
  }, [allRows, sessionType, slotStatus, keyword, startDate, endDate])

  const onDownload = () => {
    const csv = toCsv(filtered)
    download("punctuality-report.csv", csv)
  }

  return (
    <>
      <div className="content-header1">
        <h1>PUNCTUALITY REPORTS</h1>
      </div>

      <div className="report-controls">
        <div className="filters-left">
          <div className="field">
            <label>Date From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Date To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Session Type</label>
            <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
              {sessionTypes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Slot Status</label>
            <select value={slotStatus} onChange={(e) => setSlotStatus(e.target.value)}>
              {slotStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field grow">
            <label>Search by Keyword</label>
            <input
              type="text"
              placeholder="Student, class type..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button
            className="search-btn"
            onClick={() => {
              /* filters apply automatically */
            }}
          >
            Search
          </button>
        </div>

        <div className="controls-right">
          <div className="total-badge">
            <span>Total Classes:</span>
            <strong>{filtered.length}</strong>
          </div>
          <button className="download-btn" onClick={onDownload} aria-label="Download report as CSV">
            Download CSV
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Class Date &amp; Time</th>
                <th>Students</th>
                <th>Check-in Time</th>
                <th>Checkout Time</th>
                <th>Check-in Status</th>
                <th>Checkout Status</th>
                <th>Class Duration</th>
                {/* <th>Reason</th> */}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.dateTime}</td>
                  <td>
                    <div className="students">
                      {r.students.map((s, idx) => (
                        <span className="student-pill" key={idx}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{r.checkinTime}</td>
                  <td>{r.checkoutTime}</td>
                  <td>
                    <span className={`chip ${r.checkinStatus.toLowerCase().replace(/\s/g, "-")}`}>
                      {r.checkinStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${r.checkoutStatus.toLowerCase().replace(/\s/g, "-")}`}>
                      {r.checkoutStatus}
                    </span>
                  </td>
                  <td>{r.duration}</td>
                  {/* <td>{r.reason || "-"}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
