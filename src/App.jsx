import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/header';
import Hero from './components/Hero';
import About from './components/About';
import OurOutlook from './components/OurOutlook';
import Services from './components/Services';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer/footer';
import PianoLessons from './components/PianoLessons';
import RecordedClasses from './components/RecordedClasses';
import RegistrationEnhanced from './components/RegistrationModal';
import './App.css';

// Home Page Component
function HomePage({ onOpenRegistration }) {
  return (
    <>
      <Header />
      <Hero onOpenRegistration={onOpenRegistration} />
      <About />
      <OurOutlook />
      <Services />
      {/* <Experience /> */}
      <Testimonials />
      <FAQ/>
      <Contact />
      <Footer />
    </>
  );
}

// Piano Lessons Page Component
function PianoLessonsPage() {
  return (
    <>
      <Header />
      <PianoLessons />
      <Footer />
    </>
  );
}

// Recorded Classes Page Component
function RecordedClassesPage() {
  return (
    <>
      <Header />
      <RecordedClasses />
      <Footer />
    </>
  );
}

// Registration Page Component
function RegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    // Navigate back to home
    window.history.back();
  };

  return (
    <>
      <Header />
      <RegistrationEnhanced 
        isOpen={isModalOpen} 
        onClose={handleClose} 
      />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/piano-lessons" element={<PianoLessonsPage />} />
        <Route path="/recorded-classes" element={<RecordedClassesPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
