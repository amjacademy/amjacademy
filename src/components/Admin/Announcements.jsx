import { useState, useEffect } from "react";
import "./Announcements.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [receiver, setReceiver] = useState("Students");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // default today
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  

  // Fetch announcements from backend
// Fetch all announcements (no filtering or receiver)
const fetchAnnouncements = async () => {
  try {
    const res = await fetch(
      "https://amjacademy-working.onrender.com/api/announcements/receive",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await res.json();
    setAnnouncements(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch announcements:", err);
  }
};


useEffect(() => { fetchAnnouncements(); }, [receiver]);


  // Post new announcement
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !message || !date || !hour || !minute || !ampm) {
      setError("Please fill in title, message, date, and time.");
      return;
    }

    setLoading(true);

    try {
      const time = `${hour}:${minute} ${ampm}`;
      const res = await fetch("https://amjacademy-working.onrender.com/api/announcements/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver, title, message, date, time }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error response:", data);
        setError(data.error || "Failed to create announcement.");
      } else {
        // make sure data.announcements exists and is an array
fetchAnnouncements();


        setTitle("");
        setMessage("");
        setDate(new Date().toISOString().split('T')[0]);
        setHour("12");
        setMinute("00");
        setAmpm("AM");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    try {
      const res = await fetch(`https://amjacademy-working.onrender.com/api/announcements/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Delete failed:", errData.error);
        return;
      }

      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

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
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Announcement date"
            required
          />
        </div>
        <div className="field">
          <label className="label">Time</label>
          <div className="time-input-group">
            <select
              className="input time-select"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              aria-label="Hour"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h.toString().padStart(2, '0')}>
                  {h}
                </option>
              ))}
            </select>
            <span className="time-separator">:</span>
            <select
              className="input time-select"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              aria-label="Minute"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m.toString().padStart(2, '0')}>
                  {m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <select
              className="input time-select"
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              aria-label="AM/PM"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div className="field form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post Announcement"}
          </button>
          {error && <p className="error" role="alert">{error}</p>}
        </div>
      </form>

      <div className="list">
  {(announcements || []).length === 0 ? (
    <div className="empty-state" role="status" aria-live="polite">
      <h4 className="empty-title">No announcements</h4>
      <p className="empty-subtitle">Post your first announcement using the form above.</p>
    </div>
  ) : (
    (announcements || []).map((a) => (
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
          <time className="meta">{a.created_at ? new Date(a.created_at).toLocaleString() : "N/A"}</time>
          {a.date && a.time && (
            <span className="meta">
              On {new Date(a.date).toLocaleDateString()} at {a.time}
            </span>
          )}
          <button className="btn btn-danger btn-sm btn-smaller" onClick={() => onDelete(a.id)}>
            Delete
          </button>
        </footer>
      </article>
    ))
  )}
</div>

    </section>
  );
}
