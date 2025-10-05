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
/* const multer = require("multer"); */
const memoryStorage = multer.memoryStorage(); // keep files in memory
const upload = multer({ memoryStorage });

dotenv.config();
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

app.use("/api/otp", require("./routes/otpRoutes"));

app.use("/api/slot", require("./routes/slotbookingRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/enrollments", require("./routes/enrollmentRoutes"));

app.use("/api/upload", require("./routes/cloudinaryRoutes"));

app.use("/api/announcements", require("./routes/announcementRoutes"));

app.get("/api/counts", async (req, res) => {
  try {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("role");

    const { data: announcements } = await supabase.from("announcements").select("id");
    const { data: schedules } = await supabase.from("arrangements").select("id"); 

    const studentsCount = enrollments.filter(e => e.role === "Student").length;
    const teachersCount = enrollments.filter(e => e.role === "Teacher").length;
    const schedulesCount = schedules.length;
    res.json({
      students: studentsCount,
      teachers: teachersCount,
      announcements: announcements.length,
      schedules: schedulesCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

app.use("/api/arrangements",require("./routes/arrangementRoutes"));

app.use("/api/users", require("./routes/userloginRoutes"));

app.use("/api/student", require("./routes/studentRoutes"));


// GET /profile/:userId
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

// PUT /profile/:userId
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

// POST /profile/init
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

// GET /story-characters
// Example using Express
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

// POST /media/:userId/upload
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


// GET all media for a user
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












/* // Course API endpoints
app.get("/api/courses", async (req, res) => {
  try {
    const snapshot = await db.collection("courses").get();
    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const doc = await db.collection("courses").doc(courseId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    res.json({ success: true, course: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching course details" });
  }
});
 */
/*  app.post("/api/login", async (req, res) => {
  try {
    console.log("Backend login request body:", req.body);
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, message: "Email, password and userType are required" });
    }

    // Query the single 'users' collection with role filter
  const normalizedRole = userType.toLowerCase();

const snapshot = await db.collection("users")
  .where("email", "==", email)
  .where("role", "==", normalizedRole)
  .limit(1)
  .get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: `${userType} not found` });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Password check (plaintext for now)
    if (userData.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { uid: userDoc.id, role: userType },
      JWT_SECRET,
      { expiresIn: "7d" } // 7 days for persistent login
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with user data (token also included optionally)
    res.json({
      success: true,
      token, // optional, cookie is enough
      role: userType,
      username: userData.username,
      email: userData.email,
      
      // return correct ID based on role
      studentId: userData.role === "student" ? userData.studentId : null,
      teacherId: userData.role === "teacher" ? userData.teacherId : null,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}); */

// Upload single profile image (improved debug + response)
/* app.post("/upload/profile", parser.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // `req.file.path` should contain the Cloudinary secure URL
    const url = req.file.path; 
    const public_id = req.file.filename || req.file.public_id || null;

    if (!url) {
      throw new Error("Cloudinary upload did not return a URL");
    }

    console.log("Uploaded file URL:", url);

    return res.json({
      success: true,
      url,
      public_id,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
}); */

/* app.post("/upload/multiple", parser.array("files", 10), async (req, res) => {
  const { email } = req.body;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const filesData = req.files
      .map(file => {
        const url = file.path || file.secure_url || null;
        if (!url) return null;
        return {
          url,
          name: file.originalname || file.filename || url.split("/").pop(),
          public_id: file.filename || file.public_id || null,
          type: file.mimetype?.startsWith("video/") ? "video" : "photo",
          uploadedAt: new Date(),
        };
      })
      .filter(Boolean);

    if (filesData.length === 0) {
      return res.status(500).json({ success: false, message: "All uploads failed" });
    }

    if (email) {
      const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({
          media: admin.firestore.FieldValue.arrayUnion(...filesData),
          updatedAt: new Date(),
        });
        const updated = await userDoc.ref.get();
        return res.json({ success: true, files: filesData, user: { id: updated.id, ...updated.data() } });
      } else {
        const newUserRef = db.collection("users").doc();
        await newUserRef.set({
          email,
          media: filesData,
          createdAt: new Date(),
        });
        const created = await newUserRef.get();
        return res.json({ success: true, files: filesData, user: { id: created.id, ...created.data() } });
      }
    }

    return res.json({ success: true, files: filesData });
  } catch (err) {
    console.error("❌ Multiple upload failed:", err);
    return res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
}); */

/* app.post("/api/profile/update-avatar-by-email", async (req, res) => {
  try {
    const { email, avatarUrl } = req.body;
    if (!email || !avatarUrl) return res.status(400).json({ success: false, message: "email and avatarUrl required" });

    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ success: false, message: "User not found" });

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ avatar: avatarUrl, updatedAt: new Date() });

    // Read back updated doc
    const updated = await userDoc.ref.get();
    res.json({ success: true, message: "Avatar updated", user: { id: updated.id, ...updated.data() } });
  } catch (err) {
    console.error("Update avatar by email error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}); */

// GET user by email - accept encoded email safely
app.get("/api/user-by-email/:email", async (req, res) => {
  try {
    const emailParam = decodeURIComponent(req.params.email); // handle encoded @, + etc
    const snapshot = await db.collection("users").where("email", "==", emailParam).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const userDoc = snapshot.docs[0];
    res.json({ success: true, user: { id: userDoc.id, ...userDoc.data() } });
  } catch (err) {
    console.error("Get user by email error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/user-media/:email", async (req, res) => {
  try {
    const emailParam = decodeURIComponent(req.params.email);

    // Query user by email
    const snapshot = await db.collection("users").where("email", "==", emailParam).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    return res.json({ success: true, user: { id: userDoc.id, ...userData } });
  } catch (err) {
    console.error("❌ Fetch media failed:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET user by doc id
app.get("/api/user/:id", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/classes", async (req, res) => {
  try {
    const {
      studentId,
      teacherId,
      title = "Piano Lesson",
      batch = "Individual Batch",
      level = "Beginner",
      plan = "Basic Plan",
      duration = "45 min",
      link,
      when, // ISO string: e.g., "2025-09-28T14:00:00Z"
    } = req.body;

    if (!studentId || !teacherId || !when) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newClass = {
      studentId,
      teacherId,
      title,
      batch,
      level,
      plan,
      duration,
      link,
      status: "upcoming",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      when,
    };

    const classRef = await db.collection("classes").add(newClass);

    return res.json({ success: true, id: classRef.id, class: newClass });
  } catch (err) {
    console.error("Create class failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/classes", async (req, res) => {
  try {
    const snapshot = await db.collection("classes")
      .orderBy("when")
      .get();

    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, classes });
  } catch (err) {
    console.error("Fetch all classes failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/classes/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const snapshot = await db.collection("classes")
      .where("studentId", "==", studentId)
      .where("status", "==", "upcoming")
      .orderBy("when")
      .get();

    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, classes });
  } catch (err) {
    console.error("Fetch student classes failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/classes/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const snapshot = await db.collection("classes")
      .where("teacherId", "==", teacherId)
      .where("status", "==", "upcoming")
      .orderBy("when")
      .get();

    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, classes });
  } catch (err) {
    console.error("Fetch teacher classes failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.patch("/api/classes/:classId", async (req, res) => {
  try {
    const { classId } = req.params;
    const updates = req.body;

    await db.collection("classes").doc(classId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedClass = await db.collection("classes").doc(classId).get();

    res.json({ success: true, class: { id: updatedClass.id, ...updatedClass.data() } });
  } catch (err) {
    console.error("Update class failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/classes/:classId", async (req, res) => {
  try {
    const { classId } = req.params;
    await db.collection("classes").doc(classId).delete();
    res.json({ success: true, message: "Class deleted successfully" });
  } catch (err) {
    console.error("Delete class failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const snapshot = await db.collection("users").where("role", "==", "student").get();
    const students = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.username, // use username as display name
        ...data
      };
    });
    res.json({ success: true, students });
  } catch (err) {
    console.error("Fetch students failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all teachers
app.get("/api/teachers", async (req, res) => {
  try {
    const snapshot = await db.collection("users").where("role", "==", "teacher").get();
    const teachers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.username, // use username as display name
        ...data
      };
    });
    res.json({ success: true, teachers });
  } catch (err) {
    console.error("Fetch teachers failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.listen(PORT,async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  testSupabaseConnection();
  /* await seedDefaultUsers(); */
});
