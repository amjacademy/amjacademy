const fs = require("fs");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const axios = require("axios");
const cors = require("cors");
const admin = require("./config/firebase");
const db = admin.firestore();

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: "https://amjacademy.in",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

const PORT = process.env.PORT || 5000;



// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// OTP generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// WhatsApp OTP sender
async function sendWhatsAppOTP(number, otp) {
  await axios.post(`https://graph.facebook.com/v20.0/${process.env.META_PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to: number,
    type: "template",
    template: {
      name: process.env.META_TEMPLATE_NAME,
      language: { code: "en_US" },
      components: [{ type: "body", parameters: [{ type: "text", text: otp }] }],
    },
  }, {
    headers: {
      Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
}

async function releaseExpiredSlots() {
  const now = new Date();
  const snapshot = await db.collection("slots").where("status", "==", "blocked").get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.expiresAt && data.expiresAt.toDate() < now) {
      await doc.ref.update({
        status: "open",
        blockedBy: null,
        blockedAt: null,
        selectedDate: null,
        selectedTime: null,
        expiresAt: null
      });
    }
  }
}
// Routes
app.get("/", (req, res) => {
  res.send("Hello From Express with OTP system (WhatsApp + Email)");
});

app.post("/send-otp", async (req, res) => {
  try {
    const { method, value } = req.body;
    if (!method || !value) {
      return res.status(400).json({ success: false, message: "Method and value are required" });
    }

    const otp = generateOTP();

    // Store OTP in Firestore instead of memory
    await db.collection("otp_verifications").doc(value).set({
      otp,
      method,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    });

    if (method === "whatsapp") {
      await sendWhatsAppOTP(value, otp);
      return res.json({ success: true, message: "OTP sent via WhatsApp" });
    }

    if (method === "email") {
      let template = fs.readFileSync(path.join(__dirname, "files", "otp.html"), "utf8");
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

    res.status(400).json({ success: false, message: "Invalid method" });
  } catch (error) {
    console.error("❌ OTP send error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});


app.post("/verify-otp", async (req, res) => {
  try {
    const { value, otp } = req.body;

    const otpDoc = await db.collection("otp_verifications").doc(value).get();
    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    const otpData = otpDoc.data();

    // ✅ Check if OTP expired (5 minutes)
    const now = new Date();
    if ((now - otpData.createdAt.toDate()) > 5 * 60 * 1000) {
      await db.collection("otp_verifications").doc(value).delete();
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (otpData.otp === otp) {
      await db.collection("otp_verifications").doc(value).delete();
      return res.json({ success: true, message: "OTP verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.post("/save-user-details", async (req, res) => {
  try {
    const { phone, email, name, age, experience, instrument, address, parentName, parentPhone } = req.body;

    // You can make phone OR email required based on your flow
    if (!name || !age || !instrument || !experience) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const docRef = await db.collection("registrations").add({
  phone: phone || null,
  email: email || null,
  name,
  age,
  experience,
  instrument,
  address: address || "",
  parentName: parentName || "",
  parentPhone: parentPhone || "",
  createdAt: new Date(),
  expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
});
await docRef.update({ id: docRef.id });

    // Save to Firestore
    console.log("User details saved with ID:", docRef.id);

    res.status(200).json({ success: true, message: "User details saved", id: docRef.id });
  } catch (err) {
    console.error("Error saving user details:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post("/update-slot", async (req, res) => {
  try {
    const { id, name, selectedDate, selectedTime, location } = req.body; // add name here
    if (!id || !name || !selectedDate || !selectedTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Release any previous blocked slot by this user
    const prevSlots = await db.collection("slots")
      .where("blockedBy", "==", id)
      .where("status", "==", "blocked")
      .get();

    for (const doc of prevSlots.docs) {
      await doc.ref.update({
        status: "open",
        blockedBy: null,
        blockedAt: null,
        selectedDate: null,
        selectedTime: null,
        userName: null,
        expiresAt: null
      });
    }

    const slotRef = db.collection("slots").doc(`${selectedDate}_${selectedTime}`);
    const slotDoc = await slotRef.get();
    if (slotDoc.exists && slotDoc.data().status !== "open") {
      return res.status(400).json({ success: false, message: "Slot already taken" });
    }

    await slotRef.set({
      status: "blocked",
      blockedBy: id,
      blockedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // slot lock expiration (5 mins)
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // document lifetime (7 days)
      location: location || "AMJ Academy Main Center",
      selectedDate,
      selectedTime,
      userName: name, // store user's name
      timeSlotLabel: `${selectedTime}`, // store readable timeslot
    });

    res.json({ success: true, message: "Slot blocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.post("/release-slot", async (req, res) => {
  const { id, selectedDate, selectedTime } = req.body;
  const slotId = `${selectedDate}_${selectedTime}`;
  try {
    const ref = db.collection("slots").doc(slotId);
    const snap = await ref.get();
    if (snap.exists) {
      const s = snap.data();
      if (s.status === "blocked" && s.blockedBy === id) { // FIXED: check blockedBy
        await ref.update({
          status: "open",
          blockedBy: null,
          blockedAt: null,
          selectedDate: null,
          selectedTime: null
        });
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: "Could not release slot" });
  }
});



app.post("/complete-registration", async (req, res) => {
  try {
    const { id, selectedDate, selectedTime } = req.body;

    const slotRef = db.collection("slots").doc(`${selectedDate}_${selectedTime}`);
    const slotDoc = await slotRef.get();

    if (!slotDoc.exists || slotDoc.data().status !== "blocked" || slotDoc.data().blockedBy !== id) {
      return res.status(400).json({ success: false, message: "Slot is not reserved by you" });
    }

    // Fetch user data from registrations collection
    const userQuery = await db.collection("registrations").where("id", "==", id).limit(1).get();
    if (userQuery.empty) {
      return res.status(404).json({ success: false, message: "User registration data not found" });
    }
    const userData = userQuery.docs[0].data();

    // Mark slot as booked
    await slotRef.update({
      status: "booked",
      bookedBy: id,
      bookedAt: new Date(),
      blockedBy: null,
      blockedAt: null,
      selectedDate,
      selectedTime,
      userName: slotDoc.data().userName || userData.name || null,
      timeSlotLabel: slotDoc.data().timeSlotLabel || `${selectedTime}`,
    });

    // Send confirmation email to the user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: "Registration Confirmation",
      html: `
        <h2>Registration Confirmed</h2>
        <p>Hello <strong>${userData.name}</strong>,</p>
        <p>Your registration is confirmed.</p>
        <ul>
          <li><strong>Confirmation Date:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>Slot Date:</strong> ${selectedDate}</li>
          <li><strong>Slot Time:</strong> ${selectedTime}</li>
          <li><strong>Owner Contact:</strong> ${process.env.OWNER_PHONE}</li>
        </ul>
        <p>Thank you!</p>
      `
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Registration",
      html: `
        <h2>New Registration</h2>
        <ul>
          <li><strong>Name:</strong> ${userData.name}</li>
          <li><strong>Email:</strong> ${userData.email}</li>
          <li><strong>Slot Date:</strong> ${selectedDate}</li>
          <li><strong>Slot Time:</strong> ${selectedTime}</li>
        </ul>
        <h3>Full Registration Data</h3>
        <pre>${JSON.stringify(userData, null, 2)}</pre>
      `
    });

    res.json({ success: true, message: "Registration completed and emails sent" });

  } catch (err) {
    console.error("Error completing registration:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.get("/get-slots/:date", async (req, res) => {
  try {
    await releaseExpiredSlots();
    const snapshot = await db.collection("slots")
      .where("selectedDate", "==", req.params.date)
      .get();
    const slots = [];
    snapshot.forEach(doc => slots.push({ id: doc.id, ...doc.data() }));
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching slots" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
