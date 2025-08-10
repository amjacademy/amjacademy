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
            <h2 className="section-title">Meet Your Expert Music Tutor</h2>
            <h3 className="section-subtitle">A M JOSHUA</h3>
            <p className="about-intro">
              Hello! I am A.M. Joshua, founder and lead tutor at AMJ Academy. With 7+ years as a passionate music teacher,
              I believe music is for everyone: children, teenagers, and adults alike.
            </p>
            
            <div className="about-details">
              <div className="detail-item">
                <div className="detail-icon">🎹</div>
                <div className="detail-content">
                  <h4>Piano Specialist</h4>
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
                  <p>Experience teaching students from age 4 to 70+, adapting to individual learning styles</p>
                </div>
              </div>
            </div>

            <div className="qualifications">
              <h3>Qualifications & Achievements</h3>
              <ul>
                <li>Bachelor's Degree in Music Education</li>
                <li>Certified Piano Teacher (ABRSM Grade 8)</li>
                <li>7+ Years Professional Teaching Experience</li>
                <li>200+ Successful Students</li>
                <li>Regular Performer at Local Venues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
