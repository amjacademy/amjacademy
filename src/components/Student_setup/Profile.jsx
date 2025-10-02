"use client"

import { useState, useRef, useEffect } from "react"
import "./Profile.css"

const Profile = () => {
  const [activeSection, setActiveSection] = useState("videos")
  const [newProfileImage, setNewProfileImage] = useState(null)
  const [uploadedVideos, setUploadedVideos] = useState([])
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const profileImageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const photoInputRef = useRef(null)

  // Load user data from localStorage
  const [userProfile, setUserProfile] = useState({
    name: "Student",
    email: "",
    username: "",
    avatar: "images/Profile_pic.jpg?height=200&width=200",
    totalClassesAttended: 0,
    progress: "0%",
    achievements: 0,
    enrolledSubjects: [],
    videos: [],
    photos: [],
  })

  const [unlockedCharacters, setUnlockedCharacters] = useState(() => {
    const saved = localStorage.getItem("unlockedCharacters")
    return saved ? JSON.parse(saved) : [0, 1, 2, 5, 10, 15, 20, 25, 30] // Some unlocked by default
  })

  // Generate 60 story characters with different types and tiers
  const storyCharacters = [
    // Tier 1: Animals (0-19)
    { id: 0, emoji: "🐶", name: "Puppy Pal", tier: "bronze", requirement: "Join the class" },
    { id: 1, emoji: "🐱", name: "Kitty Friend", tier: "bronze", requirement: "First lesson" },
    { id: 2, emoji: "🐰", name: "Bunny Buddy", tier: "bronze", requirement: "2 classes" },
    { id: 3, emoji: "🐻", name: "Bear Hero", tier: "bronze", requirement: "3 classes" },
    { id: 4, emoji: "🐼", name: "Panda Star", tier: "bronze", requirement: "4 classes" },
    { id: 5, emoji: "🦁", name: "Lion King", tier: "silver", requirement: "5 classes" },
    { id: 6, emoji: "🐯", name: "Tiger Champion", tier: "silver", requirement: "6 classes" },
    { id: 7, emoji: "🦊", name: "Fox Genius", tier: "silver", requirement: "7 classes" },
    { id: 8, emoji: "🐨", name: "Koala Master", tier: "silver", requirement: "8 classes" },
    { id: 9, emoji: "🐵", name: "Monkey Fun", tier: "silver", requirement: "9 classes" },
    { id: 10, emoji: "🦄", name: "Unicorn Magic", tier: "gold", requirement: "10 classes" },
    { id: 11, emoji: "🐉", name: "Dragon Power", tier: "gold", requirement: "11 classes" },
    { id: 12, emoji: "🦋", name: "Butterfly Grace", tier: "gold", requirement: "12 classes" },
    { id: 13, emoji: "🐝", name: "Busy Bee", tier: "gold", requirement: "13 classes" },
    { id: 14, emoji: "🐬", name: "Dolphin Splash", tier: "gold", requirement: "14 classes" },
    { id: 15, emoji: "🦅", name: "Eagle Soar", tier: "platinum", requirement: "15 classes" },
    { id: 16, emoji: "🦉", name: "Wise Owl", tier: "platinum", requirement: "16 classes" },
    { id: 17, emoji: "🦚", name: "Peacock Pride", tier: "platinum", requirement: "17 classes" },
    { id: 18, emoji: "🐧", name: "Penguin Cool", tier: "platinum", requirement: "18 classes" },
    { id: 19, emoji: "🦈", name: "Shark Speed", tier: "platinum", requirement: "19 classes" },

    // Tier 2: Music & Arts (20-39)
    { id: 20, emoji: "🎵", name: "Music Note", tier: "bronze", requirement: "Practice 1 song" },
    { id: 21, emoji: "🎸", name: "Guitar Star", tier: "bronze", requirement: "Learn chords" },
    { id: 22, emoji: "🎹", name: "Piano Pro", tier: "bronze", requirement: "Play melody" },
    { id: 23, emoji: "🎤", name: "Singer Voice", tier: "bronze", requirement: "Sing along" },
    { id: 24, emoji: "🎧", name: "Music Lover", tier: "bronze", requirement: "Listen daily" },
    { id: 25, emoji: "🎨", name: "Artist Brush", tier: "silver", requirement: "Create art" },
    { id: 26, emoji: "🎭", name: "Drama King", tier: "silver", requirement: "Perform" },
    { id: 27, emoji: "🎪", name: "Circus Fun", tier: "silver", requirement: "Show talent" },
    { id: 28, emoji: "🎬", name: "Movie Maker", tier: "silver", requirement: "Record video" },
    { id: 29, emoji: "🎯", name: "Target Hit", tier: "silver", requirement: "Hit goals" },
    { id: 30, emoji: "🎲", name: "Game Master", tier: "gold", requirement: "Play games" },
    { id: 31, emoji: "🎰", name: "Lucky Winner", tier: "gold", requirement: "Win challenge" },
    { id: 32, emoji: "🎳", name: "Strike King", tier: "gold", requirement: "Perfect score" },
    { id: 33, emoji: "🎺", name: "Trumpet Hero", tier: "gold", requirement: "Master brass" },
    { id: 34, emoji: "🎻", name: "Violin Virtuoso", tier: "gold", requirement: "String master" },
    { id: 35, emoji: "🥁", name: "Drum Beat", tier: "platinum", requirement: "Keep rhythm" },
    { id: 36, emoji: "🎼", name: "Composer", tier: "platinum", requirement: "Write music" },
    { id: 37, emoji: "🎶", name: "Melody Maker", tier: "platinum", requirement: "Create song" },
    { id: 38, emoji: "🎙️", name: "Podcast Star", tier: "platinum", requirement: "Record show" },
    { id: 39, emoji: "📻", name: "Radio Host", tier: "platinum", requirement: "Broadcast" },

    // Tier 3: Stars & Space (40-49)
    { id: 40, emoji: "⭐", name: "Bright Star", tier: "bronze", requirement: "Shine bright" },
    { id: 41, emoji: "🌟", name: "Super Star", tier: "silver", requirement: "Excel" },
    { id: 42, emoji: "✨", name: "Sparkle Magic", tier: "silver", requirement: "Be creative" },
    { id: 43, emoji: "💫", name: "Dizzy Star", tier: "gold", requirement: "Amaze all" },
    { id: 44, emoji: "🌠", name: "Shooting Star", tier: "gold", requirement: "Fast learner" },
    { id: 45, emoji: "🌙", name: "Moon Glow", tier: "platinum", requirement: "Night owl" },
    { id: 46, emoji: "☀️", name: "Sunshine", tier: "platinum", requirement: "Brighten day" },
    { id: 47, emoji: "🌈", name: "Rainbow Joy", tier: "diamond", requirement: "Spread joy" },
    { id: 48, emoji: "☁️", name: "Cloud Nine", tier: "diamond", requirement: "Sky high" },
    { id: 49, emoji: "⚡", name: "Lightning Fast", tier: "diamond", requirement: "Quick mind" },

    // Tier 4: Achievements (50-59)
    { id: 50, emoji: "🏆", name: "Champion", tier: "gold", requirement: "Win contest" },
    { id: 51, emoji: "🥇", name: "Gold Medal", tier: "gold", requirement: "First place" },
    { id: 52, emoji: "🥈", name: "Silver Medal", tier: "silver", requirement: "Second place" },
    { id: 53, emoji: "🥉", name: "Bronze Medal", tier: "bronze", requirement: "Third place" },
    { id: 54, emoji: "🎖️", name: "Military Honor", tier: "platinum", requirement: "Discipline" },
    { id: 55, emoji: "👑", name: "Crown Royalty", tier: "diamond", requirement: "Be the best" },
    { id: 56, emoji: "💎", name: "Diamond Elite", tier: "diamond", requirement: "Perfection" },
    { id: 57, emoji: "🔥", name: "Fire Spirit", tier: "platinum", requirement: "Passion" },
    { id: 58, emoji: "💪", name: "Strong Will", tier: "platinum", requirement: "Never quit" },
    { id: 59, emoji: "🎓", name: "Graduate", tier: "diamond", requirement: "Complete all" },
  ]

  useEffect(() => {
    const storedProfile = localStorage.getItem("profile_student")
    if (storedProfile) {
      const profileData = JSON.parse(storedProfile)
      setUserProfile((prev) => ({
        ...prev,
        name: profileData.name || prev.name,
        email: profileData.email || "",
        username: profileData.username || "",
        avatar: profileData.image || prev.avatar,
        enrolledSubjects: [profileData.profession || "Piano"],
      }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("unlockedCharacters", JSON.stringify(unlockedCharacters))
  }, [unlockedCharacters])

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProfileImage(URL.createObjectURL(file))
    }
  }

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadedVideos((prev) => [
      ...prev,
      ...files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    ])
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadedPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    ])
  }

  const getTierColor = (tier) => {
    const colors = {
      bronze: "#cd7f32",
      silver: "#c0c0c0",
      gold: "#ffd700",
      platinum: "#e5e4e2",
      diamond: "#b9f2ff",
    }
    return colors[tier] || "#ccc"
  }

  return (
    <div className="profile-container">
      <div className="music-notes-container">
        <div className="music-note">♪</div>
        <div className="music-note">♫</div>
        <div className="music-note">♪</div>
        <div className="music-note">♫</div>
        <div className="music-note">♪</div>
        <div className="music-note">♫</div>
        <div className="music-note">♪</div>
        <div className="music-note">♫</div>
      </div>

      <div className="content-header">
        <h1>🎨 MY AWESOME PROFILE 🎨</h1>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-info-centered">
            <div className="profile-avatar-center">
              <div className="avatar-glow"></div>
              <img
                src={newProfileImage || userProfile.avatar || "/placeholder.svg"}
                alt={userProfile.name}
                className="avatar-image-center"
              />
              <button className="edit-button-floating" onClick={() => profileImageInputRef.current.click()}>
                ✏️
              </button>
              <input
                type="file"
                ref={profileImageInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
            <h2 className="profile-name-center">{userProfile.name}</h2>
          </div>

          <div className="info-cards-grid">
            <div className="info-card info-card-purple">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">{userProfile.email || "Not provided"}</span>
              </div>
            </div>

            <div className="info-card info-card-blue">
              <div className="info-icon">👤</div>
              <div className="info-content">
                <span className="info-label">Username</span>
                <span className="info-value">{userProfile.username || "Not provided"}</span>
              </div>
            </div>

            <div className="info-card info-card-green">
              <div className="info-icon">🎓</div>
              <div className="info-content">
                <span className="info-label">Classes Attended</span>
                <span className="info-value">{userProfile.totalClassesAttended}</span>
              </div>
            </div>

            <div className="info-card info-card-orange">
              <div className="info-icon">📊</div>
              <div className="info-content">
                <span className="info-label">Progress</span>
                <span className="info-value">{userProfile.progress}</span>
              </div>
            </div>

            <div className="info-card info-card-pink">
              <div className="info-icon">🏆</div>
              <div className="info-content">
                <span className="info-label">Achievements</span>
                <span className="info-value">{userProfile.achievements}</span>
              </div>
            </div>

            <div className="info-card info-card-yellow">
              <div className="info-icon">📚</div>
              <div className="info-content">
                <span className="info-label">Subjects</span>
                <span className="info-value">{userProfile.enrolledSubjects.join(", ") || "None"}</span>
              </div>
            </div>
          </div>

          <div className="profile-sections">
            <div className="section-card section-card-media">
              <div className="section-header">
                <h3>🎬📸 My Media</h3>
                <button className="section-icon">📱</button>
              </div>
              <div className="section-content">
                <div className="media-container">
                  <div className="videos-section">
                    <h4>🎬 My Videos</h4>
                    <button className="upload-button" onClick={() => videoInputRef.current.click()}>
                      📤 Upload Video
                    </button>
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      multiple
                      style={{ display: "none" }}
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
                      <p className="no-content">🎥 No Videos Yet!</p>
                    )}
                  </div>

                  <div className="photos-section">
                    <h4>📸 My Photos</h4>
                    <button className="upload-button" onClick={() => photoInputRef.current.click()}>
                      📤 Upload Photo
                    </button>
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                    />
                    {uploadedPhotos.length > 0 ? (
                      <div className="photos-grid">
                        {uploadedPhotos.map((photo, index) => (
                          <a key={index} href={photo.url} target="_blank" className="photo-item" rel="noreferrer">
                            📄 {photo.name}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="no-content">📷 No Photos Yet!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="story-characters-section">
            <div className="characters-header">
              <h2 className="characters-title">🌟 MY STORY CHARACTERS 🌟</h2>
              <div className="characters-progress">
                <span className="progress-badge">
                  {unlockedCharacters.length} / {storyCharacters.length}
                </span>
                <span className="progress-text">Characters Unlocked!</span>
              </div>
            </div>

            <div className="characters-grid">
              {storyCharacters.map((character) => {
                const isUnlocked = unlockedCharacters.includes(character.id)
                return (
                  <div
                    key={character.id}
                    className={`character-card ${isUnlocked ? "unlocked" : "locked"}`}
                    style={{
                      borderColor: isUnlocked ? getTierColor(character.tier) : "#ccc",
                    }}
                  >
                    <div className="character-emoji">{isUnlocked ? character.emoji : "🔒"}</div>
                    <div className="character-name">{isUnlocked ? character.name : "???"}</div>
                    <div className={`character-tier tier-${character.tier}`}>{character.tier.toUpperCase()}</div>
                    <div className="character-requirement">{isUnlocked ? "✓ Unlocked!" : character.requirement}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
