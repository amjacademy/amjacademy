const fs = require("fs");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const cors = require("cors");
const { admin, db } = require("./config/firebase");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinaryConfig"); // the file we just created
const router = express.Router();
const { parser } = require("./config/cloudinaryConfig");
const { streamUpload } = require("./config/cloudinaryConfig");
const transporter = require("./config/nodemailer"); 
const cookieParser = require("cookie-parser");
const seedDefaultUsers = require("./utils/seedDefaultusers");
const {testSupabaseConnection}=require("./config/supabaseClient");
const uploadRoute = require("./routes/cloudinaryRoutes");
const arrangementsRoutes = require("./routes/arrangementRoutes");
const memoryStorage = multer.memoryStorage(); // keep files in memory
const upload = multer({ memoryStorage });
const { adminAuth } = require("./utils/authController");
const app = express();
// Replace your current CORS middleware with:
const allowedOrigins = ['http://localhost:5173', 'https://amjacademy.in'];
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS request from:", origin);
    if (!origin) return callback(null, true); // allow non-browser requests (like Postman)

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allow
    } else {
      callback(null, false); // deny without throwing error
    }
  },
  credentials: true,
}));

app.use(express.json());

const { supabase } = require("./config/supabaseClient");

const PORT = process.env.PORT || 5000;

// Routes
app.get("/", (req, res) => {
  res.send("Hello From Express with OTP system (WhatsApp + Email)");
});


//DEMO BOOKING ROUTES
app.use("/api/otp", require("./routes/otpRoutes"));

app.use("/api/slot", require("./routes/slotbookingRoutes"));


//Admin Routes
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/api/counts", adminAuth, async (req, res) => {
  try {
    // enrollments (students/teachers)
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("role");

    // announcements & schedules
    const { data: announcements } = await supabase.from("announcements").select("id");
    const { data: schedules } = await supabase.from("arrangements").select("id");

    // 1) Try primary source: notifications table (if you have it)
    let notificationsCount = 0;
    try {
      const { count: notifCountFromTable, error: notifErr } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);; // head:true returns only count
      if (notifErr) throw notifErr;
      // supabase returns count in `notifCountFromTable`
      notificationsCount = notifCountFromTable || 0;
    } catch (err) {
      // fallback: if notifications table not present or query fails, use rescheduled arrangements
      try {
        const { count: reschedCount, error: reschedErr } = await supabase
          .from("arrangements")
          .select("id", { count: "exact", head: true })
          .eq("rescheduled", true);

        if (reschedErr) throw reschedErr;
        notificationsCount = reschedCount || 0;
      } catch (err2) {
        console.warn("Failed to compute notifications count from both notifications table and arrangements rescheduled", err2);
        notificationsCount = 0;
      }
    }

    const studentsCount = (enrollments || []).filter(e => (e.role || "").toLowerCase() === "student").length;
    const teachersCount = (enrollments || []).filter(e => (e.role || "").toLowerCase() === "teacher").length;

    res.json({
      students: studentsCount,
      teachers: teachersCount,
      announcements: announcements?.length || 0,
      schedules: schedules?.length || 0,
      notifications: notificationsCount,
    });
  } catch (err) {
    console.error("Error in /api/counts:", err);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});


app.use("/api/enrollments", require("./routes/enrollmentRoutes"));

app.use("/api/announcements", require("./routes/announcementRoutes"));

app.use("/api/arrangements",require("./routes/arrangementRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/grouparrangements", require("./routes/grouparrangementRoutes"));
//Login Route
app.use("/api/users", require("./routes/userloginRoutes"));


//Student Routes
app.use("/api/student", require("./routes/studentRoutes"));

app.use("/api/classreport", require("./routes/classreportRoutes"));

app.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (userError) return res.status(500).json({ error: userError.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("name, email, username, phone, profession, age")
      .eq("id", userId)
      .maybeSingle();
    if (enrollmentError) return res.status(500).json({ error: enrollmentError.message });

    // Fetch media
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("*")
      .eq("user_id", userId);
    if (mediaError) return res.status(500).json({ error: mediaError.message });

    // Fetch unlocked characters
    const { data: unlocked, error: unlockedError } = await supabase
      .from("user_characters")
      .select("character_id")
      .eq("user_id", userId);
    if (unlockedError) return res.status(500).json({ error: unlockedError.message });

    // Merge into profile object
    const profile = {
      ...user,
      enrollment: enrollment || null,
      media: media || [],
      unlocked: unlocked?.map((uc) => uc.character_id) || [],
    };

    res.json(profile);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const updates = req.body; // { avatar, total_classes_attended, progress, achievements, enrolled_subjects }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/profile/init", async (req, res) => {
  const { userId, enrollmentId } = req.body;

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile)
      return res.json({ message: "Profile already exists", profile: existingProfile });

    // Insert new profile
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          enrollment_id: enrollmentId,
          avatar: null,
          total_classes_attended: 0,
          progress: "0%",
          achievements: 0,
          enrolled_subjects: [],
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/story-characters", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("story_characters")
      .select("*")
      .order("id", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/media/:userId/upload", parser.single("file"), async (req, res) => {
  const { userId } = req.params;
  const { originalname, path, mimetype } = req.file;

  try {
    const type = mimetype.startsWith("video/") ? "video" : "photo";
    const cleanType = type.trim(); // remove any whitespace


    const { data, error } = await supabase
      .from("media")
      .insert([
        {
          user_id: userId,
          public_id: req.file.filename,
          secure_url: req.file.path, // Cloudinary URL
          resource_type: type,
          original_filename: originalname,
          format: path.split(".").pop(),
        },
      ])
      .select()
      .single();

    if (error){ 
      console.log("error",error);
      return res.status(400).json({ error: error.message });}
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/profile/:userId/avatar", upload.single("avatar"), async (req, res) => {
  const { userId } = req.params;

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await streamUpload(req.file.buffer);
    const { data, error } = await supabase
      .from("users")
      .update({ avatar: result.secure_url })
      .eq("id", userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ secure_url: result.secure_url, user: data });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/media/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching media:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data); // send array of media
  } catch (err) {
    console.error("Server error fetching media:", err);
    res.status(500).json({ error: "Server error" });
  }
});


//Teacher Routes
app.use("/api/teacher",require("./routes/teacher/teacherRoutes"));


//Common Routes
app.use("/api/upload", require("./routes/cloudinaryRoutes"));


app.listen(PORT,async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  testSupabaseConnection();
  /* await seedDefaultUsers(); */
});
