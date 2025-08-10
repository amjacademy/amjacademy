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
        "I welcome students of all ages, from young children (4+) to adults. My teaching methods are adapted to suit each age group's learning style and attention span. For younger children, I use fun, interactive approaches with games and colorful materials, while older students can dive deeper into music theory and advanced techniques.",
    },
    {
      question: "What instruments do you teach?",
      answer:
        "I specialize in piano, keyboard, and music theory fundamentals. I also provide guidance on basic music composition, sight-reading, and ear training. If you're interested in other instruments, I can help you build a strong musical foundation that will make learning any instrument easier.",
    },
    {
      question: "Do you offer online classes?",
      answer:
        "Yes! I offer both in-person and online classes to accommodate different preferences and schedules. Online classes are conducted through video conferencing platforms with high-quality audio, and I provide digital materials and interactive tools to ensure an engaging learning experience from home.",
    },
    {
      question: "How long are the lessons and how often should students take them?",
      answer:
        "Lesson duration varies by age and level: 30 minutes for young children (4-7 years), 45 minutes for intermediate students (8-12 years), and 60 minutes for advanced students and adults. I typically recommend weekly lessons for consistent progress, but we can adjust the frequency based on your goals and schedule.",
    },
    {
      question: "What is your teaching experience?",
      answer:
        "I have over 7 years of dedicated music education experience, working with students of various ages and skill levels. I've helped hundreds of students discover their musical potential, from complete beginners to those preparing for music exams and competitions. My approach combines traditional techniques with modern, engaging methods.",
    },
    {
      question: "Do I need to have my own instrument to start lessons?",
      answer:
        "For piano lessons, you'll eventually need access to a piano or keyboard at home for practice. However, you don't need to purchase one immediately - I can provide guidance on renting or buying the right instrument for your budget and space. For the first few lessons, we can work with what's available in the studio.",
    },
    {
      question: "What materials or books will I need?",
      answer:
        "I provide most learning materials digitally, including sheet music, exercises, and theory worksheets. For structured learning, I may recommend specific method books based on your level and goals. I'll discuss any required materials during our first lesson and help you find the most cost-effective options.",
    },
    {
      question: "How do you track student progress?",
      answer:
        "I maintain detailed progress records for each student, including skills mastered, areas for improvement, and practice recommendations. Students and parents receive regular feedback, and I provide periodic progress reports. We also set achievable goals and celebrate milestones to keep motivation high.",
    },
    {
      question: "What if I need to cancel or reschedule a lesson?",
      answer:
        "I understand that schedules can change! I ask for at least 24 hours notice for cancellations or rescheduling. With adequate notice, we can reschedule your lesson for another available time slot. Emergency cancellations are handled on a case-by-case basis.",
    },
    {
      question: "Do you prepare students for music exams or competitions?",
      answer:
        "I have experience preparing students for various music examinations, recitals, and competitions. I can help with technique refinement, performance preparation, music theory exams, and building confidence for public performances. We'll work together to set realistic goals and timelines.",
    },
    {
      question: "What are your lesson rates and payment options?",
      answer:
        "Lesson rates vary based on duration and format (in-person vs. online). I offer flexible payment options including per-lesson payments, monthly packages, and semester plans. Contact me for current rates and to discuss the best payment plan for your situation. I believe quality music education should be accessible to everyone.",
    },
    {
      question: "How do I get started with lessons?",
      answer:
        "Getting started is easy! Simply contact me through the website, phone, or email to schedule a consultation. During this initial meeting, we'll discuss your musical goals, assess your current level, and create a personalized learning plan. The first lesson can often serve as both an assessment and introduction to my teaching style.",
    },
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
            <p>Don't hesitate to reach out! I'm here to help you start your musical journey.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                const element = document.getElementById("contact")
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Contact Me
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

