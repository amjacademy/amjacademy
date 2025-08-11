"use client"
import "./PianoLessons.css"

const PianoLessons = () => {
  return (
    <div className="piano-lessons-page">
      {/* Hero Section */}
      <section className="piano-hero">
        <div className="container">
          <div className="piano-hero-content">
            <div className="piano-hero-text">
              <h1>Piano & Keyboard Lessons</h1>
              <p>
                Master the art of piano and keyboard with our comprehensive lessons designed for all skill levels. From
                classical techniques to contemporary styles, discover your musical potential with personalized
                instruction that adapts to your learning pace and goals.
              </p>
              <div className="piano-features">
                <div className="feature-item">
                  <span className="feature-icon">🎹</span>
                  <span>Classical & Contemporary</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎵</span>
                  <span>All Skill Levels</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">👨‍🏫</span>
                  <span>Expert Instruction</span>
                </div>
              </div>
            </div>
            <div className="piano-hero-image">
              <div className="piano-image-container">
                <img src="/placeholder.svg?height=400&width=400&text=Piano+Lessons" alt="Piano Lessons" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Options Section */}
      <section className="class-options">
        <div className="container">
          <h2 className="section-title">Choose Your Learning Style</h2>
          <div className="options-grid">
            {/* 1:1 Individual Classes */}
            <div className="option-card">
              <div className="option-header">
                <div className="option-icon">👤</div>
                <h3>1:1 Individual Classes</h3>
              </div>
              <div className="option-content">
                <div className="price-section">
                  <div className="price">
                    ₹800<span>/session</span>
                  </div>
                  <div className="duration">60 minutes per session</div>
                </div>
                <div className="features-list">
                  <h4>What's Included:</h4>
                  <ul>
                    <li>✅ Personalized lesson plans</li>
                    <li>✅ One-on-one attention</li>
                    <li>✅ Flexible scheduling</li>
                    <li>✅ Progress tracking</li>
                    <li>✅ Custom repertoire selection</li>
                    <li>✅ Technique refinement</li>
                  </ul>
                </div>
                <div className="instructions">
                  <h4>Instructions:</h4>
                  <p>
                    Perfect for focused learning and rapid progress. Lessons are tailored to your specific goals,
                    whether you're preparing for exams, competitions, or personal enjoyment.
                  </p>
                </div>
                <button className="btn btn-primary">Book Individual Class</button>
              </div>
            </div>

            {/* Group Classes */}
            <div className="option-card">
              <div className="option-header">
                <div className="option-icon">👥</div>
                <h3>Group Classes</h3>
              </div>
              <div className="option-content">
                <div className="price-section">
                  <div className="price">
                    ₹400<span>/session</span>
                  </div>
                  <div className="duration">90 minutes per session</div>
                  <div className="group-size">Maximum 4 students</div>
                </div>
                <div className="features-list">
                  <h4>What's Included:</h4>
                  <ul>
                    <li>✅ Interactive group learning</li>
                    <li>✅ Peer motivation</li>
                    <li>✅ Ensemble playing</li>
                    <li>✅ Music theory sessions</li>
                    <li>✅ Group performances</li>
                    <li>✅ Cost-effective learning</li>
                  </ul>
                </div>
                <div className="instructions">
                  <h4>Instructions:</h4>
                  <p>
                    Learn alongside peers in a fun, collaborative environment. Great for building confidence, making
                    friends, and enjoying music together while maintaining quality instruction.
                  </p>
                </div>
                <button className="btn btn-secondary">Join Group Class</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Elements */}
      <div className="piano-musical-elements">
        <div className="piano-note piano-note-1">🎹</div>
        <div className="piano-note piano-note-2">🎵</div>
        <div className="piano-note piano-note-3">♪</div>
        <div className="piano-note piano-note-4">♫</div>
      </div>
    </div>
  )
}

export default PianoLessons
