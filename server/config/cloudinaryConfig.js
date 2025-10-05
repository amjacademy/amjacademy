const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = "amj-academy";
    let allowed_formats = ["jpg", "jpeg", "png", "mp4", "mov", "avi"];
    let transformation = [];

    if (file.mimetype.startsWith("image/")) {
      transformation = [{ width: 800, crop: "limit" }];
    } 
    // videos don't need transformations
    return {
      folder,
      allowed_formats,
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
      transformation,
    };
  },
});

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profile-avatars", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const parser = multer({ storage });

module.exports = { cloudinary, parser, streamUpload  };
