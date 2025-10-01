const { db } = require("../config/firebase");
const transporter = require("../config/nodemailer"); 

// Block or reserve a slot
exports.updateSlot = async (req, res) => {
  try {
    const { id, name, selectedDate, selectedTime, location } = req.body;

    if (!id || !name || !selectedDate || !selectedTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const loc = location || "AMJ Academy Main Center";
    const slotId = `${loc}_${selectedDate}_${selectedTime}`;
    const slotRef = db.collection("slots").doc(slotId);

    // Use Firestore transaction for atomic slot reservation
    await db.runTransaction(async (t) => {
      const slotDoc = await t.get(slotRef);

      // If slot exists and is not open → already taken
      if (slotDoc.exists && slotDoc.data().status !== "open") {
        throw new Error("Slot already booked or blocked by someone else");
      }

      // Block the slot
      t.set(slotRef, {
        status: "blocked",
        blockedBy: id,
        userName: name,
        location: loc,
        selectedDate,
        selectedTime,
        blockedAt: new Date(),
        lockExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min hold
        ttlExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // cleanup after 7 days
      });

      // Release any previous blocked slots by this user
      const prevSlots = await db.collection("slots")
        .where("blockedBy", "==", id)
        .where("status", "==", "blocked")
        .get();

      if (!prevSlots.empty) {
        prevSlots.docs.forEach((doc) => {
          t.update(doc.ref, {
            status: "open",
            blockedBy: null,
            blockedAt: null,
            selectedDate: null,
            selectedTime: null,
            userName: null,
            location: null,
            lockExpiresAt: null,
            ttlExpiresAt: null
          });
        });
      }
    });

    res.json({ success: true, message: "Slot blocked successfully", id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Failed to block slot" });
  }
};

// Release Slot
exports.releaseSlot = async (req, res) => {
  try {
    const { id, selectedDate, selectedTime, location } = req.body;
    if (!id || !selectedDate || !selectedTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const loc = location || "AMJ Academy Main Center";
    const slotId = `${loc}_${selectedDate}_${selectedTime}`;
    const slotRef = db.collection("slots").doc(slotId);
    const slotSnap = await slotRef.get();

    if (slotSnap.exists) {
      const data = slotSnap.data();

      if (data.status === "blocked" && data.blockedBy === id) {
        await slotRef.update({
          status: "open",
          blockedBy: null,
          blockedAt: null,
          selectedDate: null,
          selectedTime: null,
          userName: null,
          location: null,
          lockExpiresAt: null,
          ttlExpiresAt: null
        });
      } else {
        return res.status(400).json({ success: false, message: "Cannot release slot: not blocked by you" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Slot does not exist" });
    }

    res.json({ success: true, message: "Slot released successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Could not release slot" });
  }
};

// Finalize Slot Booking
exports.finalizeSlot = async (req, res) => {
  try {
    const { id, selectedDate, selectedTime, location, name, contact, personalDetails } = req.body;

    if (!id || !selectedDate || !selectedTime || !name) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const slotId = `${location || "AMJ Academy Main Center"}_${selectedDate}_${selectedTime}`;
    const slotRef = db.collection("slots").doc(slotId);
    const slotSnap = await slotRef.get();

    if (!slotSnap.exists) {
      return res.status(400).json({ success: false, message: "Slot does not exist" });
    }

    const slotData = slotSnap.data();

    if (slotData.blockedBy !== id) {
      return res.status(400).json({ success: false, message: "Slot is not reserved by you" });
    }

    // 1️⃣ Save full registration in "registrations"
    const registrationRef = db.collection("registrations").doc();
    const registrationId = registrationRef.id;

    const registrationPayload = {
      id: registrationId,
      slotId,
      selectedDate,
      selectedTime,
      location: location || "AMJ Academy Main Center",
      name,
      contact,
      personalDetails: personalDetails || {},
      createdAt: new Date(),
    };

    await registrationRef.set(registrationPayload);

    // 2️⃣ Update the slot as booked
    await slotRef.update({
      status: "booked",
      bookedBy: id,
      bookedAt: new Date(),
      blockedBy: null,
      blockedAt: null,
      userName: name,
      contact,
      personalDetails: personalDetails || {},
    });

    // 3️⃣ Send confirmation email to user (only if contact is an email)
    if (contact && contact.includes("@")) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: contact,
          subject: "🎵 Registration Confirmation - AMJ Academy",
          html: `
            <h2>Registration Confirmed</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your registration is confirmed at AMJ Academy.</p>
            <ul>
              <li><strong>Date:</strong> ${selectedDate}</li>
              <li><strong>Time:</strong> ${selectedTime}</li>
              <li><strong>Location:</strong> ${location || "AMJ Academy Main Center"}</li>
            </ul>
            <p>Thank you for choosing AMJ Academy 🎶</p>
          `,
        });
        console.log("✅ User email sent");
      } catch (e) {
        console.error("❌ Error sending user email:", e);
      }
    }

    // 4️⃣ Send admin notification email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "📩 New Registration - AMJ Academy",
        html: `
          <h2>New Registration Received</h2>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Contact:</strong> ${contact}</li>
            <li><strong>Date:</strong> ${selectedDate}</li>
            <li><strong>Time:</strong> ${selectedTime}</li>
            <li><strong>Location:</strong> ${location || "AMJ Academy Main Center"}</li>
          </ul>
          <h3>Personal Details</h3>
          <pre>${JSON.stringify(personalDetails, null, 2)}</pre>
        `,
      });
      console.log("✅ Admin email sent");
    } catch (e) {
      console.error("❌ Error sending admin email:", e);
    }

    res.json({ success: true, message: "Registration completed, stored, and emails sent" });
  } catch (err) {
    console.error("❌ finalizeSlot error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


