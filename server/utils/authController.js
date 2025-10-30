const jwt = require("jsonwebtoken");
const USER_JWT_SECRET = process.env.USER_JWT_SECRET
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
// Middleware to protect user routes
exports.userAuth = (req, res, next) => {
  const token = req.cookies.userToken;
  if (!token)
    return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, USER_JWT_SECRET);
    req.user = decoded; // now includes role
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Expired or Invalid Token!" });
  }
};

// Middleware to protect admin routes
exports.adminAuth = (req, res, next) => {
  console.log("Admin Cookies received:", req.cookies); // 🧠 Debug
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
// Middleware to check user roles
exports.roleAuth = (allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied: insufficient permissions" });
  }

  next();
};
