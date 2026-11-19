/* global require, process, exports */

const { Resend } = require("resend");

exports.sendContactMessage = async (req, res) => {
  const { name, email, phone = "", age = "", experience = "", message, botcheck = "" } = req.body || {};

  if (botcheck) {
    return res.status(400).json({ success: false, message: "Invalid form submission" });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !message.trim() ||
    name.length > 120 ||
    email.length > 254 ||
    String(phone).length > 40 ||
    String(age).length > 20 ||
    String(experience).length > 60 ||
    message.length > 4000
  ) {
    return res.status(400).json({ success: false, message: "Please check the form and try again." });
  }

  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    console.error("Contact email is not configured: RESEND_API_KEY or ADMIN_EMAIL is missing");
    return res.status(503).json({ success: false, message: "Email service is not configured. Please try again later." });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "AMJ Academy <AMJacademy@amjacademy.in>",
      to: process.env.ADMIN_EMAIL,
      replyTo: email.trim(),
      subject: "New website contact form submission",
      text: [
        "A new message was submitted through the AMJ Academy contact form.",
        "",
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${String(phone).trim() || "Not provided"}`,
        `Age: ${String(age).trim() || "Not provided"}`,
        `Experience: ${String(experience).trim() || "Not provided"}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    });

    if (error) {
      console.error("Contact email delivery failed:", error);
      return res.status(502).json({ success: false, message: "Message could not be sent right now. Please try again later." });
    }

    return res.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact email delivery failed:", error);
    return res.status(500).json({ success: false, message: "Message could not be sent right now. Please try again later." });
  }
};
