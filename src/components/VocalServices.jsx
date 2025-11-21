"use client"
import { useNavigate } from 'react-router-dom';
import "./Services.css"

const VocalServices = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    if (module === "live") {
      navigate("/vocal-lessons");
      window.scrollTo(0, 0);
    } else if (module === "recorded") {
      navigate("/recorded-vocal-classes");
      window.scrollTo(0, 0);
    }
  }

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="services-header">
          <h2>Vocal Classes</h2>
          <p>Choose between live interactive sessions or recorded classes at your own pace.</p>
        </div>

        <div className="services-grid">
          {/* Live Vocal Classes */}
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
              <div className="icon-wrapper">🎤</div>
            </div>
            <h3>Live Vocal Classes</h3>
            <p>Professional vocal training with personalized coaching and performance techniques.</p>
            <div className="service-features">
              <div className="feature">🎵 Voice Training</div>
              <div className="feature">🎼 Music Theory</div>
              <div className="feature">🎤 Performance Skills</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>

          {/* Recorded Vocal Classes */}
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
            <h3>Recorded Vocal Classes</h3>
            <p>Master vocal techniques with comprehensive recorded lessons and exercises.</p>
            <div className="service-features">
              <div className="feature">🎯 Beginner to Advance</div>
              <div className="feature">📱 Learn at Your Pace</div>
              <div className="feature">🔄 Lifetime Access</div>
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

export default VocalServices
