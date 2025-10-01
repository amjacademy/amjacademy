const fs = require("fs");
const path = require("path");
const { db } = require("../config/firebase");
const transporter = require("../config/nodemailer"); 
const generateOTP = require("../utils/generateOTP");
const sendWhatsAppOTP = require("../utils/sendWhatsApp");

exports.sendOtp = async (req, res) => {
  try {
    const { method, value } = req.body;
    if (!method || !value) {
      return res.status(400).json({ success: false, message: "Method and value are required" });
    }

    const otp = generateOTP();
    const expireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Save OTP in Firestore
    await db.collection("otp_verifications").doc(value).set({
      otp,
      method,
      createdAt: new Date(),
      expireAt
    });

    // Send via WhatsApp
    if (method === "whatsapp") {
      await sendWhatsAppOTP(value, otp);
      return res.json({ success: true, message: "OTP sent via WhatsApp" });
    }

    // Send via Email
    if (method === "email") {
      let template = fs.readFileSync(path.join(__dirname, "../files/otp.html"), "utf8");
      template = template.replace("{{OTP}}", otp);

      await transporter.sendMail({
        from: `"AMJ Academy" <${process.env.EMAIL_USER}>`,
        to: value,
        subject: "Verify your email address",
        html: template,
      });

      console.log(`✅ Email OTP sent to ${value}`);
      return res.json({ success: true, message: "OTP sent via Email" });
    }

    return res.status(400).json({ success: false, message: "Invalid method" });

  } catch (error) {
    console.error("❌ OTP send error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyotp = async (req, res) => {
  try {
    const { value, otp } = req.body; // 'value' is email/phone/ID

    if (!value || !otp) {
      return res.status(400).json({ success: false, message: "Value and OTP are required" });
    }

    // Get OTP document from Firestore
    const otpDocRef = db.collection("otp_verifications").doc(value);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    const otpData = otpDoc.data();
    const now = new Date();

    // Check OTP expiry (10 minutes)
    if (otpData.expireAt.toDate() < now) {
      await otpDocRef.delete(); // delete expired OTP
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // Check OTP match
    if (otpData.otp === otp) {
      await otpDocRef.delete(); // delete OTP after successful verification
      return res.json({ success: true, message: "OTP verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
