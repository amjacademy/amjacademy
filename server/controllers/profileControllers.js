// profileControllers.js
const {
  getUserById,
  getStudentById,
  getMediaByUserId,
  insertMedia,
  updateAvatar,
  getStoryCharacters,
  getMediaList,
  getAssessmentResponsesByUserId,
} = require("../models/profileModels");

const { streamUpload } = require("../config/cloudinaryConfig");

// -------------------- GET FULL PROFILE --------------------
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Fetch user
    const { data: user, error: userError } = await getUserById(userId);
    if (userError) return res.status(500).json({ error: userError.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2️⃣ Fetch student details
    const { data: student, error: studentError } = await getStudentById(userId);
    if (studentError)
      return res.status(500).json({ error: studentError.message });

    // 3️⃣ Fetch media
    const { data: media, error: mediaError } = await getMediaByUserId(userId);
    if (mediaError) return res.status(500).json({ error: mediaError.message });

    const photos =
      media
        ?.filter((m) => m.resource_type === "photo")
        .map((m) => ({
          name: m.original_filename,
          url: m.secure_url,
        })) || [];

    const videos =
      media
        ?.filter((m) => m.resource_type === "video")
        .map((m) => ({
          name: m.original_filename,
          url: m.secure_url,
        })) || [];

    // ---------------------------------------------------------
    // ⭐ 4️⃣ Fetch Ratings from assessment_responses table
    // ---------------------------------------------------------
   // ⭐ Fetch assessment responses
const responses = await getAssessmentResponsesByUserId(userId);

let rating = 0;

if (responses && responses.length > 0) {
  const totalYes = responses.reduce(
    (sum, row) => sum + Number(row.user_count || 0),
    0
  );
 /*  console.log("Total YES:", totalYes); */

  const numberOfEntries = responses.length;
  const maxPossibleYes = numberOfEntries * 10;

  rating = maxPossibleYes > 0 ? (totalYes / maxPossibleYes) * 5 : 0;
  rating = Number(rating.toFixed(1));
} else {
  console.log("responses:", responses);
}

    


// ⭐ SEND THE RESPONSE (WITH RATING INCLUDED)
return res.json({
  id: user.id,
  name: user.name,
  email: user.email,
  username: user.username,
  profile: student.profile, // from student table
  enrolledSubjects: student.plan, 
  progress: student.progress,
  totalClassesAttended: student.total_attended_classes,
  achievements: student.achievements,
  unlocked: student.unlocked,
  media: { photos, videos },
  rating: rating, // ⭐ THIS IS NOW SAFE
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
