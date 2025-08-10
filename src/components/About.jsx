import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about-content">
          <div className="about-image">
            <img src="images/Poster.png?height=300&width=400" alt="About Me" />
          </div>
          <div className="about-text">
            <h2 className="section-title">Meet Our Founder</h2>
            <h3 className="section-subtitle"></h3>
            <p className="about-intro">
              "The visionary behind AMJ Academy, our Founder and CEO is a beacon of inspiration,
               shaping minds and futures with passion, purpose, and unwavering dedication."
            </p>
            
            <div className="about-details">
              <div className="detail-item">
                <div className="detail-icon">🎹</div>
                <div className="detail-content">
                  <h4>Piano / Keyboard Specialist</h4>
                  <p>Expert instruction in classical, contemporary, and jazz piano techniques</p>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">🎵</div>
                <div className="detail-content">
                  <h4>Music Theory</h4>
                  <p>Comprehensive understanding of music theory, composition, and arrangement</p>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">👥</div>
                <div className="detail-content">
                  <h4>All Ages Welcome</h4>
                  <p>Experience teaching students from age 5 to 50+, adapting to individual learning styles</p>
                </div>
              </div>
            </div>

            <div className="qualifications">
              <h3>Qualifications & Achievements</h3>
              <ul>
                <li>Bachelor's Degree in Music Education</li>
                <li>Certified Piano / keyboard Teacher (Trinity College of London Grade 8)</li>
                <li>7+ Years Professional Teaching Experience</li>
                <li>100+ Successful Students</li>
                <li>Regular Performer at Domestic Venues and Abroad's</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
