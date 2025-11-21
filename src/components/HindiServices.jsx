"use client"
import { useNavigate } from 'react-router-dom';
import "./Services.css"

const HindiServices = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    if (module === "live") {
      navigate("/hindi-lessons");
      window.scrollTo(0, 0);
    } else if (module === "recorded") {
      navigate("/recorded-hindi-classes");
      window.scrollTo(0, 0);
    }
  }

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="services-header">
          <h2>Hindi Classes</h2>
          <p>Choose between live interactive sessions or recorded classes at your own pace.</p>
        </div>

        <div className="services-grid">
          {/* Live Hindi Classes */}
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
              <div className="icon-wrapper">📖</div>
            </div>
            <h3>Live Hindi Classes</h3>
            <p>Interactive Hindi language learning with native speakers and cultural immersion.</p>
            <div className="service-features">
              <div className="feature">🗣️ Spoken Hindi</div>
              <div className="feature">📝 Writing Skills</div>
              <div className="feature">🎭 Cultural Context</div>
            </div>
            <div className="learn-more">Click to Learn More →</div>
          </div>

          {/* Recorded Hindi Classes */}
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
            <h3>Recorded Hindi Classes</h3>
            <p>Comprehensive Hindi language courses with flexible learning options.</p>
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

export default HindiServices
