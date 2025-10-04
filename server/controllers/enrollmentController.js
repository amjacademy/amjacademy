const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const {
  getEnrollments,
  createEnrollment,
  deleteEnrollment,
  updateEnrollment,
} = require("../models/enrollmentModel");

exports.getAll = async (req, res) => {
  const { data, error } = await getEnrollments();
  if (error){ 
    console.error("Error in getAll:", error);
    return res.status(500).json({ error });
  }
  res.json(data);
};

exports.create = async (req, res) => {
  const { body } = req;

  try {
    const { data, error } = await createEnrollment(body);
    if (error) {
      console.error("Error in create:", error);
      return res.status(500).json({ error });
    }

    // Prepare emails
    const { email, username, password,name,role, phone, profession } = body;

    
    // Send both emails (can be in parallel)
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
        <p>Login to the portal and start using your account.</p>
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
       
  })
]);
    // Respond
    res.status(201).json(data);

  } catch (err) {
    console.error("Error creating enrollment or sending emails:", err);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
};


exports.remove = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await deleteEnrollment(id);
  if (error) return res.status(500).json({ error });
  res.json(data);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await updateEnrollment(id, updates);
  if (error) return res.status(500).json({ error });
  res.json(data);
};
