"use client"

import { useState } from "react"
import "./RegistrationModal.css"

export default function RegistrationModal({ isOpen, onClose, selectedPlan, selectedLevel }) {
  const [activeTab, setActiveTab] = useState("Sign In")
  const [countryCode, setCountryCode] = useState("IN (+91)")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [showEmailInput, setShowEmailInput] = useState(false)

  if (!isOpen) return null

  const handleGetVerificationCode = () => {
    if (showEmailInput) {
      console.log("Getting verification code for email:", email)
    } else {
      console.log("Getting verification code for phone:", countryCode, phoneNumber)
    }
  }

  const handleEmailToggle = () => {
    setShowEmailInput(!showEmailInput)
  }

  return (
    <div className="registration-modal-overlay">
      <div className="registration-modal">
        <div className="registration-left">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon">TG</span>
              <span className="logo-text">TalentGum</span>
            </div>
          </div>

          <div className="trust-section">
            <h2 className="trust-title">Trusted by</h2>
            <h1 className="trust-number">10,000+ parents</h1>
            <h2 className="trust-location">worldwide</h2>
          </div>
        </div>

        <div className="registration-right">
          <div className="modal-header">
            <div className="tab-navigation">
              <button
                className={`nav-tab ${activeTab === "Sign In" ? "active" : ""}`}
                onClick={() => setActiveTab("Sign In")}
              >
                <span className="tab-icon">👤</span>
                Sign In
              </button>
              <button
                className={`nav-tab ${activeTab === "Verify" ? "active" : ""}`}
                onClick={() => setActiveTab("Verify")}
              >
                <span className="tab-icon">✓</span>
                Verify
              </button>
              <button
                className={`nav-tab ${activeTab === "Info" ? "active" : ""}`}
                onClick={() => setActiveTab("Info")}
              >
                <span className="tab-icon">ℹ</span>
                Info
              </button>
            </div>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="form-content">
            {!showEmailInput ? (
              <>
                <h2 className="form-title">Enter Your WhatsApp Number</h2>
                <p className="form-subtitle">
                  <span className="whatsapp-icon">📱</span>
                  We will only use it for important updates
                </p>

                <div className="input-group">
                  <div className="phone-input-container">
                    <select
                      className="country-select"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="IN (+91)">IN (+91)</option>
                      <option value="US (+1)">US (+1)</option>
                      <option value="UK (+44)">UK (+44)</option>
                      <option value="CA (+1)">CA (+1)</option>
                      <option value="AU (+61)">AU (+61)</option>
                    </select>
                    <input
                      type="tel"
                      className="phone-input"
                      placeholder="Enter WhatsApp Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="verification-button"
                  onClick={handleGetVerificationCode}
                  disabled={!phoneNumber.trim()}
                >
                  GET VERIFICATION CODE
                </button>

                <div className="alternative-signin">
                  <p className="trouble-text">Have trouble signing in?</p>
                  <button className="email-link" onClick={handleEmailToggle}>
                    Use Email Address instead.
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="form-title">Enter Your Email Address</h2>
                <p className="form-subtitle">
                  <span className="email-icon">📧</span>
                  We will send you a verification link
                </p>

                <div className="input-group">
                  <input
                    type="email"
                    className="email-input"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button className="verification-button" onClick={handleGetVerificationCode} disabled={!email.trim()}>
                  SEND VERIFICATION LINK
                </button>

                <div className="alternative-signin">
                  <p className="trouble-text">Prefer WhatsApp?</p>
                  <button className="email-link" onClick={handleEmailToggle}>
                    Use WhatsApp Number instead.
                  </button>
                </div>
              </>
            )}

            <div className="rating-section">
              <div className="rating-display">
                <span className="rating-number">4.6/5</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < 4 ? "filled" : "empty"}`}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {selectedPlan && selectedLevel && (
            <div className="selected-plan-info">
              <p className="plan-text">
                Selected:{" "}
                <strong>
                  {selectedLevel} - {selectedPlan}
                </strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
