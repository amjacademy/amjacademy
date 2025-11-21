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
import PianoServices from './components/PianoServices';
import RegistrationEnhanced from './components/RegistrationModal';
import LoginForm from './components/Login/Login';
import TeacherDashboard from './components/Teacher_setup/dashboard';
import StudentDashboard from './components/Student_setup/Dashboard';
import AdminLogin from './components/Admin/Admin_login';
import Admin_Dashboard from './components/Admin/Admin_dashboard';
import './App.css';
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import { motion } from "framer-motion";
// Home Page Component
function HomePage({ onOpenRegistration }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // splash loading state

useEffect(() => {
  const checkPersistentLogin = async () => {
    try {
      const res = await fetch("https://amjacademy-working.onrender.com/api/users/verifylogin", {
        method: "GET",
        credentials: "include", // ✅ include cookies
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ backend already sends correct redirect path
        navigate(data.redirect);
      } else {
        navigate("/"); // redirect to login if invalid
      }
    } catch (err) {
      console.error("Error verifying login:", err);
      navigate("/");
    } finally {
      setLoading(false); // ✅ hide splash
    }
  };

  checkPersistentLogin();
}, [navigate]);


  // ✅ Show splash logo while checking login
  if (loading) {
    return (
      <div className="splash-container">
        <motion.img
          src="/images/amj-logo.png"
          alt="Loading..."
          className="splash-logo"
          initial={{ opacity: 1, scale: 0.7 }}
          animate={{
            opacity: 1,
            scale: [1, 1.1, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  } 

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

// Piano Services Page Component
function PianoServicesPage() {
  return (
    <>
      <Header />
      <PianoServices />
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
  const userType = localStorage.getItem('userType') || 'Teacher'; // default to Teacher if not set

  return (
    <>
      {userType === 'Student' ? <StudentDashboard /> : <TeacherDashboard />}
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
      
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/piano-lessons" element={<PianoLessonsPage />} />
          <Route path="/piano-services" element={<PianoServicesPage />} />
          <Route path="/recorded-classes" element={<RecordedClassesPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/AdminLogin" element={<AdminPage />} />
           {/* 🔒 Protected route */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <Admin_Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
     
    </div>
  );
}

export default App;
