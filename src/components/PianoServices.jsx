"use client"
import { useNavigate } from 'react-router-dom';
import "./Services.css"

const PianoServices = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    if (module === "live") {
      navigate("/piano-lessons");
      window.scrollTo(0, 0);
    } else if (module === "recorded") {
      navigate("/recorded-classes");
      window.scrollTo(0, 0);
    }
  }

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="services-header">
          <h2>Piano and Keyboard Classes</h2>
          <p>Choose between live interactive sessions or recorded classes at your own pace.</p>
        </div>

        <div className="services-grid">
          {/* Live Piano and Keyboard Lessons */}
          <div
            className="service-card clickable"
            onClick={() => handleModuleClick("live")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleModuleClick("live")
              }
            }}
          >
            <div className="service-icon">
              <div className="icon-wrapper">🎹</div>
            </div>
            <h3>Live Piano and Keyboard Classes</h3>
            <p>1:1 professional teachings and Group teaching to enhance your skill level in music goal</p>
            <div className="service-features">
              <div className="feature">✨ Personalized Learning</div>
              <div className="feature">🎵 All Skill Levels</div>
              <div className="feature">👥 Group & Individual</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>

          {/* Recorded Piano and Keyboard Classes */}
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
        </div>

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

export default PianoServices
