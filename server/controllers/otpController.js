const fs = require("fs");
const path = require("path");
const { db } = require("../config/firebase");
const { Resend } = require("resend"); // ✅ Import Resend
const generateOTP = require("../utils/generateOTP");
const sendWhatsAppOTP = require("../utils/sendWhatsApp");

const resend = new Resend(process.env.RESEND_API_KEY); // initialize Resend

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

    // Send via Email using Resend
    if (method === "email") {
      let template = fs.readFileSync(path.join(__dirname, "../files/otp.html"), "utf8");
      template = template.replace("{{OTP}}", otp);

      await resend.emails.send({
        from: "AMJ Academy <no-reply@amjacademy.in>", // your verified sender
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
    const { value, otp } = req.body;
    if (!value || !otp) {
      return res.status(400).json({ success: false, message: "Value and OTP are required" });
    }

    const doc = await db.collection("otp_verifications").doc(value).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    const { otp: storedOtp, expireAt } = doc.data();
    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > expireAt) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP is valid
    await db.collection("otp_verifications").doc(value).delete();
    res.json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    console.error("❌ OTP verify error:", error.message);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};