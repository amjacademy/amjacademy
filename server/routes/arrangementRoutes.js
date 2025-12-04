
const express = require("express");
const { supabase } = require("../config/supabaseClient");
const { adminAuth } = require("../utils/authController");
const router = express.Router();


//GET LAST ARRANGEMENT ID (for frontend generator)
router.get("/last-arrangement-id", adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("arrangements")
      .select("arrangement_id")
      .not("arrangement_id", "is", null)
      .order("arrangement_id", { ascending: false })
      .limit(1);

    if (error) throw error;

    return res.status(200).json({
      lastArrangementId: data?.[0]?.arrangement_id || null,
    });
  } catch (err) {
    console.error("❌ Error fetching last arrangement ID:", err);
    return res.status(500).json({ error: err.message });
  }
});

// CREATE arrangement
router.post("/create",adminAuth, async (req, res) => {
  try {
    const {
      arrangement_id,
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

    
    if (!arrangement_id) {
      return res.status(400).json({ error: "arrangement_id is required" });
    }

    // 1️⃣ Insert into arrangements table
    const { data, error } = await supabase
      .from("arrangements")
      .insert([
        {
          arrangement_id,
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

    // 2️⃣ Increment student1 classes using RPC
    const { error: inc1Err } = await supabase.rpc(
      "increment_student_classes", 
      { student_id: student1_id }
    );
    if (inc1Err) throw inc1Err;

    // 3️⃣ If dual, also increment student2
    if (batch_type === "dual" && student2_id) {
      const { error: inc2Err } = await supabase.rpc(
        "increment_student_classes", 
        { student_id: student2_id }
      );
      if (inc2Err) throw inc2Err;
    }
// ============================================
// 4️⃣ CREATE ASSESSMENTS ONLY IF NOT EXIST
// ============================================

// Check if assessments already exist for this arrangement_id
const { data: existingAssessments, error: checkErr } = await supabase
  .from("assessments")
  .select("id")
  .eq("arrangement_id", arrangement_id);

if (checkErr) throw checkErr;

const shouldCreateAssessments = existingAssessments.length === 0;

if (shouldCreateAssessments) {
  console.log("🚀 Creating assessments for:", arrangement_id);

  // Generate checkpoints: STRICT multiples of 8 only (8,16,24,...)
  const checkpoints = [];
  for (let cp = 8; cp <= no_of_sessions; cp += 8) {
    checkpoints.push(cp);
  }

  // If no_of_sessions < 8, checkpoints will be empty → no assessments created.
  if (checkpoints.length === 0) {
    console.log("ℹ️ no_of_sessions < 8 — no assessment checkpoints created.");
  }

  // ===========================================================
  // CREATE ASSESSMENTS FOR EACH CHECKPOINT
  // ===========================================================
  for (const cp of checkpoints) {

    // ---------------------------------------------------
    // 1️⃣ student_to_teacher  (students evaluate teacher)
    // ---------------------------------------------------
    const { data: stuToTeach, error: s2tErr } = await supabase
      .from("assessments")
      .insert([
        {
          arrangement_id,
          session_checkpoint: cp,
          type: "student_to_teacher",
          due_time: null,
          is_opened: false,
        },
      ])
      .select()
      .single();

    if (s2tErr) throw s2tErr;

    // STUDENTS = user_id, teacher = receiver_id
    const stt_targets = [
      {
        assessment_id: stuToTeach.id,
        user_id: student1_id,
        receiver_id: teacher_id,
        role: "student",
      },
    ];

    if (batch_type === "dual" && student2_id) {
      stt_targets.push({
        assessment_id: stuToTeach.id,
        user_id: student2_id,
        receiver_id: teacher_id,
        role: "student",
      });
    }

    await supabase.from("assessment_targets").insert(stt_targets);

    // ---------------------------------------------------
    // 2️⃣ teacher_to_student (teacher evaluates student(s))
    // ---------------------------------------------------
    const { data: teachToStu, error: t2sErr } = await supabase
      .from("assessments")
      .insert([
        {
          arrangement_id,
          session_checkpoint: cp,
          type: "teacher_to_student",
          due_time: null,
          is_opened: false,
        },
      ])
      .select()
      .single();

    if (t2sErr) throw t2sErr;

    // TEACHER = user_id, STUDENTS = receiver_id (multiple rows)
    const tts_targets = [];

    if (student1_id) {
      tts_targets.push({
        assessment_id: teachToStu.id,
        user_id: teacher_id,
        receiver_id: student1_id,
        role: "teacher",
      });
    }

    if (batch_type === "dual" && student2_id) {
      tts_targets.push({
        assessment_id: teachToStu.id,
        user_id: teacher_id,
        receiver_id: student2_id,
        role: "teacher",
      });
    }

    await supabase.from("assessment_targets").insert(tts_targets);
  }

} else {
  console.log("⚠️ Assessments already exist for", arrangement_id);
}
// ============================================

    return res.status(200).json({
      success: true,
      message: "Class arrangement created & no_of_classes updated",
      data,
    });

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

// DELETE arrangement + reduce no_of_classes
router.delete("/delete/:id",adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch arrangement to know which students to update
    const { data: arr, error: fetchErr } = await supabase
      .from("arrangements")
      .select("student1_id, student2_id, batch_type")
      .eq("id", id)
      .single();

    if (fetchErr || !arr) {
      return res.status(404).json({ error: "Arrangement not found" });
    }

    const { student1_id, student2_id, batch_type } = arr;

    // 2️⃣ Decrement student1 by 1
    if (student1_id) {
      const { error: dec1Err } = await supabase.rpc(
        "decrement_student_classes",
        { student_id: student1_id }
      );
      if (dec1Err) throw dec1Err;
    }

    // 3️⃣ If dual, also decrement student2 by 1
    if (batch_type === "dual" && student2_id) {
      const { error: dec2Err } = await supabase.rpc(
        "decrement_student_classes",
        { student_id: student2_id }
      );
      if (dec2Err) throw dec2Err;
    }

    // 4️⃣ Delete arrangement
    const { error: deleteErr } = await supabase
      .from("arrangements")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      console.error("Delete error:", deleteErr);
      return res.status(500).json({ error: deleteErr.message });
    }

    return res.json({
      success: true,
      message: "Class deleted, students updated by -1 (min 0).",
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
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