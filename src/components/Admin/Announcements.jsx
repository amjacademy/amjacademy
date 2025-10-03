import { useState, useEffect } from "react";
import "./Announcements.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [receiver, setReceiver] = useState("Students");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("23:59"); // default end of day
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`https://amjacademy-working.onrender.com/api/announcements/receive/${receiver}`, {
        method: "GET",
        credentials: "include",
      });
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

    if (!title || !message || !duration) {
      setError("Please fill in title, message, and duration.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://amjacademy-working.onrender.com/api/announcements/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver, title, message, duration }),
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
        setDuration("23:59");
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
          {a.duration && (
            <span className="meta">
              Ends at: {(() => {
                const [hours, minutes] = a.duration.split(":");
                const endTime = new Date();
                endTime.setHours(Number(hours), Number(minutes), 0, 0);
                return endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
              })()}
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
