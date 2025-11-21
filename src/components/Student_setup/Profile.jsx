"use client"

import { useState, useRef, useEffect } from "react"
import "./Profile.css"

const Profile = () => {

  const MAIN="https://amjacademy-working.onrender.com";
  const LOCAL="http://localhost:5000";

  const [activeSection, setActiveSection] = useState("videos")
  const [newProfileImage, setNewProfileImage] = useState(null)
  const [uploadedVideos, setUploadedVideos] = useState([])
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const profileImageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const photoInputRef = useRef(null)
  const [storyCharacters, setStoryCharacters] = useState([])
  const [userProfile, setUserProfile] = useState({
    name: "Student",
    email: "",
    username: "",
    avatar: "/placeholder.svg",
    totalClassesAttended: 0,
    progress: "0%",
    achievements: 0,
    enrolledSubjects: " ",
    videos: [],
    photos: [],
  })

const [unlockedCharacters, setUnlockedCharacters] = useState([]);


  // -------------------- FETCH PROFILE --------------------
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("user_id")
      if (!userId) return

      try {
        const res = await fetch(`${MAIN}/profile/${userId}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUserProfile({
            name: data.name || "Student",
            email: data.email || "",
            username: data.username || "",
            avatar: data.profile || "/placeholder.svg",
            enrolledSubjects: data.enrolledSubjects || " ",
            totalClassesAttended: data.totalClassesAttended || 0,
            progress: data.progress || "0%",
            achievements: data.achievements || 0,
            ratings: data.ratings || 0,
            videos: data.media?.videos || [],
            photos: data.media?.photos || [],

          })
          setUnlockedCharacters(data.unlocked || []);
          /* console.log(data.unlocked) */
        } else if (res.status === 404) {
          console.log("Profile not found. Initialize it first.")
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchProfile()
  }, [])

  // -------------------- FETCH CHARACTERS --------------------
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await fetch(`${MAIN}/story-characters`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setStoryCharacters(data)
        }
      } catch (err) {
        console.error("Error fetching story characters:", err)
      }
    }
    fetchCharacters()
  }, [])

  // -------------------- FETCH MEDIA --------------------
 useEffect(() => {
  const fetchMedia = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const res = await fetch(`${MAIN}/media/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch media");

      const data = await res.json();

      // Map to include only the fields needed and ensure we use secure_url
      const videos = data
        .filter((m) => m.resource_type === "video")
        .map((m) => ({
          name: m.original_filename || "video",
          url: m.secure_url, // Use secure_url, not public_id
        }));

      const photos = data
        .filter((m) => m.resource_type === "photo")
        .map((m) => ({
          name: m.original_filename || "photo",
          url: m.secure_url,
        }));

      setUploadedVideos(videos);
      setUploadedPhotos(photos);
    } catch (err) {
      console.error("Error fetching media:", err);
    }
  };

  fetchMedia();
}, []);

  // -------------------- HANDLE PROFILE IMAGE --------------------
const handleProfileImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const userId = localStorage.getItem("user_id"); // current logged-in user

    // Prepare form data for upload
    const formData = new FormData();
    formData.append("avatar", file); // must match upload.single("avatar")
// must match backend parser.single("avatar")

    // Upload to media endpoint
    const mediaRes = await fetch(`${MAIN}/profile/${userId}/avatar`, {
      method: "POST",
      body: formData,
    });

    if (!mediaRes.ok) throw new Error("Failed to upload image");

    const mediaData = await mediaRes.json();
    /* console.log("Media upload response:", mediaData.secure_url); */
    const newAvatarUrl = mediaData.secure_url; // URL returned from backend

    // Update frontend state
    setUserProfile((prev) => ({
      ...prev,
      avatar: newAvatarUrl,
    }));

    window.alert("Profile image updated successfully!");
  } catch (err) {
    console.error("Error updating profile image:", err);
  }
};


// -------------------- HANDLE VIDEO UPLOAD --------------------
const handleVideoUpload = async (e) => {
  const files = Array.from(e.target.files);
  const userId = localStorage.getItem("user_id");
  const uploaded = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file); // instead of "media"
    formData.append("type", "video");

    try {
      const res = await fetch(`${MAIN}/media/${userId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Video upload failed");
      const data = await res.json();
      uploaded.push({ name: file.name, url: data.secure_url, resource_type: "video" });
    } catch (err) {
      console.error(err);
    }
  }

  setUploadedVideos((prev) => [...prev, ...uploaded]);
};

// -------------------- HANDLE PHOTO UPLOAD --------------------

const handlePhotoUpload = async (e) => {
  const files = Array.from(e.target.files);
  const userId = localStorage.getItem("user_id");
  const uploaded = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file); // instead of "media"
    formData.append("type", "photo");

    try {
      const res = await fetch(`${MAIN}/media/${userId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Photo upload failed");
      const data = await res.json();
      uploaded.push({ name: file.name, url: data.secure_url, resource_type: "photo" });
    } catch (err) {
      console.error(err);
    }
  }

  setUploadedPhotos((prev) => [...prev, ...uploaded]);
};
  // -------------------- TIER COLORS --------------------
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

  // -------------------- JSX --------------------
  return (
    <div className="profile-container">
      {/* MUSIC NOTES ANIMATION */}
      <div className="music-notes-container">
        {["♪","♫","♪","♫","♪","♫","♪","♫"].map((note,i)=><div key={i} className="music-note">{note}</div>)}
      </div>

      <div className="content-header">
        <h1>🎨 MY AWESOME PROFILE 🎨</h1>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          {/* PROFILE INFO */}
          <div className="profile-info-centered">
            <div className="profile-avatar-center">
              <div className="avatar-glow"></div>
              <img
                src={newProfileImage || userProfile.avatar}
                alt={userProfile.name}
                className="avatar-image-center"
              />
              <button className="edit-button-floating" onClick={()=>profileImageInputRef.current.click()}>✏️</button>
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

          {/* INFO CARDS */}
          <div className="info-cards-grid">
            {[
              { icon:"📧", label:"Email", value:userProfile.email },
              { icon:"👤", label:"Username", value:userProfile.username },
              { icon:"🎓", label:"Classes Attended", value:userProfile.totalClassesAttended },
              { icon:"⭐", label:"Ratings", value:userProfile.ratings },
              { icon:"📊", label:"Progress", value:userProfile.progress },
              { icon:"🏆", label:"Achievements", value:userProfile.achievements },
              { icon:"📚", label:"Subjects", value:userProfile.enrolledSubjects || "None" }
            ].map((card,i)=>(
              <div key={i} className={`info-card info-card-${i}`} >
                <div className="info-icon">{card.icon}</div>
                <div className="info-content">
                  <span className="info-label">{card.label}</span>
                  <span className="info-value">{card.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* MEDIA SECTION */}
          <div className="profile-sections">
            <div className="section-card section-card-media">
              <div className="section-header">
                <h3>🎬📸 My Media</h3>
              </div>
              <div className="section-content media-container">
                <div className="videos-section">
                  <h4>🎬 My Videos</h4>
                  <button className="upload-button" onClick={()=>videoInputRef.current.click()}>📤 Upload Video</button>
                  <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" multiple style={{ display:"none" }}/>
                  {uploadedVideos.length>0 ? <div className="videos-grid">
                    {uploadedVideos.map((v,i)=><div key={i} className="video-item"><video src={v.url} controls width="200" /><p>{v.name}</p></div>)}
                  </div> : <p className="no-content">🎥 No Videos Yet!</p>}
                </div>

                <div className="photos-section">
                  <h4>📸 My Photos</h4>
                  <button className="upload-button" onClick={()=>photoInputRef.current.click()}>📤 Upload Photo</button>
                  <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" multiple style={{ display:"none" }}/>
                  {uploadedPhotos.length>0 ? <div className="photos-grid">
                    {uploadedPhotos.map((p,i)=><a key={i} href={p.url} target="_blank" rel="noreferrer" className="photo-item">📄 {p.name}</a>)}
                  </div> : <p className="no-content">📷 No Photos Yet!</p>}
                </div>
              </div>
            </div>
          </div>

          {/* STORY CHARACTERS */}
          <div className="story-characters-section">
            <div className="characters-header">
              <h2 className="characters-title">🌟 MY STORY CHARACTERS 🌟</h2>
              <div className="characters-progress">
                <span className="progress-badge">{unlockedCharacters.length} / {storyCharacters.length}</span>
                <span className="progress-text">Characters Unlocked!</span>
              </div>
            </div>

            <div className="characters-grid">
              {storyCharacters.map((c)=> {
                const isUnlocked = unlockedCharacters.includes(c.id)
                return (
                  <div key={c.id} className={`character-card ${isUnlocked ? "unlocked":"locked"}`} style={{borderColor: isUnlocked?getTierColor(c.tier):"#ccc"}}>
                    <div className="character-emoji">{isUnlocked ? c.emoji : "🔒"}</div>
                    <div className="character-name">{isUnlocked ? c.name : "???"}</div>
                    <div className={`character-tier tier-${c.tier}`}>{c.tier.toUpperCase()}</div>
                    <div className="character-requirement">{isUnlocked ? "✓ Unlocked!" : c.requirement}</div>
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
