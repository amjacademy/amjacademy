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

  if (!username || !email || !role)
    return res.status(400).json({ success: false, message: "Username, email, and role are required" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("email", email)
      .eq("role", role)
      .single();

    if (error || !user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, verified: false };

    await sendOtpEmail(email, otp);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP required" });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ success: false, message: "OTP not found" });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp)
    return res.status(400).json({ success: false, message: "Invalid OTP" });

  otpStore[email].verified = true;
  return res.json({ success: true, message: "OTP verified successfully" });
};

// Step 3: Login
exports.Login = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role)
    return res.status(400).json({ success: false, message: "All fields are required" });

  const otpRecord = otpStore[email];
  if (!otpRecord || !otpRecord.verified)
    return res.status(401).json({ success: false, message: "OTP verification required" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("email", email)
      .eq("role", role)
      .single();

    if (error || !user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = password == user.password;
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      USER_JWT,
      { expiresIn: "30d" }
    );

    delete otpStore[email];

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful", id: user.id });
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
    if (!userToken)
      return res.status(401).json({ success: false, message: "Unauthorized: No token found" });

    const decoded = jwt.verify(userToken, USER_JWT);
    const { id, role } = decoded;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, role")
      .eq("id", id)
      .single();

    if (error || !user)
      return res.status(404).json({ success: false, message: "User not found" });

    const redirectPath =
      role === "student"
        ? "/student-dashboard"
        : role === "teacher"
        ? "/teacher-dashboard"
        : role === "admin"
        ? "/admin-dashboard"
        : null;

    if (!redirectPath)
      return res.status(401).json({ success: false, message: "Unauthorized role" });

    return res.status(200).json({
      success: true,
      role,
      redirect: redirectPath,
      user,
    });
  } catch (err) {
    console.error("verifyLogin error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
