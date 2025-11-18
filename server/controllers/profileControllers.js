// profileControllers.js
const {
  getUserById,
  getStudentById,
  getMediaByUserId,
  insertMedia,
  updateAvatar,
  getStoryCharacters,
  getMediaList,
} = require("../models/profileModels");

const { streamUpload } = require("../config/cloudinaryConfig");

// -------------------- GET FULL PROFILE --------------------
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: user, error: userError } = await getUserById(userId);
    if (userError) return res.status(500).json({ error: userError.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { data: student, error: studentError } = await getStudentById(userId);
    if (studentError)
      return res.status(500).json({ error: studentError.message });

    const { data: media, error: mediaError } = await getMediaByUserId(userId);
    if (mediaError) return res.status(500).json({ error: mediaError.message });

    const photos = media
      ?.filter((m) => m.resource_type === "photo")
      .map((m) => ({
        name: m.original_filename,
        url: m.secure_url,
      })) || [];

    const videos = media
      ?.filter((m) => m.resource_type === "video")
      .map((m) => ({
        name: m.original_filename,
        url: m.secure_url,
      })) || [];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      profile: student?.profile || null,
      totalClassesAttended: student?.total_attended_classes || 0,
      progress: student?.progress || 0,
      achievements: student?.achievements || 0,
      enrolledSubjects: student?.profession || " ",
      unlocked: (student?.unlocked || []).map(Number),
      media: { photos, videos },
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- GET STORY CHARACTERS --------------------
exports.getStoryCharacters = async (req, res) => {
  try {
    const { data, error } = await getStoryCharacters();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- UPLOAD MEDIA --------------------
exports.uploadMedia = async (req, res) => {
  const { userId } = req.params;
  const { originalname, path, mimetype } = req.file;

  try {
    const type = mimetype.startsWith("video/") ? "video" : "photo";

    const payload = {
      user_id: userId,
      public_id: req.file.filename,
      secure_url: req.file.path,
      resource_type: type,
      original_filename: originalname,
      format: path.split(".").pop(),
    };

    const { data, error } = await insertMedia(payload);
    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- UPLOAD PROFILE AVATAR --------------------
exports.uploadAvatar = async (req, res) => {
  const { userId } = req.params;

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await streamUpload(req.file.buffer);

    const { data, error } = await updateAvatar(userId, result.secure_url);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ secure_url: result.secure_url, user: data });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- GET USER MEDIA LIST --------------------
exports.getMedia = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await getMediaList(userId);
    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
