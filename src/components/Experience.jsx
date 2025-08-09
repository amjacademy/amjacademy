import React from 'react';
import './Experience.css';

const Experience = () => {
  const achievements = [
    { number: '7+', label: 'Years Teaching' },
    { number: '200+', label: 'Students Taught' },
    { number: '50+', label: 'Recitals Organized' },
    { number: '95%', label: 'Exam Pass Rate' }
  ];

  const timeline = [
    {
      year: '2018',
      title: 'Started Teaching Journey',
      description: 'Began private piano instruction while completing music education degree'
    },
    {
      year: '2019',
      title: 'Established AMJ Academy',
      description: 'Founded my own music teaching practice with focus on personalized instruction'
    },
    {
      year: '2020',
      title: 'Online Teaching Pioneer',
      description: 'Successfully transitioned to online lessons during pandemic, maintaining student engagement'
    },
    {
      year: '2021',
      title: 'Expanded Services',
      description: 'Added group classes, music theory, and composition to service offerings'
    },
    {
      year: '2022',
      title: 'Performance Program',
      description: 'Launched student performance program with quarterly recitals and competitions'
    },
    {
      year: '2023',
      title: 'Advanced Certification',
      description: 'Completed advanced pedagogy certification and music therapy training'
    },
    {
      year: '2024',
      title: 'Community Outreach',
      description: 'Started community music programs for underprivileged youth'
    },
    {
      year: '2025',
      title: 'Continued Excellence',
      description: 'Expanding reach while maintaining the highest standards of music education'
    }
  ];

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <h2 className="section-title">Experience & Achievements</h2>
        <p className="section-subtitle">
          Seven years of dedicated music education, transforming lives through the power of music
        </p>

        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-card">
              <div className="achievement-number">{achievement.number}</div>
              <div className="achievement-label">{achievement.label}</div>
            </div>
          ))}
        </div>

        <div className="timeline">
          <h3>My Teaching Journey</h3>
          <div className="timeline-container">
            {timeline.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-content">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
