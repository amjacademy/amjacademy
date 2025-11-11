const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const {
  getEnrollments,
  createUser,
  deleteEnrollment,
  updateEnrollment,
  getEnrollmentById,
} = require("../models/enrollmentModel");


// ✅ GET ALL ENROLLMENTS (students + teachers merged)
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await getEnrollments();
    if (error) {
      console.error("❌ Error fetching enrollments:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    // Always return a plain array to frontend
    return res.status(200).json(data || []);
  } catch (err) {
    console.error("❌ Server error in getAll:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch enrollments" });
  }
};


// ✅ CREATE NEW ENROLLMENT (User + Student/Teacher record + Emails)
exports.create = async (req, res) => {
  const { body } = req;

  try {
    // Create new user in Supabase
    const result = await createUser(body);
    if (!result.success) {
      console.error("❌ Error creating user:", result.message);
      return res.status(400).json({ success: false, message: result.message });
    }

    const { email, username, password, name, role, phone, profession } = body;

    // Send confirmation + admin email
    await Promise.all([
      resend.emails.send({
        from: "AMJacademy@amjacademy.in",
        to: email,
        subject: "AMJ Academy Account Created Successfully",
        html: `
          <p>Hi ${name},</p>
          <p>Your account has been successfully created!</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Role: ${role}</p>
          <br/>
          <p>Regards,<br/>AMJ Academy Team</p>
        `,
      }),
      resend.emails.send({
        from: "AMJacademy@amjacademy.in",
        to: process.env.ADMIN_EMAIL,
        subject: `New ${role} Account Created`,
        html: `
          <p>A new ${role} account has been created.</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Profession:</strong> ${profession}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `,
      }),
    ]);

    // ✅ Return the created record
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.user || null,
    });

  } catch (err) {
    console.error("❌ Error creating enrollment or sending emails:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
      error: err.message,
    });
  }
};


// ✅ DELETE ENROLLMENT (removes from all 3 tables)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await deleteEnrollment(id);
    if (error) {
      console.error("❌ Error deleting enrollment:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete enrollment",
      });
    }

    // ✅ Return consistent success response
    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
      deletedId: id,
      data,
    });
  } catch (err) {
    console.error("❌ Server error during delete:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting enrollment",
      error: err.message,
    });
  }
};


// ✅ UPDATE ENROLLMENT (updates all 3 tables)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await updateEnrollment(id, updates);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to update user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      updatedUser: result.data,
    });
  } catch (err) {
    console.error("❌ Server error in update:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating enrollment",
      error: err.message,
    });
  }
};


// ✅ Fetch Single Enrollment by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await getEnrollmentById(id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error in getById:", err);
    res.status(500).json({ success: false, message: "Failed to fetch enrollment" });
  }
};