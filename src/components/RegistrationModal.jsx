"use client"

import { useState, useRef, useEffect } from "react"
import "./RegistrationModal.css"

const RegistrationEnhanced = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [registrationType, setRegistrationType] = useState("") // "whatsapp" or "email"
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    mobile:"",
    otp: ["", "", "", "", "", ""],
    name: "",
    age: "",
    experience: "",
    instrument: "",
    address: "",
    parentName: "",
    PhoneNumber: "",
    selectedDate: "",
    selectedTime: "",
    location: "AMJ Academy Main Center",
  })

  // OTP input refs
  const otpRefs = useRef([])

  // Generate next 7 days from today
  const getNext3Days = () => {
    const days = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      })
    }
    return days
  }

  const [availableDays] = useState(getNext3Days())
  const [slotStatus, setSlotStatus] = useState({}); // { "09:00-10:00": "open", ... }

  // Fetch slot availability whenever date changes
useEffect(() => {
  if (formData.selectedDate) {
    fetch(`https://amjacademy.onrender.com/get-slots/${formData.selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const statusMap = {};
          data.slots.forEach(slot => {
            statusMap[slot.selectedTime] = slot.status;
          });
          setSlotStatus(statusMap);
        }
      })
      .catch(err => console.error("Error fetching slots", err));
  }
}, [formData.selectedDate]);

  // Time slots
  const timeSlots = [
    "04:00-04:45 am",
    "05:00-05:45 am",
    "06:00-06:45 am",
    "05:00-05:45 pm",
    "06:00-06:45 pm",
    "07:00-07:45 pm",
    "08:00-08:45 pm",
    "09:00-09:45 pm",
  ]

  // country code
  const countryCodes = [
    { name: "Afghanistan", code: "+93" },
    { name: "Albania", code: "+355" },
    { name: "Algeria", code: "+213" },
    { name: "Andorra", code: "+376" },
    { name: "Angola", code: "+244" },
    { name: "Antigua and Barbuda", code: "+1-268" },
    { name: "Argentina", code: "+54" },
    { name: "Armenia", code: "+374" },
    { name: "Australia", code: "+61" },
    { name: "Austria", code: "+43" },
    { name: "Azerbaijan", code: "+994" },
    { name: "Bahamas", code: "+1-242" },
    { name: "Bahrain", code: "+973" },
    { name: "Bangladesh", code: "+880" },
    { name: "Barbados", code: "+1-246" },
    { name: "Belarus", code: "+375" },
    { name: "Belgium", code: "+32" },
    { name: "Belize", code: "+501" },
    { name: "Benin", code: "+229" },
    { name: "Bhutan", code: "+975" },
    { name: "Bolivia", code: "+591" },
    { name: "Bosnia and Herzegovina", code: "+387" },
    { name: "Botswana", code: "+267" },
    { name: "Brazil", code: "+55" },
    { name: "Brunei Darussalam", code: "+673" },
    { name: "Bulgaria", code: "+359" },
    { name: "Burkina Faso", code: "+226" },
    { name: "Burundi", code: "+257" },
    { name: "Cambodia", code: "+855" },
    { name: "Cameroon", code: "+237" },
    { name: "Canada", code: "+1" },
    { name: "Cape Verde", code: "+238" },
    { name: "Central African Republic", code: "+236" },
    { name: "Chad", code: "+235" },
    { name: "Chile", code: "+56" },
    { name: "China", code: "+86" },
    { name: "Colombia", code: "+57" },
    { name: "Comoros", code: "+269" },
    { name: "Congo", code: "+242" },
    { name: "Costa Rica", code: "+506" },
    { name: "Croatia", code: "+385" },
    { name: "Cuba", code: "+53" },
    { name: "Cyprus", code: "+357" },
    { name: "Czech Republic", code: "+420" },
    { name: "Denmark", code: "+45" },
    { name: "Djibouti", code: "+253" },
    { name: "Dominica", code: "+1-767" },
    { name: "Dominican Republic", code: "+1-809" },
    { name: "Ecuador", code: "+593" },
    { name: "Egypt", code: "+20" },
    { name: "El Salvador", code: "+503" },
    { name: "Equatorial Guinea", code: "+240" },
    { name: "Eritrea", code: "+291" },
    { name: "Estonia", code: "+372" },
    { name: "Eswatini", code: "+268" },
    { name: "Ethiopia", code: "+251" },
    { name: "Fiji", code: "+679" },
    { name: "Finland", code: "+358" },
    { name: "France", code: "+33" },
    { name: "Gabon", code: "+241" },
    { name: "Gambia", code: "+220" },
    { name: "Georgia", code: "+995" },
    { name: "Germany", code: "+49" },
    { name: "Ghana", code: "+233" },
    { name: "Greece", code: "+30" },
    { name: "Grenada", code: "+1-473" },
    { name: "Guatemala", code: "+502" },
    { name: "Guinea", code: "+224" },
    { name: "Guyana", code: "+592" },
    { name: "Haiti", code: "+509" },
    { name: "Honduras", code: "+504" },
    { name: "Hungary", code: "+36" },
    { name: "Iceland", code: "+354" },
    { name: "India", code: "+91" },
    { name: "Indonesia", code: "+62" },
    { name: "Iran", code: "+98" },
    { name: "Iraq", code: "+964" },
    { name: "Ireland", code: "+353" },
    { name: "Israel", code: "+972" },
    { name: "Italy", code: "+39" },
    { name: "Jamaica", code: "+1-876" },
    { name: "Japan", code: "+81" },
    { name: "Jordan", code: "+962" },
    { name: "Kazakhstan", code: "+7" },
    { name: "Kenya", code: "+254" },
    { name: "Kiribati", code: "+686" },
    { name: "Kuwait", code: "+965" },
    { name: "Kyrgyzstan", code: "+996" },
    { name: "Laos", code: "+856" },
    { name: "Latvia", code: "+371" },
    { name: "Lebanon", code: "+961" },
    { name: "Lesotho", code: "+266" },
    { name: "Liberia", code: "+231" },
    { name: "Libya", code: "+218" },
    { name: "Liechtenstein", code: "+423" },
    { name: "Lithuania", code: "+370" },
    { name: "Luxembourg", code: "+352" },
    { name: "Madagascar", code: "+261" },
    { name: "Malawi", code: "+265" },
    { name: "Malaysia", code: "+60" },
    { name: "Maldives", code: "+960" },
    { name: "Mali", code: "+223" },
    { name: "Malta", code: "+356" },
    { name: "Marshall Islands", code: "+692" },
    { name: "Mauritania", code: "+222" },
    { name: "Mauritius", code: "+230" },
    { name: "Mexico", code: "+52" },
    { name: "Micronesia", code: "+691" },
    { name: "Moldova", code: "+373" },
    { name: "Monaco", code: "+377" },
    { name: "Mongolia", code: "+976" },
    { name: "Montenegro", code: "+382" },
    { name: "Morocco", code: "+212" },
    { name: "Mozambique", code: "+258" },
    { name: "Myanmar", code: "+95" },
    { name: "Namibia", code: "+264" },
    { name: "Nauru", code: "+674" },
    { name: "Nepal", code: "+977" },
    { name: "Netherlands", code: "+31" },
    { name: "New Zealand", code: "+64" },
    { name: "Nicaragua", code: "+505" },
    { name: "Niger", code: "+227" },
    { name: "Nigeria", code: "+234" },
    { name: "North Korea", code: "+850" },
    { name: "North Macedonia", code: "+389" },
    { name: "Norway", code: "+47" },
    { name: "Oman", code: "+968" },
    { name: "Pakistan", code: "+92" },
    { name: "Palau", code: "+680" },
    { name: "Palestine", code: "+970" },
    { name: "Panama", code: "+507" },
    { name: "Papua New Guinea", code: "+675" },
    { name: "Paraguay", code: "+595" },
    { name: "Peru", code: "+51" },
    { name: "Philippines", code: "+63" },
    { name: "Poland", code: "+48" },
    { name: "Portugal", code: "+351" },
    { name: "Qatar", code: "+974" },
    { name: "Romania", code: "+40" },
    { name: "Russia", code: "+7" },
    { name: "Rwanda", code: "+250" },
    { name: "Saint Kitts and Nevis", code: "+1-869" },
    { name: "Saint Lucia", code: "+1-758" },
    { name: "Saint Vincent and the Grenadines", code: "+1-784" },
    { name: "Samoa", code: "+685" },
    { name: "San Marino", code: "+378" },
    { name: "Sao Tome and Principe", code: "+239" },
    { name: "Saudi Arabia", code: "+966" },
    { name: "Senegal", code: "+221" },
    { name: "Serbia", code: "+381" },
    { name: "Seychelles", code: "+248" },
    { name: "Sierra Leone", code: "+232" },
    { name: "Singapore", code: "+65" },
    { name: "Slovakia", code: "+421" },
    { name: "Slovenia", code: "+386" },
    { name: "Solomon Islands", code: "+677" },
    { name: "Somalia", code: "+252" },
    { name: "South Africa", code: "+27" },
    { name: "South Korea", code: "+82" },
    { name: "South Sudan", code: "+211" },
    { name: "Spain", code: "+34" },
    { name: "Sri Lanka", code: "+94" },
    { name: "Sudan", code: "+249" },
    { name: "Suriname", code: "+597" },
    { name: "Sweden", code: "+46" },
    { name: "Switzerland", code: "+41" },
    { name: "Syria", code: "+963" },
    { name: "Taiwan", code: "+886" },
    { name: "Tajikistan", code: "+992" },
    { name: "Tanzania", code: "+255" },
    { name: "Thailand", code: "+66" },
    { name: "Togo", code: "+228" },
    { name: "Tonga", code: "+676" },
    { name: "Trinidad and Tobago", code: "+1-868" },
    { name: "Tunisia", code: "+216" },
    { name: "Turkey", code: "+90" },
    { name: "Turkmenistan", code: "+993" },
    { name: "Tuvalu", code: "+688" },
    { name: "Uganda", code: "+256" },
    { name: "Ukraine", code: "+380" },
    { name: "United Arab Emirates", code: "+971" },
    { name: "United Kingdom", code: "+44" },
    { name: "United States", code: "+1" },
    { name: "Uruguay", code: "+598" },
    { name: "Uzbekistan", code: "+998" },
    { name: "Vanuatu", code: "+678" },
    { name: "Vatican City", code: "+379" },
    { name: "Venezuela", code: "+58" },
    { name: "Vietnam", code: "+84" },
    { name: "Yemen", code: "+967" },
    { name: "Zambia", code: "+260" },
    { name: "Zimbabwe", code: "+263" }
  ];

  const [countryCode, setCountryCode] = useState("+91") // Default to India
  const [errors, setErrors] = useState({})
  
  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateAge = (age) => {
    const ageRegex = /^\d+$/
    return ageRegex.test(age) && parseInt(age) >= 4 && parseInt(age) <= 100
  }

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Handle numeric inputs with restrictions
    if (name === 'phone' || name === 'parentPhone' || name === 'PhoneNumber') {
      const numericValue = value.replace(/[^0-9]/g, '')
      if (numericValue.length <= 10) {
        setFormData({
          ...formData,
          [name]: numericValue
        })
        // Clear error when user starts typing
        if (errors[name]) {
          setErrors({ ...errors, [name]: '' })
        }
      }
    } else if (name === 'age') {
      // For age group, directly use the value without numeric filtering
      setFormData({
        ...formData,
        [name]: value
      })
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' })
      }
    }
  }

  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '')
    if (digit.length <= 1) {
      const newOtp = [...formData.otp]
      newOtp[index] = digit
      setFormData({ ...formData, otp: newOtp })

      // Auto-focus next input
      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // Check if OTP is complete (6 digits)
  const isOtpComplete = () => {
    return formData.otp.every(digit => digit !== '') && formData.otp.length === 6
  }

  // Check if phone number is valid (10 digits)
  const isPhoneValid = () => {
    return formData.phone.length === 10 && /^[0-9]+$/.test(formData.phone)
  }

  // Check if email is valid
  const isEmailValid = () => {
    return validateEmail(formData.email)
  }

  const handleRegistrationTypeSelect = (type) => {
    setRegistrationType(type)
    setCurrentStep(2)
  }

  const handleNextStep = () => {
    // Validate current step before proceeding
    let currentErrors = {}
    let isValid = true

    if (currentStep === 2) {
      if (registrationType === "whatsapp") {
        if (!isPhoneValid()) {
          currentErrors.phone = "Please enter a valid 10-digit phone number"
          isValid = false
        }
      } else {
        if (!isEmailValid()) {
          currentErrors.email = "Please enter a valid email address"
          isValid = false
        }
      }
    }

    if (currentStep === 3) {
      if (!isOtpComplete()) {
        currentErrors.otp = "Please enter the complete 6-digit verification code"
        isValid = false
      }
    }

    if (currentStep === 4) {
      if (!formData.name.trim()) {
        currentErrors.name = "Please enter your full name"
        isValid = false
      }
      if (!formData.age) {
        currentErrors.age = "Please select your age group"
        isValid = false
      }
      if (!formData.instrument) {
        currentErrors.instrument = "Please select your preferred instrument"
        isValid = false
      }
      if (!formData.experience) {
        currentErrors.experience = "Please select your experience level"
        isValid = false
      }
      if (!formData.address.trim()) {
        currentErrors.address = "Please enter your address"
        isValid = false
      }
    }

    if (currentStep === 5) {
      if (!formData.selectedDate) {
        currentErrors.selectedDate = "Please select a date"
        isValid = false
      }
      if (!formData.selectedTime) {
        currentErrors.selectedTime = "Please select a time slot"
        isValid = false
      }
    }

    setErrors(currentErrors)

    if (isValid) {
      if (currentStep === 2) {
        setCurrentStep(3); // Move to the OTP step only if valid
      } else if (currentStep === 3) {
        setCurrentStep(4); // Move to personal details only after OTP verification
      } else if (currentStep === 4) {
        setCurrentStep(5); // Move directly to review step after personal details
      } else if (currentStep === 5) {
        setCurrentStep(6); // Move to review step after scheduling
       } //else if (currentStep === 6) {
      //   handleSubmit(); // Submit the form on final step
      // }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

    const sendOtp = async () => {
    try {
      setLoading(true)
      const method = registrationType
      const value =
  method === "whatsapp"
    ? formData.phone.trim() // keep + for international format
    : formData.email.trim();

      const res = await fetch("https://amjacademy.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, value }),
      })
      const data = await res.json()
      setLoading(false)

      if (data.success) {
        alert("OTP sent successfully!")
        handleNextStep()
      } else {
        alert(data.message || "Failed to send OTP")
      }
    } catch (err) {
      setLoading(false)
      alert("Error sending OTP")
    }
  }

  const verifyOtp = async () => {
    try {
      setLoading(true)
      const value =
  registrationType === "whatsapp"
    ? formData.phone.trim() // keep '+' for consistency
    : formData.email.trim();

      const otpValue = formData.otp.join("")

      const res = await fetch("https://amjacademy.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, otp: otpValue }),
      })
      const data = await res.json()
      setLoading(false)

      if (data.success) {
        alert("OTP verified successfully!")
        handleNextStep();
    
      } else {
        alert(data.message || "Invalid OTP")
      }
    } catch (err) {
      setLoading(false)
      alert("Error verifying OTP")
    }
  }

const handleSaveDetails = async () => {
  try {
    setLoading(true);
    const res = await fetch("https://amjacademy.onrender.com/save-user-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
        age: formData.age,
        experience: formData.experience,
        instrument: formData.instrument,
        address: formData.address,
        parentName: formData.parentName,
        PhoneNumber: formData.PhoneNumber
      })
    });

    const data = await res.json();
    setLoading(false);

   if (data.success) {
  setFormData(prev => ({ ...prev, id: data.id })); // use prev to preserve all other values
  alert("Details saved successfully!");
  handleNextStep();
  //setCurrentStep(5);  Go to slot selection
 
} else {
  alert(data.message || "Failed to save details");
}

  } catch (err) {
    setLoading(false);
    alert("Error saving details");
  }
};

const handleSubmit = async () => {
  try {
    setLoading(true);
    const res = await fetch(`https://amjacademy.onrender.com/complete-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
       id: formData.id,
    name: formData.name,
    email: formData.email,
    PhoneNumber: formData.PhoneNumber,
    selectedDate: formData.selectedDate,
    selectedTime: formData.selectedTime,
    registrationData: formData 
      })
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Registration completed successfully!");
      onClose();
    } else {
      alert(data.message || "Failed to complete registration");
    }
  } catch (err) {
    setLoading(false);
    alert("Error completing registration");
  }
};

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setRegistrationType("")
      setFormData({
        phone: "",
        email: "",
        otp: ["", "", "", "", "", ""],
        name: "",
        age: "",
        experience: "",
        instrument: "",
        address: "",
        parentName: "",
        PhoneNumber: "",
        selectedDate: "",
        selectedTime: "",
        location: "AMJ Academy Main Center",
      })
    }
  }, [isOpen])

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
            <div className="step-icon">📱</div>
            <span>Contact</span>
          </div>
          <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
            <div className="step-icon">✓</div>
            <span>Verify</span>
          </div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
            <div className="step-icon">✅</div>
            <span>OTP</span>
          </div>
          <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
            <div className="step-icon">ℹ</div>
            <span>Details</span>
          </div>
          <div className={`step ${currentStep >= 5 ? "active" : ""}`}>
            <div className="step-icon">📅</div>
            <span>Schedule</span>
          </div>
          <div className={`step ${currentStep >= 6 ? "active" : ""}`}>
            <div className="step-icon">📋</div>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="registration-content">
          {/* Step 1: Choose Registration Method */}
          {currentStep === 1 && (
            <div className="step-content">
              <h2>SCHEDULE DEMO CLASS</h2>
              <p className="step-subtitle">
                <span className="music-icon">🎼</span>
                Choose your preferred registration method
              </p>

              <div className="registration-options">
                <div className="option-card1" onClick={() => handleRegistrationTypeSelect1("whatsapp")}>
                  <div className="option-icon1">📱</div>
                  <h3>WhatsApp Number</h3>
                  <p>Quick registration with WhatsApp verification is not applicable</p>
                </div>

                <div className="option-card" onClick={() => handleRegistrationTypeSelect("email")}>
                  <div className="option-icon">📧</div>
                  <h3>Email Address</h3>
                  <p>Register using your email address</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Verification */}
          {currentStep === 2 && (
            <div className="step-content">
              <h2>Contact & Verification</h2>
              <p className="step-subtitle">
                <span className="music-icon">📱</span>
                Enter your contact details and verify
              </p>

              {registrationType === "whatsapp" ? (
                <div className="input-group">
                  <label>WhatsApp Number</label>
                  <div className="phone-input">
                    <select className="country-code" value={countryCode} onChange={handleCountryCodeChange}>
                      {countryCodes.map((country, index) => (
                        <option key={index} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter 10-digit WhatsApp Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                  </div>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              ) : (
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              )}

             {/*  <div className="input-group">
                <button 
                  className="primary-btn" 
                 onClick={sendOtp}
                  disabled={registrationType === "whatsapp" ? !isPhoneValid() : !isEmailValid() || loading}
                >
                  
                  {loading ? "Sending..." : "GET VERIFICATION CODE"}
                </button>
              </div> */}

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                <button className="primary-btn" onClick={sendOtp} disabled={registrationType === "whatsapp" ? !isPhoneValid() : !isEmailValid() || loading} >
                 {loading ? "Sending..." : "GET VERIFICATION CODE"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verification Code */}
          {currentStep === 3 && (
            <div className="step-content">
              <h2>Enter Verification Code</h2>
              <p className="step-subtitle">
                <span className="music-icon">✓</span>
                Enter the 6-digit code sent to your {registrationType === "whatsapp" ? "WhatsApp" : "email"}
              </p>

              <div className="input-group">
                <label>Verification Code</label>
                <div className="verification-code">
                  {formData.otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-input"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                  ))}
                </div>
                {errors.otp && <span className="error-message">{errors.otp}</span>}
              </div>

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                <button 
                  className="primary-btn" 
                  disabled={!isOtpComplete()}
                  onClick={verifyOtp}
                >
                  Verify & Continue
                </button>
              </div>

              <div className="alternative-option">
                <p>Didn't receive code?</p>
                <button className="link-btn">Resend Code</button>
              </div>
            </div>
          )}

          {/* Step 4: Personal Details */}
          {currentStep === 4 && (
            <div className="step-content">
              <h2>Personal Information</h2>
              <p className="step-subtitle">
                <span className="music-icon">👤</span>
                Tell us about yourself and your musical interests
              </p>

              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Age Group *</label>
                  <select 
                    name="age" 
                    value={formData.age} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">Select Age Range</option>
                    <option value="5-7">5-7 years</option>
                    <option value="8-12">8-12 years</option>
                    <option value="13-17">13-17 years</option>
                    <option value="18-30">18-30 years</option>
                    <option value="31-50">31-50 years</option>
                    <option value="50+">50+ years</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Preferred Instrument *</label>
                  <select name="instrument" value={formData.instrument} onChange={handleInputChange} required>
                    <option value="">Select Instrument</option>
                    <option value="piano">Piano</option>
                    <option value="keyboard">Keyboard</option>
                    {/* <option value="both">Both Piano & Keyboard</option> */}
                  </select>
                </div>

                <div className="input-group">
                  <label>Musical Experience *</label>
                  <select name="experience" value={formData.experience} onChange={handleInputChange} required>
                    <option value="">Select Experience Level</option>
                    <option value="complete-beginner">Complete Beginner</option>
                    <option value="some-experience">Some Experience</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="returning">Returning to Music</option>
                  </select>
                </div>

                <div className="input-group full-width">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="input-group">
                  <label>Parent/Guardian Name</label>
                  <input
                    type="text"
                    name="parentName"
                    placeholder="Parent/Guardian name"
                    value={formData.parentName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="input-group">
                  <label>Enter Phone Number with country code</label>
                  <div className="phone-input">
                    {/* <select 
                      className="country-code" 
                      value={countryCode} 
                      onChange={handleCountryCodeChange}
                    >
                      {countryCodes.map((country, index) => (
                        <option key={index} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </select> */}
                    <input
                      type="tel"
                      name="PhoneNumber"
                      placeholder="+916380765665"
                      value={formData.PhoneNumber}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Always ensure it starts with '+'
                        if (!value.startsWith("+")) {
                          value = "+" + value.replace(/^\+/, ""); 
                        }

                        // Allow only digits after +
                        value = "+" + value.substring(1).replace(/[^0-9]/g, "");

                        setFormData({ ...formData, PhoneNumber: value });
                      }}
                      maxLength="15"   // reasonable limit for international numbers
                      inputMode="numeric"
                      pattern="^\+[0-9]*$"  // ensures + followed by digits only
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                
                <button className="primary-btn" onClick={handleSaveDetails} disabled={loading}>
                  {loading ? "Saving..." : "Next"}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Schedule Demo Class */}
          {currentStep === 5 && (
            <div>
            <div className="step-content">
              <h2>Schedule Your Demo Class</h2>
              <p className="step-subtitle">
                <span className="music-icon">📅</span>
                Choose your preferred date and time for a free demo class
              </p>

              <div className="scheduling-section">
                <div className="date-selection">
                  <h3>Select Date</h3>
                  <div className="date-cards">
                    {availableDays.map((day, index) => (
                      <div
                        key={index}
                        className={`date-card ${formData.selectedDate === day.date ? "selected" : ""}`}
                        onClick={() => setFormData({ ...formData, selectedDate: day.date })}
                      >
                        <div className="day-name">{day.day}</div>
                        <div className="day-number">{day.dayNum}</div>
                        <div className="month-name">{day.month}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="time-selection">
                  <h3>Select Time (IST) Bsaed on Selected Date</h3>
                  <div className="time-slots">
                    {timeSlots.map((time, index) => (
                      <button
                      key={index}
                      className={`time-slot ${formData.selectedTime === time ? "selected" : ""}`}
                      onClick={() => { if (!formData.selectedDate) {
                                           alert("Please select a date first.");
                                          return;
                                         }
  // Just store the selection locally — no API call here
                      setFormData(prev => ({
                                            ...prev,
                                            selectedTime: time
                                          }));
                                          }}

                      disabled={slotStatus[time] && slotStatus[time] !== "open"}>
                      {time} {slotStatus[time] === "blocked" ? "(Blocked)" : slotStatus[time] === "booked" ? "(Booked)" : ""}
                          </button>
                    ))}
                  </div>
                </div>

                <div className="location-info">
                  <h3>Location</h3>
                  <div className="location-card">
                    <div className="location-icon">📍</div>
                    <p className="location-details">
                      <h>AMJ Academy (Remote) </h>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                <button
                //handleNextStep
                  className="primary-btn"
                  onClick={async () => {
  if (!formData.selectedDate || !formData.selectedTime) {
    alert("Please select a date and time slot before continuing.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("https://amjacademy.onrender.com/update-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: formData.id,
           name: formData.name, 
        selectedDate: formData.selectedDate,
        selectedTime: formData.selectedTime
      })
    });
    const data = await res.json();
    if (data.success) {
      handleNextStep();
      //setCurrentStep(6); // move to review
    } else {
      alert(data.message || "Failed to block slot.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  } finally {
    setLoading(false);
  }
}}
                  disabled={!formData.selectedDate || !formData.selectedTime}
                >
                  {loading ? "Saving..." : "Review Details"}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Review and Submit */}
          {currentStep === 6 && (
            <div className="step-content">
              <h2>Review Your Registration</h2>
              <p className="step-subtitle">
                <span className="music-icon">📋</span>
                Please review your details before submitting
              </p>

              <div className="review-sections">
                <div className="review-section">
                  <h3>Contact Information</h3>
                  <div className="review-item">
                    <span className="label">{registrationType === "whatsapp" ? "WhatsApp:" : "Email:"}</span>
                    <span className="value">{registrationType === "whatsapp" ? formData.phone : formData.email}</span>
                  </div>
                </div>

                <div className="review-section">
                  <h3>Personal Details</h3>
                  <div className="review-item">
                    <span className="label">Name:</span>
                    <span className="value">{formData.name}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Age Group:</span>
                    <span className="value">{formData.age}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Instrument:</span>
                    <span className="value">{formData.instrument}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Experience:</span>
                    <span className="value">{formData.experience}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Phone:</span>
<span className="value">{countryCode} {formData.PhoneNumber ? formData.PhoneNumber : ''}</span>
                  </div>
                  {formData.parentName && (
                    <div className="review-item">
                      <span className="label">Parent/Guardian:</span>
                      <span className="value">{formData.parentName}</span>
                    </div>
                  )}
                </div>

                <div className="review-section">
                  <h3>Demo Class Schedule</h3>
                  <div className="review-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(formData.selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="label">Time:</span>
                    <span className="value">{formData.selectedTime}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Location:</span>
                    <span className="value">{formData.location}</span>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button className="secondary-btn" onClick={handlePrevStep}>
                  Back
                </button>
                <button className="primary-btn submit-btn" onClick={handleSubmit}>
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

export default RegistrationEnhanced
