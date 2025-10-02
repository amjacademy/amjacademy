import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If element not found, navigate to home page and then scroll
      window.location.href = '/';
      setTimeout(() => {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

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
              <a href="https://www.facebook.com/profile.php?id=61579249055880" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://www.instagram.com/amj_academy_/" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/channel/UCMut7WUj5_byyRDtlNp4rGQ" aria-label="YouTube"><FaYoutube /></a>
              <a href="https://www.linkedin.com/in/amj-academy-54038437a/" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
              <li><Link to="/about">About Me</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              {/* <li><a href="#experience">Experience</a></li> */}
              <li><Link to="/accolades">Accolades</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Login</Link></li>
              {/* <li><Link to="/login">Student Login</Link></li> */}
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
              <p>📱 +91 82209 43683</p>
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
