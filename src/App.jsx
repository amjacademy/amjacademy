import React, { useState, useEffect } from 'react';
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
import LoginForm from './components/Login/Login';
import TeacherDashboard from './components/Teacher_setup/dashboard';
import StudentDashboard from './components/Student_setup/Dashboard';
import AdminLogin from './components/Admin/Admin_login';
import Admin_Dashboard from './components/Admin/Admin_dashboard';
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

// Login Page Component
function LoginPage() {
  return (
    <>
      <Header />
      <LoginForm />
      <Footer />
    </>
  );
}

// Dashboard Page Component
function DashboardPage() {
  const userType = localStorage.getItem('userType') || 'teacher'; // default to teacher if not set

  return (
    <>
      {userType === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      {/* <Footer /> */}
    </>
  );
}

// Admin Page Component
function AdminPage() {
  return <AdminLogin />;
}

function App() {
  const [isScreenshotAttempt, setIsScreenshotAttempt] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Detect Print Screen key or combinations
      if (e.key === 'PrintScreen' || e.keyCode === 44 || (e.altKey && e.key === 'PrintScreen')) {
        e.preventDefault();
        setIsScreenshotAttempt(true);
        document.body.classList.add('screenshot-blocked');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={isScreenshotAttempt ? 'screenshot-blocked' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/piano-lessons" element={<PianoLessonsPage />} />
          <Route path="/recorded-classes" element={<RecordedClassesPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/AdminLogin" element={<AdminPage />} />
          <Route path="/admin-dashboard" element={<Admin_Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
