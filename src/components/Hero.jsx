"use client"
import { useNavigate } from 'react-router-dom';
import "./Hero.css"

const Hero = () => {
  const navigate = useNavigate();

  const scrollToContact = () => {
    const element = document.getElementById("contact")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleBookDemo = () => {
    navigate('/registration'); // Navigate to the registration page
    window.scrollTo(0, 0);
  }

  return (
    <section id="home" className="hero">
      {/* Top Corner Ribbons */}
      <div className="ribbon-left">
        <span>INTRODUCTION TO</span>
      </div>
      <div className="ribbon-center">
        <span>THIS CONVENIENCE IS OPEN FOR 24/7</span>
      </div>
      <div className="ribbon-right">
        <span>ONLINE CLASS</span>
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>"Refining Musicians, Elevating Talent to Timeless Art, and Inspiring Generations."</h1>
            <p>
              Welcome to AMJ Academy – where music brings us together, no matter where you are in the world!
              With 7 years of trusted experience and over 100 delighted students, we’re proud to announce our 
              brand-new online music classes—now available worldwide. Whether you’re a beginner or want to take 
              your skills higher, AMJ Academy welcomes all ages for fun, friendly, and effective music learning from 
              the comfort of your own home.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={scrollToContact}>
                Start Your Musical Journey
              </button>
              <button className="btn btn-outline" onClick={handleBookDemo}>
                Book Demo For Free
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-container">
              <img src="/images/AMJ-logo-website-pic.png" alt="Music Teacher" />
              <div className="floating-elements">
                <div className="floating-note note-1">♪</div>
                <div className="floating-note note-2">♫</div>
                <div className="floating-note note-3">♪</div>
              </div>
            </div>
          </div>
        </div>
        {/* New Animated Musical Elements */}
        <div className="musical-background">
          <div className="animated-instrument guitar">🎸</div>
          <div className="animated-instrument drums">🥁</div>
          <div className="animated-instrument microphone">🎤</div>

          <div className="bouncing-notes">
            <div className="bouncing-note note-bounce-4">♩</div>
            <div className="bouncing-note note-bounce-5">♪</div>
            <div className="bouncing-note note-bounce-6">♫</div>
            <div className="bouncing-note note-bounce-7">♬</div>
          </div>

          <div className="colorful-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
            <div className="circle circle-4"></div>
            <div className="circle circle-5"></div>
          </div>

          <div className="music-waves">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
