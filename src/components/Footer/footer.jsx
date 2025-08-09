import React from 'react';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/images/amj-logo.png" alt="AMJ Academy" />
              <span>AMJ Academy</span>
            </div>
            <p>
              Inspiring musical excellence through personalized instruction and passionate teaching. 
              Join our community of music lovers and discover your potential.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">📺</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Me</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#experience">Experience</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#services">Private Piano Lessons</a></li>
              <li><a href="#services">Group Classes</a></li>
              <li><a href="#services">Music Theory</a></li>
              <li><a href="#services">Performance Coaching</a></li>
              <li><a href="#services">Online Lessons</a></li>
              <li><a href="#services">Exam Preparation</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="footer-contact">
              <p>📧 info@amjacademy.com</p>
              <p>📱 +1 (555) 123-4567</p>
              <p>📍 Music Studio & Online</p>
              <p>⏰ Mon-Sat: 9AM-8PM</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} AMJ Academy. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Lesson Policies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
