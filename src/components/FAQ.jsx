"use client"
import { useState } from "react"
import "./FAQ.css"

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const faqData = [
    {
      question: "What age groups do you teach?",
      answer:
        "We welcome students of all ages, from young children (5 to 50+) to adults.",
    },
    {
      question: "What instruments do you teach?",
      answer:
        "AMJ Academy specialize in teaching Piano, Keyboard, and Theory of Music, moreover guiding on sight-reading, and ear training.",
    },
    // {
    //   question: "Do you offer online classes?",
    //   answer:
    //     "Yes! We offer both in-person and online classes to accommodate different preferences and schedules. Online classes are conducted through video conferencing platforms with high-quality audio, and I provide digital materials and interactive tools to ensure an engaging learning experience from home.",
    // },
    {
      question: "How long the session been?",
      answer:
        "1:1 - 45 min , group - 50 min ",
    },
    // {
    //   question: "What is your teaching experience?",
    //   answer:
    //     "I have over 7 years of dedicated music education experience, working with students of various ages and skill levels. I've helped hundreds of students discover their musical potential, from complete beginners to those preparing for music exams and competitions. My approach combines traditional techniques with modern, engaging methods.",
    // },
    {
      question: "Do I need to have my own instrument to start lessons?",
      answer:
        "The parents can make a decision after a demo session",
    },
    // {
    //   question: "What materials or books will I need?",
    //   answer:
    //     "I provide most learning materials digitally, including sheet music, exercises, and theory worksheets. For structured learning, I may recommend specific method books based on your level and goals. I'll discuss any required materials during our first lesson and help you find the most cost-effective options.",
    // },
    // {
    //   question: "How do you track student progress?",
    //   answer:
    //     "I maintain detailed progress records for each student, including skills mastered, areas for improvement, and practice recommendations. Students and parents receive regular feedback, and I provide periodic progress reports. We also set achievable goals and celebrate milestones to keep motivation high.",
    // },
    {
      question: "What I have to do if I can't attend upcoming class?",
      answer:
        "You can have a option to cancel class. But have to inform atleast before four hour.",
    },
    {
      question: "Do you prepare students for Trinity exam?",
      answer:
        "Yes, more than 7 years experience in this preparation.",
    },
    // {
    //   question: "What are your lesson rates and payment options?",
    //   answer:
    //     "Lesson rates vary based on duration and format (in-person vs. online). I offer flexible payment options including per-lesson payments, monthly packages, and semester plans. Contact me for current rates and to discuss the best payment plan for your situation. I believe quality music education should be accessible to everyone.",
    // },
    // {
    //   question: "How do I get started with lessons?",
    //   answer:
    //     "Getting started is easy! Simply contact me through the website, phone, or email to schedule a consultation. During this initial meeting, we'll discuss your musical goals, assess your current level, and create a personalized learning plan. The first lesson can often serve as both an assessment and introduction to my teaching style.",
    // },
  ]

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about music lessons at AMJ Academy</p>
        </div>

        <div className="faq-container">
          {faqData.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? "active" : ""}`}>
              <div
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    toggleFAQ(index)
                  }
                }}
              >
                <h3>{faq.question}</h3>
                <div className="faq-icon">
                  <span className={`icon ${activeIndex === index ? "rotate" : ""}`}>▼</span>
                </div>
              </div>

              <div className="faq-answer">
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <div className="faq-contact">
            <h3>Still have questions?</h3>
            <p>Feel free to reach out! I'm here to start your musical journey.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                const element = document.getElementById("contact")
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Contact Me - 82209 43683
            </button>
          </div>
        </div>

        {/* Animated Musical Elements for FAQ */}
        <div className="faq-musical-elements">
          <div className="faq-note faq-note-1">🎵</div>
          <div className="faq-note faq-note-2">🎶</div>
          <div className="faq-note faq-note-3">♪</div>
          <div className="faq-note faq-note-4">♫</div>
        </div>
      </div>
    </section>
  )
}

export default FAQ

