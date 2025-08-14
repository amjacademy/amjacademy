"use client"

import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import "./PianoLessons.css"

export default function PianoLessonsLanding() {
  const navigate = useNavigate()
  const [selectedLevel, setSelectedLevel] = useState("Beginner")
  const [selectedPlan, setSelectedPlan] = useState("Companion")

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
          type: "Companion",
          badge: "No Cost EMI*",
          originalPrice: "₹2,964",
          currentPrice: "₹2,464*",
          discount: "28% OFF",
          features: [
            "1:2 Session",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
        {
          type: "Individual",
          badge: "No Cost EMI*",
          originalPrice: "₹3,460",
          currentPrice: "₹2,960*",
          discount: "28% OFF",
          features: [
            "1:1 Session",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
          popular: true,
        },
        {
          type: "Group",
          badge: "No Cost EMI*",
          originalPrice: "₹2,460",
          currentPrice: "₹1,960*",
          discount: "28% OFF",
          features: [
            "1:4 Session",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
      ],
      Intermediate: [
        {
          type: "Companion",
          badge: "No Cost EMI*",
          originalPrice: "₹3,420",
          currentPrice: "₹2,920*",
          discount: "28% OFF",
          features: [
            "1:2 Sessions",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
        {
          type: "Individual",
          badge: "No Cost EMI*",
          originalPrice: "₹3,980",
          currentPrice: "₹3,480*",
          discount: "28% OFF",
          features: [
            "1:1 Session",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
          popular: true,
        },
        {
          type: "Group",
          badge: "No Cost EMI*",
          originalPrice: "₹3,020",
          currentPrice: "₹2,520*",
          discount: "28% OFF",
          features: [
            "1:4 Session",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
      ],
      Advanced: [
        {
          type: "Companion",
          badge: "No Cost EMI*",
          originalPrice: "₹4,280",
          currentPrice: "₹3,680*",
          discount: "28% OFF",
          features: [
            "1:2 Session ",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
        {
          type: "Individual",
          badge: "No Cost EMI*",
          originalPrice: "₹4,700",
          currentPrice: "₹4,200*",
          discount: "28% OFF",
          features: [
            "1:1 Session ",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
          popular: true,
        },
        {
          type: "Group",
          badge: "No Cost EMI*",
          originalPrice: "₹3,740",
          currentPrice: "₹3,240*",
          discount: "28% OFF",
          features: [
            "1:4 Session ",
            "8 live sessions per month",
            "Interactive Live Sessions, Access to Learning Resources",
          ],
        },
      ],
    }
    return basePlans[level] || basePlans.Advanced
  }

  const handleBookDemo = () => {
    navigate('/registration')
    window.scrollTo(0, 0)
  }

  const handleEnrollClick = (planType, level) => {
    navigate('/registration')
    window.scrollTo(0, 0)
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
              <button className="cta-button" onClick={handleBookDemo}>
                Book a free demo
              </button>
              <div className="price-info">
                <span className="current-price">₹0</span>
                <span className="original-price">₹360</span>
                <span className="price-text">for the first class - 100% Free</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img src="images/Flux_Dev_create_an_image_for_amjacademy_featuring_a_real_human_1 (1).jpg?height=400&width=500" alt="Child playing keyboard" className="hero-img" />
          </div>
        </div>
      </section>

      {/* About the Course */}
      <section className="about-section1">
        <div className="about-content1">
          <h2 className="section-title">About the course</h2>
          <p className="about-text">
            In association with Trinity College London, our online Piano and Keyboard lessons
             are designed by seasoned musicians to guide your child's first steps in music. 
             This program lays a strong musical foundation and prepares young learners for
              Trinity's graded examinations.
          </p>

          <div className="tab-buttons">
            <button
              className={`tab-button ${selectedLevel === "OVERVIEW" ? "active" : ""}`}
              onClick={() => {
                setSelectedLevel("OVERVIEW")
                document.querySelector('.pricing-section')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
            >
              OVERVIEW
            </button>
            <button
              className={`tab-button ${selectedLevel === "CURRICULUM" ? "active" : ""}`}
              onClick={() => {
                setSelectedLevel("CURRICULUM")
                document.getElementById('course-details')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
            >
              CURRICULUM
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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

          <div className="pricing-info">
            <p>• All listed rates are exclusive of GST</p>
            <p>• *No-cost EMI options are available for select credit & debit cards</p>
            <p>
              • The above pricing is applicable for classes scheduled between 3:00 PM and 8:00 PM (Indian Standard Time
              IST). Classes outside these hours may incur surcharges.
            </p>
            <p>
              • For any queries, please contact us with{" "}
              <span className="contact-number">+91 9171719881</span>
            </p>
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
                    src={review.avatar || "/placeholder.svg?height=50&width=50"}
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
    </div>
  )
}
