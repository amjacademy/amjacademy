"use client"
import "./RecordedClasses.css"

const RecordedClasses = () => {
  return (
    <div className="recorded-classes-page">
      {/* Hero Section */}
      <section className="recorded-hero">
        <div className="container">
          <div className="recorded-hero-content">
            <div className="recorded-hero-text">
              <h1>Recorded Classes</h1>
              <p>
                Learn at your own pace with our comprehensive recorded lessons. Perfect for busy schedules, these
                self-paced courses offer the same quality instruction as our live classes, available 24/7 for your
                convenience. Build confidence and master techniques from beginner to advanced levels.
              </p>
              <div className="recorded-features">
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Learn Anytime, Anywhere</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Self-Paced Learning</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏆</span>
                  <span>Professional Quality</span>
                </div>
              </div>
            </div>
            <div className="recorded-hero-image">
              <div className="recorded-image-container">
                <img src="images/Recordings.png?height=400&width=400&text=Recorded+Classes" alt="Recorded Classes" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Modules Section */}
      <section className="course-modules">
        <div className="container">
          <h2 className="section-title">Choose Your Level</h2>
          <div className="modules-grid">
            {/* Beginner Module */}
            <div className="module-card">
              <div className="module-header">
                <div className="module-icon">🌱</div>
                <h3>Beginner</h3>
                <div className="level-badge">Level 1-3</div>
              </div>
              <div className="module-content">
                <div className="price-section">
                  <div className="price">
                    ₹2,999<span>/course</span>
                  </div>
                  <div className="duration">20+ Video Lessons</div>
                  <div className="access">6 Months Access</div>
                </div>
                <div className="curriculum">
                  <h4>What You'll Learn:</h4>
                  <ul>
                    <li>✅ Basic finger positioning</li>
                    <li>✅ Simple melodies and scales</li>
                    <li>✅ Reading basic sheet music</li>
                    <li>✅ Rhythm and timing</li>
                    <li>✅ Hand coordination</li>
                    <li>✅ Popular beginner songs</li>
                  </ul>
                </div>
                <div className="bonus-content">
                  <h4>Bonus Materials:</h4>
                  <p>PDF worksheets, practice tracks, and progress assessments included.</p>
                </div>
                <button className="btn btn-beginner">Start Beginner Course</button>
              </div>
            </div>

            {/* Intermediate Module */}
            <div className="module-card featured">
              <div className="popular-badge">Most Popular</div>
              <div className="module-header">
                <div className="module-icon">🎵</div>
                <h3>Intermediate</h3>
                <div className="level-badge">Level 4-6</div>
              </div>
              <div className="module-content">
                <div className="price-section">
                  <div className="price">
                    ₹4,999<span>/course</span>
                  </div>
                  <div className="duration">35+ Video Lessons</div>
                  <div className="access">8 Months Access</div>
                </div>
                <div className="curriculum">
                  <h4>What You'll Learn:</h4>
                  <ul>
                    <li>✅ Advanced chord progressions</li>
                    <li>✅ Music theory fundamentals</li>
                    <li>✅ Classical and contemporary pieces</li>
                    <li>✅ Improvisation techniques</li>
                    <li>✅ Performance skills</li>
                    <li>✅ Pedaling techniques</li>
                  </ul>
                </div>
                <div className="bonus-content">
                  <h4>Bonus Materials:</h4>
                  <p>Advanced sheet music, backing tracks, and monthly live Q&A sessions.</p>
                </div>
                <button className="btn btn-intermediate">Start Intermediate Course</button>
              </div>
            </div>

            {/* Advanced Module */}
            <div className="module-card">
              <div className="module-header">
                <div className="module-icon">🏆</div>
                <h3>Advanced</h3>
                <div className="level-badge">Level 7+</div>
              </div>
              <div className="module-content">
                <div className="price-section">
                  <div className="price">
                    ₹7,999<span>/course</span>
                  </div>
                  <div className="duration">50+ Video Lessons</div>
                  <div className="access">12 Months Access</div>
                </div>
                <div className="curriculum">
                  <h4>What You'll Learn:</h4>
                  <ul>
                    <li>✅ Complex compositions</li>
                    <li>✅ Advanced music theory</li>
                    <li>✅ Professional performance</li>
                    <li>✅ Composition and arrangement</li>
                    <li>✅ Master-level techniques</li>
                    <li>✅ Exam preparation</li>
                  </ul>
                </div>
                <div className="bonus-content">
                  <h4>Bonus Materials:</h4>
                  <p>Master class recordings, personalized feedback, and career guidance.</p>
                </div>
                <button className="btn btn-advanced">Start Advanced Course</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Elements */}
      <div className="recorded-musical-elements">
        <div className="recorded-note recorded-note-1">💻</div>
        <div className="recorded-note recorded-note-2">🎵</div>
        <div className="recorded-note recorded-note-3">📱</div>
        <div className="recorded-note recorded-note-4">🎼</div>
      </div>
    </div>
  )
}

export default RecordedClasses
