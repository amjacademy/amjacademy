"use client"

import { useMemo, useState } from "react"
import "./punctuality-repot.css"

const sessionTypes = ["All Classes", "Regular", "Special", "Demo"]
const slotStatuses = ["All Slots", "On-time", "Early-Out", "Late-In", "Early-In", "Late-Out"]

function toCsv(rows) {
  const headers = [
    "Class Date & Time",
    "Teacher",
    "Check-in Time",
    "Checkout Time",
    "Check-in Status",
    "Checkout Status",
    "Class Duration",
    // "Reason",
  ]
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const body = rows
    .map((r) =>
      [
        r.dateTime,
        r.teacher,
        r.checkinTime,
        r.checkoutTime,
        r.checkinStatus,
        r.checkoutStatus,
        r.duration,
        // r.reason || "-",
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
  const slotStatus = ["On-time", "Behind-scheduled", "Late-In", "Late-Out", "Early-In"][i % 5]
  const checkinStatus = ["On-time", "Late-In", "Early-In"][i % 3]
  const checkoutStatus = ["On-time", "Early-Out", "Late-Out"][i % 3]
  const duration = `${30 + (i % 10) * 3} min.`
  // const reason = slotStatus.includes("Late") ? "Traffic" : slotStatus.includes("Early") ? "Left early" : ""
  const teachers = ["Ms. Sarah", "Mr. David", "Ms. Lisa", "Mr. John", "Ms. Anna"]

  return {
    id: i + 1,
    dateTime: `${day}, ${20 + (i % 9)} Aug at ${hour}:${minute} ${ampm}`,
    teacher: teachers[i % teachers.length],
    slotStatus,
    checkinTime: `${String((7 + (i % 5)) % 12 || 12).padStart(2, "0")}:${String((10 + i) % 60).padStart(2, "0")} AM`,
    checkoutTime: `${String((8 + (i % 5)) % 12 || 12).padStart(2, "0")}:${String((35 + i) % 60).padStart(2, "0")} PM`,
    checkinStatus,
    checkoutStatus,
    duration,
    sessionType,
    classType,
    // reason,
  }
}

// Function to map status labels for display
function mapStatusForDisplay(status) {
  switch (status) {
    case "Early-Out":
      return "Behind Scheduled"
    case "Late-Out":
    case "Late-In":
      return "After Scheduled"
    case "Early-In":
    case "On-time":
      return "As Scheduled"
    default:
      return status
  }
}

export default function PunctualityReport() {
  const [startDate, setStartDate] = useState("")
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
        r.teacher.toLowerCase().includes(keyword.toLowerCase()) ||
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
    download("my-punctuality-report.csv", csv)
  }

  return (
    <>
      <div className="content-header1">
        <h1>MY PUNCTUALITY REPORT</h1>
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
              placeholder="Teacher, class type..."
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
                <th>Teacher</th>
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
                  <td>{r.teacher}</td>
                  <td>{r.checkinTime}</td>
                  <td>{r.checkoutTime}</td>
                  <td>
                    <span className={`chip ${r.checkinStatus.toLowerCase().replace(/\\s/g, "-")}`}>
                      {mapStatusForDisplay(r.checkinStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${r.checkoutStatus.toLowerCase().replace(/\\s/g, "-")}`}>
                      {mapStatusForDisplay(r.checkoutStatus)}
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
