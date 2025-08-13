import React, { useState, useEffect } from 'react';
import './header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src="/images/amj-logo.png" alt="AMJ Academy" />
            <span>AMJ Academy</span>
          </div>
          
          <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
            <a href="#home" onClick={() => scrollToSection('home')}>Home</a>
            <a href="#about" onClick={() => scrollToSection('about')}>About</a>
            <a href="#outlook" onClick={() => scrollToSection('outlook')}>Vision</a>
            <a href="#services" onClick={() => scrollToSection('services')}>Courses</a>
            {/* <a href="#experience" onClick={() => scrollToSection('experience')}>Experience</a> */}
            <a href="#testimonials" onClick={() => scrollToSection('testimonials')}>Accolades</a>
            <a href="#faq" onClick={() => scrollToSection('faq')}>FAQ</a>
            <a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a>
          </nav>

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
