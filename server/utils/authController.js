const jwt = require("jsonwebtoken");
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

// Middleware to protect admin routes
exports.adminAuth = (req, res, next) => {
  console.log("Admin Cookies received:", req.cookies); // 🧠 Debug
  const token = req.cookies.adminToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
// Middleware to check user Token and  also check roles
exports.userAuth = (expectedRole = null) => {
  return (req, res, next) => {
    const token = req.cookies.userToken;

    // 1️⃣ Token missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "NO Token Provided. Please login again.",
      });
    }

    try {
      // decode jwt
      const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);

  

      // if a role is required for this route → check it
    
    // 2️⃣ Role mismatch
if (expectedRole && decoded.role !== expectedRole) {
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  return res.status(401).json({
    success: false,
    message: "Access denied. Please login again.",
  });
}

      req.userId = decoded.id;
      next();
    } catch (err) {
  // 3️⃣ Token expired / invalid
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  return res.status(401).json({
    success: false,
    message: "Session expired. Please login again.",
  });
}
  };
};
