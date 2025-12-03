const express = require("express");
const router = express.Router();
const { parser } = require("../config/cloudinaryConfig");

// Error handling middleware for multer/cloudinary
const handleUpload = (req, res, next) => {
  parser.single("file")(req, res, (err) => {
    if (err) {
      console.error("Upload middleware error:", err);
      return res.status(500).json({
        error: "Upload failed",
        details: err.message,
        code: err.code,
      });
    }
    next();
  });
};

router.post("/", handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file received in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("✅ File uploaded successfully:", {
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // req.file.path contains the Cloudinary URL
    res.json({
      url: req.file.path,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

module.exports = router;
