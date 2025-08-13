"use client"

import { useState } from "react"
import "./RegistrationModal.css"

const Registration = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [useEmail, setUseEmail] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    name: "",
    age: "",
    experience: "",
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Registration submitted:", formData)
    onClose()
  }

  const toggleEmailPhone = () => {
    setUseEmail(!useEmail)
    // Clear the other field when switching
    if (!useEmail) {
      setFormData({ ...formData, phone: "" })
    } else {
      setFormData({ ...formData, email: "" })
    }
  }

  if (!isOpen) return null

  return (
    <div className="registration-overlay">
      <div className="registration-modal">
        {/* Animated Background Elements */}
        <div className="registration-bg-elements">
          <div className="floating-note note-1">♪</div>
          <div className="floating-note note-2">♫</div>
          <div className="floating-note note-3">🎹</div>
          <div className="floating-note note-4">🎵</div>
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
        </div>

        {/* Header Section */}
        <div className="registration-header">
          <div className="trust-badge">
            <h3>Trusted by</h3>
            <div className="trust-number">500+ students</div>
            <p>learning music with us</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
            <div className="step-icon">🎵</div>
            <span>Contact</span>
          </div>
          <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
            <div className="step-icon">✓</div>
            <span>Verify</span>
          </div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
            <div className="step-icon">ℹ</div>
            <span>Details</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="registration-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Join AMJ Academy</h2>
              <p className="step-subtitle">
                <span className="music-icon">🎼</span>
                Start your musical journey with us today
              </p>

              {!useEmail ? (
                <>
                  <div className="input-group">
                    <label>WhatsApp Number</label>
                    <div className="phone-input">
                      <select className="country-code">
                        <option value="+91">IN (+91)</option>
                        <option value="+1">US (+1)</option>
                        <option value="+44">UK (+44)</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter WhatsApp Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <button className="primary-btn" onClick={handleNextStep}>
                    GET VERIFICATION CODE
                  </button>

                  <div className="alternative-option">
                    <p>Have trouble signing in?</p>
                    <button className="link-btn" onClick={toggleEmailPhone}>
                      Use Email Address instead
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <button className="primary-btn" onClick={handleNextStep}>
                    SEND EMAIL VERIFICATION
                  </button>

                  <div className="alternative-option">
                    <p>Prefer WhatsApp?</p>
                    <button className="link-btn" onClick={toggleEmailPhone}>
                      Use WhatsApp instead
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h2>Verify Your {useEmail ? 'Email' : 'Number'}</h2>
              <p className="step-subtitle">
                <span className="music-icon">{useEmail ? '📧' : '📱'}</span>
                We've sent a code to your {useEmail ? 'email' : 'WhatsApp'}
              </p>

              <div className="verification-code">
                <input type="text" maxLength="1" />
                <input type="text" maxLength="1" />
                <input type="text" maxLength="1" />
                <input type="text" maxLength="1" />
                <input type="text" maxLength="1" />
                <input type="text" maxLength="1" />
              </div>

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                <button className="primary-btn" onClick={handleNextStep}>
                  Verify Code
                </button>
              </div>

              <div className="alternative-option">
                <p>Didn't receive code?</p>
                <button className="link-btn">Resend Code</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h2>Tell Us About Yourself</h2>
              <p className="step-subtitle">
                <span className="music-icon">🎯</span>
                Help us personalize your learning experience
              </p>

              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-group">
                  <label>Age Group</label>
                  <select name="age" value={formData.age} onChange={handleInputChange}>
                    <option value="">Select Age Range</option>
                    <option value="4-7">4-7 years</option>
                    <option value="8-12">8-12 years</option>
                    <option value="13-17">13-17 years</option>
                    <option value="18-30">18-30 years</option>
                    <option value="31-50">31-50 years</option>
                    <option value="50+">50+ years</option>
                  </select>
                </div>

                <div className="input-group full-width">
                  <label>Musical Experience</label>
                  <select name="experience" value={formData.experience} onChange={handleInputChange}>
                    <option value="">Select Experience Level</option>
                    <option value="complete-beginner">Complete Beginner</option>
                    <option value="some-experience">Some Experience</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="returning">Returning to Music</option>
                  </select>
                </div>
              </div>

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                <button className="primary-btn" onClick={handleSubmit}>
                  Complete Registration
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="registration-footer">
          <p>By registering, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}

export default Registration
