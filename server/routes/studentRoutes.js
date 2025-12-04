const express = require("express");
const { fetch } = require("../controllers/studentannouncementControllers");
const { fetchUpcomingClasses } = require("../controllers/upcomingclassController");
const router = express.Router();
const { supabase } = require("../config/supabaseClient");

const {userAuth} = require("../utils/authController");

router.get("/fetchannouncements",userAuth("student"),  fetch);
router.get("/upcoming-classes",userAuth("student"),fetchUpcomingClasses);

// POST /api/actions/submit
router.post("/actions/submit",userAuth(), async (req, res) => {
  try {
    const { user_id, class_id, action_type, reason, role } = req.body;

    if (!user_id || !class_id || !action_type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Validate class exists
    const { data: classData, error: classError } = await supabase
      .from("arrangements")
      .select("*")
      .eq("class_id", class_id)
      .single();

    if (classError || !classData) {
      return res.status(403).json({
        success: false,
        message: "User is not part of this class",
      });
    }

    // ⭐ Prepare extra_details (REMOVE status from arrangements)
    const { status, ...extraDetails } = classData;

    // ⭐ Insert notification WITH extra_details
    const { data: inserted, error: insertError } = await supabase
      .from("notifications")
      .insert([
        {
          class_id,
          issuer_id: user_id,
          role: role,
          action_type,
          reason: reason || null,
          action_time: new Date().toISOString(),
          is_read: false,

          // ⭐ store full class snapshot HERE
          extra_details: extraDetails,
        },
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to submit action",
      });
    }

    // ✅ Update class_statuses
    const { error: statusError } = await supabase
      .from("class_statuses")
      .update({
        status: action_type,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("class_id", class_id);

    if (statusError) {
      console.error("Status update error:", statusError);
      return res.status(500).json({
        success: false,
        message: "Action saved BUT failed to update class status",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Action submitted successfully",
      data: inserted,
    });

  } catch (err) {
    console.error("Error in /actions/submit:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



router.put("/class-status",userAuth(),  async (req, res) => {
  try {
    const { class_id, status, user_id } = req.body;

    if (!class_id || !status || !user_id) {
      return res.status(400).json({ success: false, message: "Missing class_id, status, or user_id" });
    }

    // Update only this user's status
    const { data, error: updateError } = await supabase
      .from("class_statuses")
      .update({ status })       // use status from request
      .eq("class_id", class_id)
      .eq("user_id", user_id)
      .select();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res.status(500).json({ success: false, message: "Failed to update status" });
    }

    return res.json({ success: true, message: `Class status updated to ${status}`, data });

  } catch (err) {
    console.error("Error updating class status:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/ongoing-class",userAuth("student"), async (req, res) => {
  try {
    const user_id = req.headers["user_id"];

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id required"
      });
    }

    // 1️⃣ fetch ongoing class status for this user
    const { data: statusRows, error: statusError } = await supabase
      .from("class_statuses")
      .select("class_id")
      .eq("user_id", user_id)
      .eq("status", "ongoing")
      .limit(1);

    if (statusError) {
      console.error("Error fetching ongoing class:", statusError);
      return res.status(500).json({ success: false, message: "Failed to fetch ongoing class" });
    }

    if (!statusRows || statusRows.length === 0) {
      return res.json({ success: true, ongoingClass: null });
    }

    const classId = statusRows[0].class_id;

    // 2️⃣ fetch full class details
    const { data: cls, error: classError } = await supabase
      .from("arrangements")
      .select("*")
      .eq("class_id", classId)
      .single();

    if (classError) {
      console.error("Error fetching class:", classError);
      return res.status(500).json({ success: false, message: "Failed to fetch class details" });
    }

    // 3️⃣ fetch teacher name
    const { data: teacher, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("id", cls.teacher_id)
      .single();

    return res.json({
      success: true,
      ongoingClass: {
        ...cls,
        teacher_name: teacher?.name || "N/A"
      }
    });
  } catch (err) {
    console.error("ongoing-class error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




module.exports = router;