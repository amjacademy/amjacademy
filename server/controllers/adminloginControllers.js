const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SESSION_DURATION = parseInt(process.env.SESSION_DURATION_MIN || "172800"); // minutes
const ADMIN_JWT = process.env.ADMIN_JWT_SECRET ;
// Admin Login
exports.Login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: "admin" }, ADMIN_JWT, { expiresIn: "172800m" });

   /*  res.clearCookie("adminToken", {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "None"
}); */
    // Set JWT in HttpOnly cookie
res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 172800 * 60 * 1000,
    });


    return res.json({
      success: true,
      message: "Admin Login successful",
      expiresIn: 172800 * 60, // 4months*seconds
    });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
};

// Middleware to protect admin routes
exports.adminAuth = (req, res, next) => {
  console.log("Cookies received:", req.cookies); // 🧠 Debug
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });
  try {
    const decoded = jwt.verify(token, ADMIN_JWT);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


exports.checkAuth = (req, res) => {
  try {
    const token = req.cookies.adminToken; // read cookie
    if (!token) return res.status(401).json({ success: false, message: "Not logged in" });

    jwt.verify(token, ADMIN_JWT, (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: "Token expired" });

      res.json({ success: true, username: decoded.username });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout controller
exports.Logout = async (req, res) => {
  res.clearCookie("adminToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ true only in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ success: true, message: "Admin Logged out successfully" });
};

;
