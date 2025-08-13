import "./OurOutlook.css"

const OurOutlook = () => {
  return (
    <section id="outlook" className="section our-outlook">
      <div className="container">
        <h2 className="section-title">Our Outlook</h2>
        <p className="section-subtitle">
          Empowering young minds through comprehensive music education and holistic development
        </p>

        <div className="philosophy-content">
          <div className="philosophy-pillars">
            <div className="pillar">
              <div className="pillar-icon explore-icon">
                <div className="icon-circle">🌍</div>
              </div>
              <h3 className="pillar-title">PROSPECT</h3>
              <p className="pillar-description">
                Begin your child’s musical path with piano and keyboard training, 
                building rhythm, melody, and confidence for a strong foundation in music.
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-icon enrich-icon">
                <div className="icon-circle">👥</div>
              </div>
              <h3 className="pillar-title">HEIGHTEN</h3>
              <p className="pillar-description">
                Elevate focus, creativity, stage confidence, and musical expression through our expertly 
                curated piano and keyboard programs designed for young talents.
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-icon excel-icon">
                <div className="icon-circle">💻</div>
              </div>
              <h3 className="pillar-title">ENDOWNMENT</h3>
              <p className="pillar-description">
                Empower young musicians with the skills, discipline, and artistry needed to stand out — nurturing 
                a lifelong gift of music that inspires both performer and audience.
              </p>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="outlook-animations">
          <div className="floating-note outlook-note-1">♪</div>
          <div className="floating-note outlook-note-2">♫</div>
          <div className="floating-note outlook-note-3">🎵</div>
          <div className="floating-note outlook-note-4">🎶</div>
          <div className="floating-note outlook-note-5">♬</div>
          <div className="floating-note outlook-note-6">🎼</div>

          <div className="colorful-circle outlook-circle-1"></div>
          <div className="colorful-circle outlook-circle-2"></div>
          <div className="colorful-circle outlook-circle-3"></div>
          <div className="colorful-circle outlook-circle-4"></div>
        </div>
      </div>
    </section>
  )
}

export default OurOutlook
