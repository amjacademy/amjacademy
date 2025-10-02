const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { supabase } = require("../config/supabaseClient");
const nodemailer = require("nodemailer");

// JWT Secret
const JWT_SECRET = process.env.USER_JWT_SECRET || "user_jwt_secret";

// In-memory OTP store: { "email": { otp, expiresAt } }
const otpStore = {};

// Helper: send email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // adjust if using other SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
  });
};

// Step 1: Verify username + email, generate OTP
exports.sendOtp = async (req, res) => {
  const { username, email, role } = req.body;
  if (!username || !email || !role)
    return res.status(400).json({ success: false, message: "Username, email, and role required" });

  try {
    const { data: user, error } = await supabase
  .from("enrollments")
  .select("*")
  .eq("username", username)
  .eq("email", email)
  .eq("role", role)
  .single(); // single() ensures only one row is returned


    if (error || !user) {
      return res.status(401).json({ success: false, message: "Username or email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[email] = { otp, expiresAt };

    await sendOtpEmail(email, otp);

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
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

  if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

  // Mark OTP verified
  otpStore[email].verified = true;

  return res.json({ success: true, message: "OTP verified" });
};

// Step 3: Login with password
exports.Login = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role)
    return res.status(400).json({ success: false, message: "Username, email, password, and role required" });

  const otpRecord = otpStore[email];
  if (!otpRecord || !otpRecord.verified)
    return res.status(401).json({ success: false, message: "OTP verification required" });

  try {
    const { data: user, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("username", username)
      .eq("email", email)
      .eq("role", role)
      .single();

    if (error || !user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    /* const isMatch = await bcrypt.compare(password, user.password); */ // assuming hashed password
    const isMatch = password === user.password;
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "45m" });

    // Clear OTP after successful login
    delete otpStore[email];

    // Set cookie
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 45 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
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
                