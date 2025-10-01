import { useState } from "react"
import "./Announcements.css"

export default function Announcements({ announcements, setAnnouncements }) {
  const [receiver, setReceiver] = useState("Students")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [duration, setDuration] = useState("23:59") // duration as time string, default end of day
  const [error, setError] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!title || !message || !duration || duration <= 0) {
      setError("Please add a title, message, and valid duration for the announcement.")
      return
    }
    const item = {
      id: `${Date.now()}`,
      receiver,
      title,
      message,
      duration, // store duration in announcement object
      createdAt: new Date().toISOString(),
    }
    const updatedAnnouncements = [item, ...announcements]
    setAnnouncements(updatedAnnouncements)
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
    setTitle("")
    setMessage("")
    setDuration("23:59")
  }

  const onDelete = (id) => {
    const updatedAnnouncements = announcements.filter((x) => x.id !== id)
    setAnnouncements(updatedAnnouncements)
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
  }

  return (
    <section className="card card--pad">
      <header className="section-header">
        <div className="section-title">
          <h3>Announcements</h3>
          <span className="badge">{receiver}</span>
        </div>
      </header>

      <form className="form-grid annc-grid" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">Receiver</label>
          <select
            className="input"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            aria-label="Announcement receiver"
          >
            <option>Students</option>
            <option>Teachers</option>
            <option>All</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            aria-label="Title"
            required
          />
        </div>
        <div className="field field--full">
          <label className="label">Message</label>
              <textarea
                className="input textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                aria-label="Message"
                required
              />
            </div>
        <div className="field">
          <label className="label">Duration (time)</label>
          <input
            className="input"
            type="time"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-label="Duration time"
            required
          />
        </div>
            <div className="field form-actions">
              <button className="btn btn-primary" type="submit">
                Post Announcement
              </button>
              {error ? (
                <p className="error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </form>

      <div className="list">
        {announcements.length === 0 ? (
          <div className="empty-state" role="status" aria-live="polite">
            <h4 className="empty-title">No announcements</h4>
            <p className="empty-subtitle">Post your first announcement using the form above.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <article key={a.id} className="annc">
              <div className="annc-head">
                <h4 className="annc-title">{a.title}</h4>
                <span
                  className={`pill pill--${a.receiver === "Students" ? "blue" : a.receiver === "Teachers" ? "green" : "gray"}`}
                >
                  {a.receiver}
                </span>
              </div>
              <p className="annc-msg">{a.message}</p>
              <footer className="annc-foot">
                <time className="meta">{new Date(a.createdAt).toLocaleString()}</time>
                <span className="meta">Ends at: {new Date(`1970-01-01T${a.duration}:00+05:30`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Asia/Kolkata' })}</span>
                <button className="btn btn-danger btn-sm btn-smaller" onClick={() => onDelete(a.id)}>
                  Delete
                </button>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
