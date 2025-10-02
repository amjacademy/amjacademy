"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Admin_login.css"

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [errors, setErrors] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }))
  }

  const validate = () => {
    const next = { username: "", password: "" }
    if (!formData.username.trim()) next.username = "Username is required"
    if (!formData.password) next.password = "Password is required"
    setErrors(next)
    return !next.username && !next.password
  }

  const onSubmit = async (e) => {
  e.preventDefault()
  if (!validate()) return

  try {
    setLoading(true)

    const res = await fetch("https://amjacademy-mjyr.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important: send/receive cookies
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      navigate("/admin-dashboard")
    } else {
      setErrors({ username: "", password: data.message || "Invalid username or password" })
    }
  } catch (err) {
    setErrors({ username: "", password: "Server error, please try again" })
  } finally {
    setLoading(false)
  }
}


  return (
    <main className="admin-login-container">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <header className="admin-login-header">
          <h1 id="admin-login-title" className="admin-login-title">
            AMJ Academy Admin
          </h1>
          <p className="admin-login-subtitle">Sign in to manage the platform</p>
        </header>

        <form className="admin-login-form" onSubmit={onSubmit} noValidate>
          <div className="admin-form-group">
            <label htmlFor="username" className="admin-form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`admin-form-input ${errors.username ? "admin-error" : ""}`}
              placeholder="Enter admin username"
              value={formData.username}
              onChange={onChange}
              autoComplete="username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <span id="username-error" className="admin-error-message" role="alert">
                {errors.username}
              </span>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="password" className="admin-form-label">
              Password
            </label>
            <div className="admin-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`admin-form-input ${errors.password ? "admin-error" : ""}`}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={onChange}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="admin-toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className="admin-error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to Admin"}
          </button>
        </form>
      </section>
    </main>
  )
}
