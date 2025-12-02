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
const errorHandler = require("./utils/errorHandler");
app.use(errorHandler);
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

app.use("/",require("./routes/profileRoutes"));


app.use("/api/messages", require("./routes/messagesRoutes"));

app.use("/api/punctuality", require("./routes/punctualityRoutes"));

app.use("/api/assessments", require("./routes/assessmentRoutes"));


//Teacher Routes
app.use("/api/teacher",require("./routes/teacher/teacherRoutes"));

app.use("/api/teacher/profile",require("./routes/teacher/profileRoutes"));

app.use("/api/teacher/classreport",require("./routes/teacher/classreportRoutes"));

app.use("/api/teacher/punctuality",require("./routes/teacher/punctualityRoutes"));

app.use("/api/teacher/assignment",require("./routes/teacher/assignmentRoutes"));


//Common Routes
app.use("/api/upload", require("./routes/cloudinaryRoutes"));


app.listen(PORT,async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  testSupabaseConnection();
  /* await seedDefaultUsers(); */
});
