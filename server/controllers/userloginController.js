const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { supabase } = require("../config/supabaseClient");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// JWT Secret
const USER_JWT = process.env.USER_JWT_SECRET ;


// In-memory OTP store: { "email": { otp, expiresAt, verified } }
const otpStore = {};

// -------------------------------
// Helper: send email via Resend API
// -------------------------------
const sendOtpEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: "AMJacademy@amjacademy.in",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    });
    console.log(`✅ OTP sent to ${email}: ${otp}`);
  } catch (err) {
    console.error("❌ OTP send error:", err);
    throw err;
  }
};


// -------------------------------
// Step 1: Send OTP
// -------------------------------
exports.sendOtp = async (req, res) => {
  const { username, email, role } = req.body;

  if (!username || !email || !role)
    return res.status(400).json({ success: false, message: "Username, email, and role are required" });

  const cleanUser = username.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanRole = role.trim();

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", cleanUser)   // ✔ Matches schema
      .eq("role", cleanRole)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "User not found with this username and role" });
    }

    const mainEmail = user.email?.toLowerCase();
    const altEmail = user.additional_email?.toLowerCase();

    let targetEmail = null;

    if (cleanEmail === mainEmail) targetEmail = mainEmail;
    else if (cleanEmail === altEmail) targetEmail = altEmail;
    else {
      return res.status(400).json({ success: false, message: `Email does not match user's records` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[targetEmail] = {
      otp,
      username: cleanUser,
      role: cleanRole,
      expiresAt: Date.now() + 5 * 60 * 1000,
      verified: false
    };

    await sendOtpEmail(targetEmail, otp);

    return res.json({ success: true, message: `OTP sent to ${targetEmail}` });

  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



// -------------------------------
// Step 2: Verify OTP
// -------------------------------
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP required" });

  const cleanEmail = email.trim().toLowerCase();

  const record = otpStore[cleanEmail];
  if (!record)
    return res.status(400).json({ success: false, message: "OTP not found" });

  if (Date.now() > record.expiresAt) {
    delete otpStore[cleanEmail];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp)
    return res.status(400).json({ success: false, message: "Invalid OTP" });

  otpStore[cleanEmail].verified = true;

  return res.json({ success: true, message: "OTP verified successfully" });
};


// -------------------------------
// Step 3: Login
// -------------------------------
exports.Login = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role)
    return res.status(400).json({ success: false, message: "All fields are required" });

  const cleanEmail = email.trim().toLowerCase();
  const cleanUser = username.trim();
  const cleanRole = role.trim();

  const otpRecord = otpStore[cleanEmail];
  if (!otpRecord || !otpRecord.verified)
    return res.status(401).json({ success: false, message: "OTP verification required" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", cleanUser)    // ✔ FIXED
      .or(`email.eq.${cleanEmail},additional_email.eq.${cleanEmail}`)
      .eq("role", cleanRole)
      .single();

    if (error || !user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = password === user.password;
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    // Fetch enrollment data for profile information
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("id", user.enrollment_id)
      .single();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      USER_JWT,
      { expiresIn: "30d" }
    );

    delete otpStore[cleanEmail];

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      id: user.id,
      profile: enrollment || null
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



// Middleware: protect user routes
exports.userAuth = (req, res, next) => {
  const token = req.cookies.userToken;
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Check user authentication status
exports.checkAuth = (req, res) => {
  const token = req.cookies.userToken;
  if (!token) return res.status(401).json({ success: false, message: "Not logged in" });
  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: "Token expired" });
      res.json({ success: true, userId: decoded.id, email: decoded.email });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
exports.Logout = (req, res) => {
  res.clearCookie("userToken", {
    httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ true only in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ success: true, message: "User Logged out successfully" });
};    

// Step 4: Verify Login (Persistent Check)
exports.verifyLogin = async (req, res) => {
  try {
    const userToken = req.cookies?.userToken;
    const adminToken = req.cookies?.adminToken;
     // 1️⃣ Admin token check (no database verification)
    if (adminToken) {
      try {
        const decodedAdmin = jwt.verify(adminToken, process.env.ADMIN_JWT_SECRET);

        return res.status(200).json({
          success: true,
          role: "admin",
          redirect: "/admin-dashboard",
          user: { username: decodedAdmin.user  },
        });
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired admin token",
        });
      }
    }

    // 2️⃣ User token check (Student / Teacher)
    if (userToken) {
      try {
        const decodedUser = jwt.verify(userToken, process.env.USER_JWT_SECRET);
        const { id, role } = decodedUser;

        if (!id || !role) {
          return res.status(400).json({
            success: false,
            message: "Invalid user token payload",
          });
        }

        // Both Student & Teacher are in 'enrollments' table
        const { data: user, error } = await supabase
          .from("users")
          .select("id, username, email, role")
          .eq("id", id)
          .single();

        if (error || !user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Redirect based on role
        const redirectPath =
          role === "Student"
            ? "/student-dashboard"
            : role === "Teacher"
            ? "/teacher-dashboard"
            : null;

        if (!redirectPath) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid role",
          });
        }

        return res.status(200).json({
          success: true,
          role,
          redirect: redirectPath,
          user,
        });
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired user token",
        });
      }
    }

    // 3️⃣ Neither adminToken nor userToken found
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No valid token found",
    });
  } catch (err) {
    console.error("verifyLogin error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during verification",
    });
  }
};
