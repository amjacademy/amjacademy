"use client"

import { useState } from "react"
import "./PianoLessons.css"
import RegistrationModal from "./RegistrationModal"

export default function PianoLessonsLanding() {
  const [selectedLevel, setSelectedLevel] = useState("Advanced")
  const [selectedPlan, setSelectedPlan] = useState("Buddy")
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [enrollmentData, setEnrollmentData] = useState({ plan: "", level: "" })

  const courseFeatures = [
    {
      icon: "📚",
      title: "Progressive International Curriculum",
      description:
        "Affiliated with Trinity College London, our curriculum follows a structured path from beginner to advanced levels with original music.",
    },
    {
      icon: "🎵",
      title: "Learning Made Fun",
      description:
        "Live lessons filled with musical games and activities, making learning enjoyable with interactive techniques.",
    },
    {
      icon: "🎯",
      title: "Practical and Theory Focus",
      description:
        "All songs along with the theoretical concepts and techniques are taught to build strong musical foundations.",
    },
    {
      icon: "👥",
      title: "Kid Friendly & Trending Songs",
      description:
        "Curated kid-friendly songs and trending music suitable for beginners, teens, and advanced for continuous practice.",
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      description:
        "Make your child's progress visible with Trinity sessions and feedback to monitor their musical progress every month.",
    },
    {
      icon: "🏆",
      title: "International Certifications",
      description:
        "Make your child a certified musician with Trinity College London's globally valued exams and certifications.",
    },
  ]

  const getPricingPlans = (level) => {
    const basePlans = {
      Beginner: [
        {
          type: "Group",
          badge: "No Cost EMI*",
          students: "3-6 kids per batch",
          originalPrice: "₹350",
          currentPrice: "₹288*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "6 live sessions per month",
            "Basic Keyboard Introduction",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
        {
          type: "Buddy",
          badge: "No Cost EMI*",
          students: "2 kids per batch",
          originalPrice: "₹550",
          currentPrice: "₹451*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "6 live sessions per month",
            "Basic Keyboard Introduction",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
          popular: true,
        },
        {
          type: "Individual",
          badge: "No Cost EMI*",
          students: "1 kid per batch",
          originalPrice: "₹750",
          currentPrice: "₹615*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "6 live sessions per month",
            "Basic Keyboard Introduction",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
      ],
      Intermediate: [
        {
          type: "Group",
          badge: "No Cost EMI*",
          students: "3-6 kids per batch",
          originalPrice: "₹450",
          currentPrice: "₹368*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "8 live sessions per month",
            "Intermediate Techniques",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
        {
          type: "Buddy",
          badge: "No Cost EMI*",
          students: "2 kids per batch",
          originalPrice: "₹650",
          currentPrice: "₹533*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "8 live sessions per month",
            "Intermediate Techniques",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
          popular: true,
        },
        {
          type: "Individual",
          badge: "No Cost EMI*",
          students: "1 kid per batch",
          originalPrice: "₹850",
          currentPrice: "₹697*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "8 live sessions per month",
            "Intermediate Techniques",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
      ],
      Advanced: [
        {
          type: "Group",
          badge: "No Cost EMI*",
          students: "3-6 kids per batch",
          originalPrice: "₹550",
          currentPrice: "₹451*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "10 live sessions per month",
            "Advanced Compositions",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
        {
          type: "Buddy",
          badge: "No Cost EMI*",
          students: "2 kids per batch",
          originalPrice: "₹750",
          currentPrice: "₹615*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "10 live sessions per month",
            "Advanced Compositions",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
          popular: true,
        },
        {
          type: "Individual",
          badge: "No Cost EMI*",
          students: "1 kid per batch",
          originalPrice: "₹950",
          currentPrice: "₹779*",
          discount: "18% OFF",
          features: [
            "Partner - 1-2 Sessions",
            "10 live sessions per month",
            "Advanced Compositions",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
      ],
    }
    return basePlans[level] || basePlans.Advanced
  }

  const handleEnrollClick = (planType, level) => {
    setEnrollmentData({ plan: planType, level: level })
    setShowRegistrationModal(true)
  }

  const reviews = [
    {
      name: "Faith & Philip",
      location: "Canada",
      avatar: "/placeholder.svg?height=50&width=50",
      review:
        "I wanted to take a moment to provide feedback on the keyboard lessons my kids have been taking. The instructor has been fantastic, and I'm thoroughly impressed with the lessons so far. My kids have really enjoyed the lessons so far. They've...",
    },
    {
      name: "Ashwini Mohan",
      location: "Canada",
      avatar: "/placeholder.svg?height=50&width=50",
      review:
        "I'm very happy with my decision to enroll my kid in keyboard classes with Talent Gum. The teacher is very patient and understanding with kids and we got helpful class reminders. My...",
    },
    {
      name: "Shreya Bhalla",
      location: "Bahrain",
      avatar: "/placeholder.svg?height=50&width=50",
      review:
        "We are extremely satisfied with the online keyboard classes. The teacher is very patient and the way she teaches is incredible. My daughter loves attending and it's incredible to watch her grow and develop her...",
    },
  ]

  return (
    <div className="piano-lessons-container">
      {/* Animated Background Elements */}
      <div className="animated-bg">
        <div className="floating-note note-1">♪</div>
        <div className="floating-note note-2">♫</div>
        <div className="floating-note note-3">♪</div>
        <div className="floating-note note-4">♫</div>
        <div className="floating-note note-5">♪</div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-elements">
          <div className="bg-wave wave-1"></div>
          <div className="bg-wave wave-2"></div>
          <div className="bg-wave wave-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Online Keyboard And Piano Classes for Kids</h1>
            <p className="hero-subtitle">Enter the world of Music and play magical tunes on Piano!</p>
            <div className="hero-actions">
              <button className="cta-button" onClick={() => setShowRegistrationModal(true)}>
                Book a free demo
              </button>
              <div className="price-info">
                <span className="current-price">₹368</span>
                <span className="original-price">₹0</span>
                <span className="price-text">for the first class - 100% Free</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img src="/placeholder.svg?height=400&width=500" alt="Child playing keyboard" className="hero-img" />
          </div>
        </div>
      </section>

      {/* About the Course */}
      <section className="about-section1">
        <div className="about-content1">
          <h2 className="section-title">About the course</h2>
          <p className="about-text">
            Affiliated with Trinity College London, our online Keyboard & Piano classes have been crafted by expert
            musicians to help your little one start their music journey! This course will help kids to build a robust
            foundation in music and get them started on the path to Trinity's graded exams.
          </p>
          <p className="about-text">
            With our interactive live sessions, students will not only be able to play popular Bollywood and Western
            songs confidently but will also learn Music Theory with engaging games and activities ensuring a high fun
            quotient in every class. Our expert teachers will provide personalised attention and give continuous
            feedback to the learners while also mapping their progress throughout the course.
          </p>

          <div className="tab-buttons">
            <button
              className={`tab-button ${selectedLevel === "OVERVIEW" ? "active" : ""}`}
              onClick={() => setSelectedLevel("OVERVIEW")}
            >
              OVERVIEW
            </button>
            <button
              className={`tab-button ${selectedLevel === "CURRICULUM" ? "active" : ""}`}
              onClick={() => setSelectedLevel("CURRICULUM")}
            >
              CURRICULUM
            </button>
          </div>
        </div>
      </section>

      {/* Course Details Stats */}
      <section className="stats-section">
        <div className="stats-content">
          <h2 className="section-title">Course Details</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number purple">96</div>
              <div className="stat-label">Guided Sessions</div>
              <div className="stat-sublabel">over 12 Months</div>
            </div>
            <div className="stat-item">
              <div className="stat-number blue">03</div>
              <div className="stat-label">Years of Syllabus</div>
              <div className="stat-sublabel">(3-1 / 1-2 or 1-3)</div>
            </div>
            <div className="stat-item">
              <div className="stat-number green">50+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number orange">6000+</div>
              <div className="stat-label">Active Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Will Receive */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="section-title">What you will receive</h2>
          <div className="features-grid">
            {courseFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-header">
                  <span className="feature-icon">{feature.icon}</span>
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Style Selection */}
      <section className="pricing-section">
        <div className="pricing-content">
          <div className="pricing-header">
            <h2 className="section-title">Choose Your Child's Learning Style</h2>
            <p className="pricing-subtitle">
              Select the session format that best fits your child's individual learning needs.
            </p>
          </div>

          <div className="level-buttons">
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <button
                key={level}
                className={`level-button ${selectedLevel === level ? "active" : ""}`}
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="pricing-grid">
            {getPricingPlans(selectedLevel).map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? "popular" : ""}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}

                <div className="plan-header">
                  <div className="plan-type">
                    <span className="users-icon">👥</span>
                    <span className="plan-name">{plan.type}</span>
                  </div>
                  <div className="plan-badge">{plan.badge}</div>
                  <p className="plan-students">{plan.students}</p>
                </div>

                <div className="plan-pricing">
                  <div className="price-display">
                    <span className="current-price">{plan.currentPrice}</span>
                    <span className="original-price">{plan.originalPrice}</span>
                  </div>
                  <div className="discount-badge">{plan.discount}</div>
                </div>

                <div className="plan-features">
                  <h4 className="features-title">What's included:</h4>
                  <ul className="features-list">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="feature-item">
                        <span className="check-icon">✓</span>
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`enroll-button ${plan.popular ? "popular-button" : ""}`}
                  onClick={() => handleEnrollClick(plan.type, selectedLevel)}
                >
                  Enroll Now
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="pricing-info">
            <p>• All listed rates are exclusive of GST</p>
            <p>• *No-cost EMI options are available for select credit & debit cards</p>
            <p>
              • The above pricing is applicable for classes scheduled between 3:00 PM and 8:00 PM (Indian Standard Time
              IST). Classes outside these hours may incur surcharges.
            </p>
            <p>
              • For any queries, please contact us via WhatsApp at{" "}
              <span className="contact-number">+91 9958137502</span>
            </p>
          </div>
        </div>
      </section>

      {/* Meet Your Teachers */}
      <section className="teachers-section">
        <div className="teachers-content">
          <h2 className="section-title">Meet your teachers</h2>
          <div className="teacher-card">
            <div className="teacher-image">
              <img src="/placeholder.svg?height=150&width=150" alt="Music Teacher" className="teacher-img" />
            </div>
            <div className="teacher-info">
              <p className="teacher-description">
                Vivek is a professional music facilitator teaching Keyboard/Piano, Guitar and Ukulele for over 3 years.
                He prepares students for Trinity and ABRSM grade examinations and has been conducting online music
                sessions for students across the globe. He has been a part of all age groups starting from 3-65 (3-65
                years) all across the globe. His teaching approach is fun and easy ensuring that every student falls in
                love with their instrument.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-content">
          <h2 className="section-title">Reviews from Parents</h2>
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <img
                    src={review.avatar || "/placeholder.svg?height=50&width=50&query=parent profile picture"}
                    alt={review.name}
                    className="reviewer-avatar"
                  />
                  <div className="reviewer-info">
                    <h4 className="reviewer-name">{review.name}</h4>
                    <p className="reviewer-location">
                      <span className="location-icon">🌍</span>
                      {review.location}
                    </p>
                  </div>
                </div>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="star">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="review-text">{review.review}</p>
                <button className="read-more-btn">Read More</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        selectedPlan={enrollmentData.plan}
        selectedLevel={enrollmentData.level}
      />
    </div>
  )
}
