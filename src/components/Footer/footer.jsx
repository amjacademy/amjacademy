import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";
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
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://www.instagram.com/amj_academy_/" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
              <a href="https://www.linkedin.com/in/amj-academy-54038437a/" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Me</a></li>
              <li><a href="#services">Cources</a></li>
              {/* <li><a href="#experience">Experience</a></li> */}
              <li><a href="#testimonials">Accolades</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#services">Online Class</a></li>
              <li><a href="#services">1:1 Class</a></li>
              <li><a href="#services">Group Classes</a></li>
              <li><a href="#services">Trinity Exam's Preparation</a></li>
              <li><a href="#services">Music Theory</a></li>
              <li><a href="#services">Performance Couching</a></li>
              <li><a href="#services">Online source</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="footer-contact">
              <p>📧 amjacademy196015@gmail.com</p>
              <p>📱 +91-91717 19881</p>
              <a>📍 No. 02, 2nd cross street, KothandaRamar Nagar,
                     Perungudi, Ch - 96
              </a>
              <p>⏰ 24/7 Available</p>
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
