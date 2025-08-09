import React from 'react';
import './Hero.css';

const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>“Refining Musicians, Elevating Talent to Timeless Art, and Inspiring Generations.”</h1>
            <p>
              Welcome to AMJ Academy, A where passion meets expertise. With over 7 years of dedicated 
              music education experience, I help students of all ages discover their musical potential 
              and achieve their artistic dreams.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={scrollToContact}>
                Start Your Musical Journey
              </button>
              <a href="#about" className="btn btn-outline">Learn More About Me</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-container">
              <img src="images/amj-logo.png?height=400&width=400" alt="Music Teacher" />
              <div className="floating-elements">
                <div className="floating-note note-1">♪</div>
                <div className="floating-note note-2">♫</div>
                <div className="floating-note note-3">♪</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
