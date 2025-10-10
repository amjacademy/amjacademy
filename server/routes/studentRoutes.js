const express = require("express");
const { fetch } = require("../controllers/studentannouncementControllers");
const { fetchUpcomingClasses } = require("../controllers/upcomingclassController");
const router = express.Router();
const { supabase } = require("../config/supabaseClient");


router.get("/fetchannouncements", fetch);
router.get("/upcoming-classes", fetchUpcomingClasses);

// POST /api/actions/submit
router.post("/actions/submit", async (req, res) => {
  try {
    const { user_id, class_id, action_type, reason } = req.body;

    if (!user_id || !class_id || !action_type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch class info
    const { data: classData, error: classError } = await supabase
      .from("arrangements")
      .select("*")
      .eq("class_id", class_id)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Determine student columns
    let student1_id = null;
    let student2_id = null;

    if (classData.student1_id === user_id) {
      student1_id = user_id;
      student2_id = classData.student2_id || null;
    } else if (classData.student2_id === user_id) {
      student1_id = user_id;
      student2_id = classData.student1_id || null;
    } else {
      return res.status(403).json({ success: false, message: "User not enrolled in this class" });
    }

    // Insert into class_actions
    const { data, error } = await supabase
      .from("class_actions")
      .insert([
        {
          class_id,
          student1_id,
          student2_id,
          action_type,
          reason: reason || null,
          status: "pending",
          action_time: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, message: "Failed to submit action" });
    }

    // ✅ Update status in arrangements table based on action_type
   // ✅ Update user-specific status in class_participant_status
const { data: updateData, error: updateError } = await supabase
  .from("class_participant_status")
  .update({ status: action_type })
  .eq("class_id", class_id)
  .eq("user_id", user_id)
  .select();


    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res.status(500).json({ success: false, message: "Action submitted but failed to update class status" });
    }

    return res.json({ 
      success: true, 
      message: "Action submitted successfully and class status updated", 
      data,
      updatedClass: updateData
    });

  } catch (err) {
    console.error("Error in leave/cancel route:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/class-status", async (req, res) => {
  try {
    const { class_id, status, user_id } = req.body;

    if (!class_id || !status || !user_id) {
      return res.status(400).json({ success: false, message: "Missing class_id, status, or user_id" });
    }

    // Update only this user's status
    const { data, error: updateError } = await supabase
      .from("class_participant_status")
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





module.exports = router;