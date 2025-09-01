"use client"

import { useState } from "react"
import "./Profile.css"

const Profile = () => {
  const [activeSection, setActiveSection] = useState("videos")

  const userProfile = {
    name: "Anto Maria Joshua B",
    avatar: "images/Profile_pic.jpg?height=200&width=200",
    totalStudents: 132,
    previousStudents: 142,
    totalClasses: 24,
    reviews: "NA",
    rating: 4.5,
    totalRatings: 27,
    subjects: ["Keyboard"],
    videos: [],
    photos: [],
  }

  return (
    <div className="profile-container">
      {/* <div className="profile-header">
        <h1>PROFILE</h1>
      </div> */}

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} className="avatar-image" />
            </div>
            <div className="profile-details">
              <h2 className="profile-name">{userProfile.name}</h2>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Total students:</span>
                  <span className="stat-value">
                    $ {userProfile.totalStudents}
                    <span className="stat-change">+{userProfile.previousStudents}</span>
                  </span>
                  <span className="stat-subtext">for {userProfile.totalClasses} classes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Reviews:</span>
                  <span className="stat-value">{userProfile.reviews}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rating:</span>
                  <div className="rating-container">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`star ${star <= userProfile.rating ? "filled" : ""}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-text">{userProfile.totalRatings} Ratings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-sections">
            <div className="section-card">
              <div className="section-header">
                <h3>My videos</h3>
                <button className="section-icon">📹</button>
              </div>
              <div className="section-content">
                {userProfile.videos.length > 0 ? (
                  <div className="videos-grid">
                    {userProfile.videos.map((video, index) => (
                      <div key={index} className="video-item">
                        {video.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-content">No Video Available</p>
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3>My Photos</h3>
                <button className="section-icon">📷</button>
              </div>
              <div className="section-content">
                {userProfile.photos.length > 0 ? (
                  <div className="photos-grid">
                    {userProfile.photos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img src={photo.url || "/placeholder.svg"} alt={photo.title} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-content">No Image Available</p>
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3>My Subjects</h3>
                <button className="section-icon">📚</button>
              </div>
              <div className="section-content">
                <div className="subjects-list">
                  {userProfile.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
