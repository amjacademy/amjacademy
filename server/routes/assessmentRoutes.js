const express = require("express");
const { supabase } = require("../config/supabaseClient");
const router = express.Router();


router.get("/user/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    // 1️⃣ Get assessment targets for this user
    const { data: targets, error: targetsErr } = await supabase
      .from("assessment_targets")
      .select("assessment_id")
      .eq("user_id", userId);

    if (targetsErr) throw targetsErr;

    if (!targets.length) {
      return res.json({ success: true, data: [] });
    }

    const assessmentIds = targets.map(t => t.assessment_id);

    // 2️⃣ Get assessments (is_opened & incomplete only)
    const { data: assessments, error: assessErr } = await supabase
      .from("assessments")
      .select("*")
      .in("id", assessmentIds)
      .eq("is_opened", true);

    if (assessErr) throw assessErr;

    if (!assessments.length) {
      return res.json({ success: true, data: [] });
    }

    const arrangementIds = assessments.map(a => a.arrangement_id);

    // 3️⃣ Fetch arrangements to get teacher_id
    const { data: arrangements, error: arrErr } = await supabase
      .from("arrangements")
      .select("arrangement_id, teacher_id")
      .in("arrangement_id", arrangementIds);

    if (arrErr) throw arrErr;

    // Make lookup: arrangement_id → teacher_id
    const arrangementLookup = {};
    arrangements.forEach(a => {
      arrangementLookup[a.arrangement_id] = a.teacher_id;
    });

    const teacherIds = arrangements.map(a => a.teacher_id);

    // 4️⃣ Fetch teacher names
    const { data: teachers, error: teacherErr } = await supabase
      .from("teachers")
      .select("id, name")
      .in("id", teacherIds);

    if (teacherErr) throw teacherErr;

    const teacherLookup = {};
    teachers.forEach(t => {
      teacherLookup[t.id] = t.name;
    });

    // 5️⃣ Fetch student details
    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("profession, level, no_of_classes, total_attended_classes")
      .eq("id", userId)
      .single();

    if (studentErr) throw studentErr;

    // 6️⃣ Build final response
    const formatted = assessments.map(a => {
      const teacherId = arrangementLookup[a.arrangement_id];
      return {
        id: a.id,
        type: a.type,
        subject: student.profession,
        level: student.level,
        due_date: a.due_time,
        teacher_name: teacherLookup[teacherId],
        progress: `Checkpoint ${a.session_checkpoint}`,
        is_completed: a.is_completed,
        no_of_classes: student.no_of_classes,

        // ✅ ONLY THIS LINE CHANGED
        total_attended_classes: a.session_checkpoint
      };
    });

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("❌ Fetch error:", err);
    return res.status(400).json({ success: false, error: err.message });
  }
});


router.post("/submit", async (req, res) => {
  try {
    const { assessment_id, user_id, answers } = req.body;

    if (!assessment_id || !user_id || !answers) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // 1️⃣ Prevent duplicate submissions
    const { data: existing } = await supabase
      .from("assessment_responses")
      .select("id")
      .eq("assessment_id", assessment_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "You have already submitted this assessment",
      });
    }

   // Count YES values from object keys
const user_count = Object.values(answers).filter(val =>
  val?.trim().toLowerCase().startsWith("yes")
).length;

// 2️⃣ Save the JSON answers
const { error: respErr } = await supabase
  .from("assessment_responses")
  .insert([
    {
      assessment_id,
      user_id,
      answers,      // JSONB
      user_count,   // YES count
      submitted_at: new Date(),
    }
  ]);

if (respErr) throw respErr;


    // 3️⃣ Mark assessment completed
    await supabase
      .from("assessments")
      .update({ is_completed: true })
      .eq("id", assessment_id);

    res.json({
      success: true,
      message: "Assessment submitted successfully!",
    });

  } catch (err) {
    console.error("❌ Submit error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});


module.exports = router;