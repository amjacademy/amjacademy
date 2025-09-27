"use client"

import { useState, useRef } from "react"
import "./Profile.css"

const Profile = () => {
  const [activeSection, setActiveSection] = useState("videos")
  const [newProfileImage, setNewProfileImage] = useState(null)
  const [uploadedVideos, setUploadedVideos] = useState([])
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const profileImageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const photoInputRef = useRef(null)

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

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProfileImage(URL.createObjectURL(file))
    }
  }

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadedVideos(prev => [...prev, ...files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }))])
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadedPhotos(prev => [...prev, ...files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }))])
  }

  return (
    <div className="profile-container">
      
      <div className="content-header">
        <h1>PROFILE</h1>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src={newProfileImage || userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} className="avatar-image" />
              <button className="edit-button" onClick={() => profileImageInputRef.current.click()}>
                Edit
              </button>
              <input
                type="file"
                ref={profileImageInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
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
                <button className="upload-button" onClick={() => videoInputRef.current.click()}>
                  Upload Video
                </button>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  multiple
                  style={{ display: 'none' }}
                />
                {uploadedVideos.length > 0 ? (
                  <div className="videos-grid">
                    {uploadedVideos.map((video, index) => (
                      <div key={index} className="video-item">
                        <video src={video.url} controls width="200" />
                        <p>{video.name}</p>
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
                <button className="upload-button" onClick={() => photoInputRef.current.click()}>
                  Upload Photo
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                {uploadedPhotos.length > 0 ? (
                  <div className="photos-grid">
                    {uploadedPhotos.map((photo, index) => (
                      <a key={index} href={photo.url} target="_blank" className="photo-item">
                        📄 {photo.name}
                      </a>
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
