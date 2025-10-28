const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { supabase } = require("../config/supabaseClient");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// JWT Secret
const USER_JWT = process.env.USER_JWT_SECRET ;


// In-memory OTP store: { "email": { otp, expiresAt, verified } }
const otpStore = {};

// Helper: send email via Resend API
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

// Step 1: Send OTP
exports.sendOtp = async (req, res) => {
  const { username, email, role } = req.body;
  /* console.log("sendOtp called with:", { username, email, role }); */

  if (!username || !email || !role)
    return res.status(400).json({ success: false, message: "Username, email, and role required" });

  try {
    const { data: user, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("username", username)
      .eq("email", email)
      .eq("role", role)
      .single();

    console.log("sendOtp DB result:", { user, error });

    if (error || !user) {
      /* console.log("User not found for OTP"); */
      return res.status(401).json({ success: false, message: "Username or email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    /* console.log(`OTP generated for ${email}: ${otp}`); */

    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[email] = { otp, expiresAt, verified: false };
    /* console.log("OTP stored in memory:", otpStore[email]); */

    /* console.log(`OTP generated before sending to ${email}: ${otp}`); */
    await sendOtpEmail(email, otp);

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("sendOtp server error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  /* console.log("OTP submitted", { email, otp }); */

  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP required" });

  const record = otpStore[email];
  /* console.log("verifyOtp store record:", record);
 */
  if (!record) return res.status(400).json({ success: false, message: "OTP not found" });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    /* console.log("OTP expired, deleted from store"); */
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp) {
    /* console.log("OTP mismatch:", otp, record.otp); */
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // Mark verified
  otpStore[email].verified = true;
  /* console.log("OTP verified successfully:", otpStore[email]); */

  return res.json({ success: true, message: "OTP verified" });
};

// Step 3: Login
exports.Login = async (req, res) => {
  const { username, email, password, role } = req.body;
  /* console.log("Login called with:", { username, email, role }); */

  if (!username || !email || !password || !role)
    return res.status(400).json({ success: false, message: "Username, email, password, and role required" });

  const otpRecord = otpStore[email];
  /* console.log("Login OTP record:", otpRecord); */

  if (!otpRecord || !otpRecord.verified) {
    console.log("OTP verification required error");
    return res.status(401).json({ success: false, message: "OTP verification required" });
  }

  try {
    const { data: user, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("username", username)
      .eq("email", email)
      .eq("role", role)
      .single();

    /* console.log("Login DB result:", { user, error }); */

    if (error || !user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = password === user.password;
    /* console.log("Password match:", isMatch); */

    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role }, // <-- add role here
  USER_JWT,
  { expiresIn: "30d" });

    delete otpStore[email];
    /* console.log("OTP record deleted after login"); */

   /*  res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 45 * 60 * 1000,
    }); */

  res.cookie("userToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true in prod, false in dev
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});
    return res.json({ success: true, message: "Login successful", id: user.id });
  } catch (err) {
    console.error("Login server error:", err);
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
};    

// Step 4: Verify Login (Persistent Login Check)
exports.verifyLogin = async (req, res) => {
  try {
    const adminToken = req.cookies?.adminToken;
    const userToken = req.cookies?.userToken;

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
          .from("enrollments")
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
