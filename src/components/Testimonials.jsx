import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Deveshwar Sanaadhana',
      role: 'Begginer Student',
      image: 'images/Accolades.jpg?height=80&width=80',
      text: 'I like this class . The teacher is very kind.I love this teacher'
    },
    {
      name: 'A.Maria Viyanci ',
      role: 'Begginer Student',
      image: 'images/Accolades.jpg?height=80&width=80',
      text: 'The keyboard class is very useful and engaging.Tha lesson are easy to follow, and I am improving my skills steadily .The teacher is supportive and makes learning enjoyable.'
    },
    {
      name: 'M ANTONY LISBAN',
      role: 'intermediate Student',
      image: 'images/Accolades.jpg?height=80&width=80',
      text: 'Your guidance has turned my fingers into magic on the keys! From scales to symphonies, you have made music feel accessible and joyful. Your passion is contagious, and I am so grateful for every lesson. Keep inspiring....'
    },
    // {
    //   name: 'David Thompson',
    //   role: 'Parent of twin students',
    //   image: '/placeholder.svg?height=80&width=80',
    //   text: 'Both my twins have different learning styles, but the personalized approach works perfectly for each of them. The progress they\'ve made in just one year is remarkable.'
    // },
    // {
    //   name: 'Lisa Park',
    //   role: 'Returning Student',
    //   image: '/placeholder.svg?height=80&width=80',
    //   text: 'I hadn\'t played piano for 15 years and wanted to get back into it. The refresher lessons were perfectly paced, and I\'m now playing better than I ever did before!'
    // },
    // {
    //   name: 'James Wilson',
    //   role: 'Competition Student',
    //   image: '/placeholder.svg?height=80&width=80',
    //   text: 'The performance coaching helped me win first place in the regional youth piano competition. The confidence and technique I gained through these lessons was invaluable.'
    // }
  ];

  return (
    <section id="testimonials" className="section testimonials">
      <div className="container1">
        <h2 className="section-title">What My Students Say</h2>
        <p className="section-subtitle">
          “Be the first to embrace the AMJ experience, and let your voice be heard.”
        </p>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p>{testimonial.text}</p>
              </div>
              <div className="testimonial-author">
                <img src={testimonial.image || "images/Accolades.jpg"} alt={testimonial.name} />
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
