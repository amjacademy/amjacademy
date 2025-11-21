"use client"
import { useNavigate } from 'react-router-dom';
import "./Services.css"

const Services = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    // Use React Router for navigation
    if (module === "piano") {
      navigate("/piano-services");
      window.scrollTo(0, 0);
    } else if (module === "recorded") {
      navigate("/recorded-classes");
      window.scrollTo(0, 0);
    } else if (module === "hindi") {
      navigate("/hindi-classes");
      window.scrollTo(0, 0);
    } else if (module === "vocal") {
      navigate("/vocal-classes");
      window.scrollTo(0, 0);
    }
  }

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="services-header">
          <h2>Courses We Offer</h2>
          <p>Personalized music training designed around your goals and ambitions.</p>
        </div>

        <div className="services-grid">
          {/* Piano and Keyboard Lessons */}
          <div
            className="service-card clickable"
            onClick={() => handleModuleClick("piano")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleModuleClick("piano")
              }
            }}
          >
            <div className="service-icon">
              <div className="icon-wrapper">🎹</div>
            </div>
            <h3>Piano and Keyboard Classes</h3>
            <p>1:1 professional teachings and Group teaching to enhance your skill level in music goal</p>
            <div className="service-features">
              <div className="feature">✨ Personalized Learning</div>
              <div className="feature">🎵 All Skill Levels</div>
              <div className="feature">👥 Group & Individual</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>

          {/* Music Theory & Composition */}
          <div className="service-card">
            <div className="service-icon">
              <div className="icon-wrapper">🎵</div>
           </div>
              <h3>Coding Classes</h3>
              <p>Learn programming from basics to advanced with hands-on projects.</p>
              <div className="service-features">
                <div className="feature">💻 Programming Fundamentals</div>
                <div className="feature">🌐 Web Development</div>
                <div className="feature">🤖 AI & Data Science Basics</div>
              </div>
              <div className="coming-soon">Coming Soon</div>
           </div>

          {/* Recorded Classes */}
          <div
            className="service-card clickable"
            onClick={() => handleModuleClick("recorded")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleModuleClick("recorded")
              }
            }}
          >
            <div className="service-icon">
              <div className="icon-wrapper">💻</div>
            </div>
            <h3>Recorded Piano and Keyboard Classes</h3>
            <p>Build confidence and stage presence for recitals and competitions.</p>
            <div className="service-features">
              <div className="feature">🎯 Beginner to Advance</div>
              <div className="feature">🎼 Classical & Contemporary</div>
              <div className="feature">📱 Learn at Your Pace</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>

          {/* Hindi Classes */}
          <div
            className="service-card clickable"
            onClick={() => handleModuleClick("hindi")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleModuleClick("hindi")
              }
            }}
          >
            <div className="service-icon">
              <div className="icon-wrapper">📖</div>
            </div>
            <h3>Hindi Classes</h3>
            <p>Master the Hindi language with interactive lessons and cultural insights.</p>
            <div className="service-features">
              <div className="feature">🗣️ Spoken Hindi</div>
              <div className="feature">📝 Writing Skills</div>
              <div className="feature">🎭 Cultural Context</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>

          {/* Vocal Classes */}
          <div
            className="service-card clickable"
            onClick={() => handleModuleClick("vocal")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleModuleClick("vocal")
              }
            }}
          >
            <div className="service-icon">
              <div className="icon-wrapper">🎤</div>
            </div>
            <h3>Vocal Classes</h3>
            <p>Develop your singing voice with professional vocal training and techniques.</p>
            <div className="service-features">
              <div className="feature">🎵 Voice Training</div>
              <div className="feature">🎼 Music Theory</div>
              <div className="feature">🎤 Performance Skills</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>
        </div>

        {/* Animated Musical Elements */}
        {/* <div className="services-musical-elements">
          <div className="services-note services-note-1">🎵</div>
          <div className="services-note services-note-2">🎶</div>
          <div className="services-note services-note-3">♪</div>
          <div className="services-note services-note-4">♫</div>
          <div className="services-note services-note-5">🎼</div>
          <div className="services-note services-note-6">🎹</div>
        </div> */}

        {/* Floating Colorful Elements */}
        <div className="services-floating-elements">
          <div className="services-circle services-circle-1"></div>
          <div className="services-circle services-circle-2"></div>
          <div className="services-circle services-circle-3"></div>
          <div className="services-circle services-circle-4"></div>
          <div className="services-circle services-circle-5"></div>
          <div className="services-circle services-circle-6"></div>
          <div className="services-circle services-circle-7"></div>
          <div className="services-circle services-circle-8"></div>
        </div>
      </div>
    </section>
  )
}

export default Services
