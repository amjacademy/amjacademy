"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const LoginForm = () => {
  const API_BASE = "https://amjacademy-working.onrender.com/api/users";
  const [userType, setUserType] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: userType,
  })
  const [errors, setErrors] = useState({})
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [showPassword, setShowPassword] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

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

  // Helper functions for password validation
  const hasMinimumLength = (password) => password.length >= 8
  const hasSpecialChar = (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasUppercase = (password) => /[A-Z]/.test(password)
  const hasLowercase = (password) => /[a-z]/.test(password)
  const hasNumber = (password) => /\d/.test(password)

  const validatePassword = (password) => {
    const errors = []

    if (!hasMinimumLength(password)) {
      errors.push("at least 8 characters")
    }
    if (!hasSpecialChar(password)) {
      errors.push("one special character")
    }
    if (!hasUppercase(password)) {
      errors.push("one uppercase letter")
    }
    if (!hasLowercase(password)) {
      errors.push("one lowercase letter")
    }
    if (!hasNumber(password)) {
      errors.push("one number")
    }

    return errors
  }



  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!otpVerified) {
    alert("Please verify OTP first");
    return;
  }
  if (!validateForm()) return;

  try {
    formData.role = userType; // Ensure role is set
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("username", formData.username);
      localStorage.setItem("user_id", data.id); 
      if (formData.role === "Student") {
        navigate("/student-dashboard");
        } else if (formData.role === "Teacher") {
          navigate("/teacher-dashboard");
        } else {
          // Default fallback for unknown roles
          /* navigate("/dashboard"); */
          }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  const handleCloseComingSoon = () => {
    setShowComingSoon(false)
  }

const handleVerifyClick = async () => {
   formData.role = userType;
  if (!formData.username || !formData.email || !formData.role) {
    alert("Username, Email, and Role are required for verification");
    return;
  }
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/sendotp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: formData.username, email: formData.email, role: formData.role }),
    });
    const data = await res.json();
    if (data.success) {
      setShowOtpModal(true);
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.log(err);
    alert("Server error");
  } finally {
    setLoading(false);
  }
};
  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) return // Only allow single digit
    const newDigits = [...otpDigits]
    newDigits[index] = value
    setOtpDigits(newDigits)

    // Auto-focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // OTP submit
const handleOtpSubmit = async (e) => {
  e.preventDefault();
  const otp = otpDigits.join("");
  try {
    const res = await fetch(`${API_BASE}/verifyotp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, otp }),
    });
    const data = await res.json();
    if (data.success) {
      setOtpVerified(true);
      setShowPassword(true);
      setShowOtpModal(false);
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

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

    if (showPassword) {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else {
        const passwordErrors = validatePassword(formData.password)
        if (passwordErrors.length > 0) {
          newErrors.password = `Password must contain ${passwordErrors.join(", ")}`
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
            className={`user-type-btn ${userType === "Student" ? "active" : ""}`}
            onClick={() => setUserType("Student")}
          >
            Student
          </button>
          <button
            type="button"
            className={`user-type-btn ${userType === "Teacher" ? "active" : ""}`}
            onClick={() => setUserType("Teacher")}
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
            <button type="button" className="verify-btn" onClick={handleVerifyClick} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>

          {showPassword && (
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
          )}

          <button type="submit" className="login-btn">
            Sign In as {userType === "Student" ? "Student" : "Teacher"}
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

      {/* Coming Soon Modal for Students */}
      {showComingSoon && (
        <div className="coming-soon-modal">
          <div className="coming-soon-content">
            <h2>Coming Soon!</h2>
            <p>The student module is currently under development and will be available soon.</p>
            <button onClick={handleCloseComingSoon} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal">
          <div className="otp-content">
            <h2>Enter OTP</h2>
            <p>Enter the OTP sent to your email</p>
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-inputs">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-digit-input"
                    maxLength={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>
              <div className="otp-buttons">
                <button type="button" onClick={() => setShowOtpModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="verify-otp-btn" disabled={!otpDigits.every(digit => digit.trim())}>
                  Verify OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginForm
