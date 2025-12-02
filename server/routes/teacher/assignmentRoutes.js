const express = require("express");
const router = express.Router();
const { supabase } = require("../../config/supabaseClient");



router.get("/user/:teacher_id", async (req, res) => {
  try {
    const teacherId = req.params.teacher_id;

    // 1️⃣ Fetch assessment targets where TEACHER is the filler
    const { data: targets, error: targetsErr } = await supabase
      .from("assessment_targets")
      .select("assessment_id, receiver_id, is_completed")
      .eq("user_id", teacherId);

    if (targetsErr) throw targetsErr;
    if (!targets.length) {
      return res.json({ success: true, data: [] });
    }

    const assessmentIds = [...new Set(targets.map(t => t.assessment_id))];

    // 2️⃣ Get all OPEN teacher_to_student assessments
    const { data: assessments, error: assessErr } = await supabase
      .from("assessments")
      .select("*")
      .in("id", assessmentIds)
      .eq("is_opened", true)
      .eq("type", "teacher_to_student");

    if (assessErr) throw assessErr;
    if (!assessments.length) {
      return res.json({ success: true, data: [] });
    }

    const arrangementIds = assessments.map(a => a.arrangement_id);

    // 3️⃣ Fetch arrangements → get subjects
    const { data: arrs } = await supabase
      .from("arrangements")
      .select("arrangement_id, subject")
      .in("arrangement_id", arrangementIds);

    const arrangementLookup = {};
    arrs.forEach(a => (arrangementLookup[a.arrangement_id] = a));

    // 4️⃣ Fetch all students involved
    const studentIds = [...new Set(targets.map(t => t.receiver_id))];

    const { data: students } = await supabase
      .from("students")
      .select("id, name, profession, level, no_of_classes, total_attended_classes")
      .in("id", studentIds);

    const studentLookup = {};
    students.forEach(s => (studentLookup[s.id] = s));

    // 5️⃣ Build response (IMPORTANT FIX: produce 1 row per target)
    const formatted = [];

    assessments.forEach(a => {
      targets
        .filter(t => t.assessment_id === a.id) // all targets for this assessment
        .forEach(targetRow => {
          const student = studentLookup[targetRow.receiver_id];

          formatted.push({
            id: a.id,
            type: a.type,
            student_name: student?.name,
            student_level: student?.level,
            student_id: student?.id,
            subject: student?.profession,
            no_of_classes: student?.no_of_classes,
            total_attended_classes: student?.total_attended_classes,
            progress: `${a.session_checkpoint}`,
            is_completed: targetRow.is_completed,
            due_date: a.due_time
          });
        });
    });

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("❌ Fetch teacher assessments error:", err);
    return res.status(400).json({ success: false, error: err.message });
  }
});




router.post("/submit", async (req, res) => {
  try {
    const { assessment_id, user_id, answers, student_id } = req.body;

    if (!assessment_id || !user_id || !answers || !student_id) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // 1️⃣ Prevent duplicate submission
    const { data: existing } = await supabase
      .from("assessment_targets")
      .select("id")
      .eq("assessment_id", assessment_id)
      .eq("user_id", user_id)
      .eq("receiver_id", student_id)
      .eq("is_completed", true);

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You have already submitted this assessment",
      });
    }

    // 2️⃣ Count YES answers
    const user_count = Object.values(answers).filter(val =>
      val?.trim().toLowerCase().startsWith("yes")
    ).length;

    // 3️⃣ Find the correct assessment_target row
    const { data: target, error: targetErr } = await supabase
      .from("assessment_targets")
      .select("id")
      .eq("assessment_id", assessment_id)
      .eq("user_id", user_id)
      .eq("receiver_id", student_id)
      .eq("is_completed", false)
      .single();

    if (targetErr || !target) throw new Error("Assessment target not found");

    // 4️⃣ Insert response
    const { error: respErr } = await supabase
      .from("assessment_responses")
      .insert([
        {
          user_id,
          answers,
          user_count,
          submitted_at: new Date(),
          assessment_target_id: target.id,
        },
      ]);

    if (respErr) throw respErr;

    // 5️⃣ Mark completed
    await supabase
      .from("assessment_targets")
      .update({ is_completed: true })
      .eq("assessment_id", assessment_id)
      .eq("user_id", user_id)
      .eq("receiver_id", student_id);

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