import React from 'react';
import Header from './components/Header/header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer/footer';
import PianoLessons from './components/PianoLessons'
import RecordedClasses from './components/RecordedClasses';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <About />
      <Services />
      {/* <Experience /> */}
      <PianoLessons />
      <RecordedClasses />
      <Testimonials />
      <FAQ/>
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
