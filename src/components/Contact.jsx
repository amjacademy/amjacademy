"use client"
import { useState } from "react"
import "./Contact.css"

const Contact = () => {
  const MAIN = (import.meta.env.VITE_MAIN || "").replace(/\/+$/, "")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    experience: "",
    message: "",
  })
  const [result, setResult] = useState("")
  const [resultType, setResultType] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setResultType("pending")
    setResult("Sending...")
    const form = event.currentTarget

    try {
      const response = await fetch(`${MAIN}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          botcheck: form.elements.botcheck.value,
        }),
      })
      if (!response.headers.get("content-type")?.includes("application/json")) {
        const message = response.status === 404
          ? "The contact email service is not available yet. Please try again later."
          : "The contact email service returned an unexpected response. Please try again later."
        throw new Error(message)
      }

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Message could not be sent. Please try again.")
      }

      setResultType("success")
      setResult(data.message)
      form.reset()
      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        experience: "",
        message: "",
      })
    } catch (error) {
      console.error("Contact form submission failed:", error)
      setResultType("error")
      setResult(error.message || "Message could not be sent. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">
          Ready to start your musical journey? Contact me today to schedule your first lesson.
        </p>
        <div className="contact-content">
          {/* Contact Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            {/* Honeypot Field */}
            <input type="text" name="botcheck" style={{ display: "none" }} onChange={() => {}} />
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <select id="age" name="age" value={formData.age} onChange={handleChange}>
                  <option value="">Select Age Range</option>
                  <option value="4-7">5-7 years</option>
                  <option value="8-12">8-12 years</option>
                  <option value="13-17">13-17 years</option>
                  <option value="18-30">18-30 years</option>
                  <option value="31-50">31-50 years</option>
                  <option value="50+">50+ years</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="experience">Experience Level</label>
                <select id="experience" name="experience" value={formData.experience} onChange={handleChange}>
                  <option value="">Select Experience</option>
                  <option value="complete-beginner">Complete Beginner</option>
                  <option value="some-experience">Some Experience</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="returning">Returning to Piano</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Address *</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Your residential address"
                required
              ></textarea>
            </div>
            {/* <div className="form-group">
              <label htmlFor="message">Your Music Preference *</label>
              <textarea
                id="message1"
                name="message"
                rows={5}
                value={formData.message1}
                onChange={handleChange}
                placeholder="What is your Music preference ??"
                required
              ></textarea>
            </div> */}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
            {/* Result message */}
            {result && <p className={`form-result form-result-${resultType}`} role="status" aria-live="polite">{result}</p>}
          </form>
        </div>

        {/* Animated Musical Elements for Contact Section */}
        <div className="contact-musical-elements">
          <div className="contact-note contact-note-1">🎵</div>
          <div className="contact-note contact-note-2">🎶</div>
          <div className="contact-note contact-note-3">♪</div>
          <div className="contact-note contact-note-4">♫</div>
          <div className="contact-note contact-note-5">🎼</div>
          <div className="contact-note contact-note-6">🎹</div>
        </div>

        {/* Floating Colorful Elements */}
        <div className="contact-floating-elements">
          <div className="contact-circle contact-circle-1"></div>
          <div className="contact-circle contact-circle-2"></div>
          <div className="contact-circle contact-circle-3"></div>
          <div className="contact-circle contact-circle-4"></div>
          <div className="contact-circle contact-circle-5"></div>
        </div>
      </div>
    </section>
  )
}

export default Contact
