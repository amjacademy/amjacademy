
const express = require("express");
const { supabase } = require("../config/supabaseClient");
const { adminAuth } = require("../utils/authController");
const router = express.Router();

// CREATE arrangement
router.post("/create", adminAuth, async (req, res) => {
  try {
    const {
      batch_type,
      student1_id,
      student2_id,
      teacher_id,
      day,
      date,
      time,
      link,
      rescheduled,
      no_of_sessions_week,
      no_of_sessions,
      first_day,
      second_day,
      end_date,
      subject,
    } = req.body;



    // Insert into arrangements table
    const { data, error } = await supabase
      .from("arrangements")
      .insert([
        {
          batch_type,
          student1_id,
          student2_id: batch_type === "dual" ? student2_id : null,
          teacher_id,
          day,
          date,
          time,
          link,
          subject,
          rescheduled: rescheduled || false,
          no_of_sessions_week,
          no_of_sessions,
          first_day,
          second_day,
          end_date,
        },
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error("❌ Error creating arrangement:", err);
    res.status(400).json({ error: err.message });
  }
});

// GET all arrangements
router.get("/getdetails", adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("arrangements")
      .select("*");

    if (error) throw error;

    // ✅ Send plain array (frontend expects this)
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error fetching all arrangements:", err);
    res.status(500).json({ error: err.message });
  }
});


// UPDATE arrangement
router.put("/update/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      batch_type,
      student1_id,
      student2_id,
      teacher_id,
      day,
      date,
      time,
      link,
      rescheduled,
      no_of_sessions_week,
      no_of_sessions,
      first_day,
      second_day,
      end_date,
      subject,
    } = req.body;

    const { data, error } = await supabase
      .from("arrangements")
      .update({
        batch_type,
        student1_id,
        student2_id: batch_type === "dual" ? student2_id : null,
        teacher_id,
        day,
        date,
        time,
        link,
        rescheduled: rescheduled || false,
        no_of_sessions_week,
        no_of_sessions,
        first_day,
        second_day,
        end_date,
        subject,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error("❌ Error updating arrangement:", err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE arrangement
router.delete("/delete/:id",adminAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("arrangements").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ✅ Fetch Students & Teachers (for UI dropdowns)
router.get("/fetchusers",adminAuth,  async (req, res) => {
  try {
    console.log("🔍 Fetching students...");
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id, name, batch_type");

    if (studentError) {
      console.error("❌ Student fetch error:", studentError);
      return res.status(500).json({ error: studentError.message });
    }

    /* console.log("✅ Students fetched:", students?.length || 0); */

    /* console.log("🔍 Fetching teachers..."); */
    const { data: teachers, error: teacherError } = await supabase
      .from("teachers")
      .select("id, name, profession");

    if (teacherError) {
      console.error("❌ Teacher fetch error:", teacherError);
      return res.status(500).json({ error: teacherError.message });
    }

    /* console.log("✅ Teachers fetched:", teachers?.length || 0); */

    // ✅ Return data in UI-compatible format
    res.status(200).json({
      students: students || [],
      teachers: teachers || [],
    });
  } catch (err) {
    console.error("🔥 Server crash:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ GET single arrangement by ID (for Edit functionality)
router.get("/get/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the single record by ID
    const { data, error } = await supabase
      .from("arrangements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Respond with the original record
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error fetching arrangement by ID:", err);
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;