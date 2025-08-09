import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: '🎹',
      title: 'Piano and Keyboard Lessons',
      description: 'One-on-one personalized instruction tailored to your skill level and musical goals.',
      features: ['Beginner to Advanced', 'Classical & Contemporary', 'Flexible Scheduling', 'Performance Preparation']
    },
    // {
    //   icon: '👥',
    //   title: 'Group Classes',
    //   description: 'Learn alongside peers in a collaborative and motivating environment.',
    //   features: ['Small Groups (3-5 students)', 'Ensemble Playing', 'Music Theory', 'Affordable Rates']
    // },
    {
      icon: '🎵',
      title: 'Music Theory & Composition',
      description: 'Comprehensive music theory education and composition guidance.',
      features: ['Harmony & Analysis', 'Songwriting', 'Arrangement', 'Music Production Basics']
    },
    {
      icon: '💻',
      title: 'On Going Online Class',
      description: 'Build confidence and stage presence for recitals and competitions.',
      features: ['Stage Presence', 'Audition Prep', 'Recital Training', 'Competition Coaching']
    },
    // {
    //   icon: '💻',
    //   title: 'Online Lessons',
    //   description: 'High-quality music education from the comfort of your home.',
    //   features: ['HD Video Quality', 'Interactive Learning', 'Recorded Sessions', 'Flexible Timing']
    // },
    // {
    //   icon: '🎼',
    //   title: 'Exam Preparation',
    //   description: 'Specialized coaching for music exams and certifications.',
    //   features: ['ABRSM Grades', 'Trinity Exams', 'School Auditions', 'Scholarship Prep']
    // }
  ];

  return (
    <section id="services" className="section services">
      <div className="container">
        <h2 className="section-title">Courses we offer</h2>
        <p className="section-subtitle">
          Comprehensive music education tailored to your individual needs and aspirations
        </p>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
