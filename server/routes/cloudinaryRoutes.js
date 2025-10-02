
const express = require("express");
const router = express.Router();
const { parser } = require("../config/cloudinaryConfig");

router.post("/", parser.single("file"), async (req, res) => {
  try {
    // req.file contains Cloudinary info
    res.json({ url: req.file.path }); // send the Cloudinary URL
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;