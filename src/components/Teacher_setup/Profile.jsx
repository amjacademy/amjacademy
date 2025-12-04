"use client";

import { useState, useRef, useEffect } from "react";
import "./Profile.css";

const Profile = () => {
  const MAIN = import.meta.env.VITE_MAIN;
  const TEST = import.meta.env.VITE_TEST;

  const [activeSection, setActiveSection] = useState("videos");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const profileImageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Load user data from localStorage
  const [userProfile, setUserProfile] = useState({
    name: "Teacher",
    email: "",
    username: "",
    avatar: "/placeholder.svg",
    salary: 0,
    totalClasses: 0,
    /* reviews: "NA", */
    rating: 0,
    subjects: "Keyboard",
    videos: [],
    photos: [],
  });
  // -------------------- FETCH PROFILE --------------------
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await fetch(`${MAIN}/api/teacher/profile/${userId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          /* console.log("Fetched profile data:", data) */
          setUserProfile({
            name: data.name || "Teacher",
            email: data.email || "",
            username: data.username || "",
            avatar: data.profile || "/placeholder.svg",
            subjects: data.subjects || " ",
            rating: data.rating || 0,
            videos: data.media?.videos || [],
            photos: data.media?.photos || [],
            salary: data.salary || 0,
          });
        } else if (res.status === 404) {
          console.log("Profile not found. Initialize it first.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // -------------------- FETCH MEDIA --------------------
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const res = await fetch(`${MAIN}/api/teacher/profile/media/${userId}`, {
          credentials: "include",
        });
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
      const mediaRes = await fetch(
        `${MAIN}/api/teacher/profile/avatar/${userId}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

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
        const res = await fetch(
          `${MAIN}/api/teacher/profile/media/${userId}/upload`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Photo upload failed");
        if (!res.ok) throw new Error("Video upload failed");
        const data = await res.json();
        uploaded.push({
          name: file.name,
          url: data.secure_url,
          resource_type: "video",
        });
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
        const res = await fetch(
          `${MAIN}/api/teacher/profile/media/${userId}/upload`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Photo upload failed");
        const data = await res.json();
        uploaded.push({
          name: file.name,
          url: data.secure_url,
          resource_type: "photo",
        });
      } catch (err) {
        console.error(err);
      }
    }

    setUploadedPhotos((prev) => [...prev, ...uploaded]);
  };
  return (
    <div className="profile-container">
      <div className="content-header1">
        <h1>PROFILE</h1>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-info">
            <div className="profile-avatar">
              <img
                src={
                  newProfileImage || userProfile.avatar || "/placeholder.svg"
                }
                alt={userProfile.name}
                className="avatar-image"
              />
              <button
                className="edit-button"
                onClick={() => profileImageInputRef.current.click()}
              >
                Edit
              </button>
              <input
                type="file"
                ref={profileImageInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
            <div className="profile-details">
              <h2 className="profile-name">{userProfile.name}</h2>
              <div className="profile-contact">
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">
                    {userProfile.email || "Not provided"}
                  </span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Username:</span>
                  <span className="contact-value">
                    {userProfile.username || "Not provided"}
                  </span>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Salary</span>
                  <span className="stat-value">
                    $ {userProfile.salary}
                    {/* <span className="stat-change">+{userProfile.previousStudents}</span> */}
                  </span>
                  {/* <span className="stat-subtext">for {userProfile.totalClasses} classes</span> */}
                </div>
                {/* <div className="stat-item">
                  <span className="stat-label">Reviews:</span>
                  <span className="stat-value">{userProfile.reviews}</span>
                </div> */}
                <div className="stat-item">
                  <span className="stat-label">Rating:</span>
                  <div className="rating-container">
                    {/* <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`star ${star <= userProfile.rating ? "filled" : ""}`}>
                          ★
                        </span>
                      ))}
                    </div> */}
                    <span className="rating-text">{userProfile.rating}</span>
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
                <button
                  className="upload-button"
                  onClick={() => videoInputRef.current.click()}
                >
                  Upload Video
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
                <button
                  className="upload-button"
                  onClick={() => photoInputRef.current.click()}
                >
                  Upload Photo
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
                      <a
                        key={index}
                        href={photo.url}
                        target="_blank"
                        className="photo-item"
                      >
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
                  <span className="subject-tag">{userProfile.subjects}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
