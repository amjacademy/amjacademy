"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const LoginForm = () => {
  const [userType, setUserType] = useState("student")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log("Login attempt:", { ...formData, userType })
      // Handle login logic here
      // For now, redirect to dashboard after successful validation
      navigate('/dashboard')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome to AMJ Academy</h1>
          <p className="login-subtitle">Sign in to continue your learning journey</p>
        </div>

        <div className="user-type-selector">
          <button
            type="button"
            className={`user-type-btn ${userType === "student" ? "active" : ""}`}
            onClick={() => setUserType("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={`user-type-btn ${userType === "teacher" ? "active" : ""}`}
            onClick={() => setUserType("teacher")}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? "error" : ""}`}
              placeholder="Enter your username"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="login-btn">
            Sign In as {userType === "student" ? "Student" : "Teacher"}
          </button>
        </form>

        <div className="login-footer">
          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
          <p className="signup-link">
            Don't have an account? <a href="#">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
