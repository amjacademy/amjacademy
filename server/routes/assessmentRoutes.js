const express = require("express");
const { supabase } = require("../config/supabaseClient");
const router = express.Router();

// Get incomplete assessment count for a user
router.get("/incomplete-count/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    // Get assessment targets for this user that are not completed
    const { data: targets, error: targetsErr } = await supabase
      .from("assessment_targets")
      .select("assessment_id, is_completed")
      .eq("user_id", userId)
      .eq("is_completed", false);

    if (targetsErr) throw targetsErr;

    if (!targets || targets.length === 0) {
      return res.json({ success: true, incompleteCount: 0 });
    }

    const assessmentIds = [...new Set(targets.map((t) => t.assessment_id))];

    // Get only opened assessments
    const { data: assessments, error: assessErr } = await supabase
      .from("assessments")
      .select("id")
      .in("id", assessmentIds)
      .eq("is_opened", true);

    if (assessErr) throw assessErr;

    const count = assessments ? assessments.length : 0;
    res.json({ success: true, incompleteCount: count });
  } catch (err) {
    console.error("Error fetching incomplete assessment count:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/user/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    // 1️⃣ Get assessment targets for this user
    const { data: targets, error: targetsErr } = await supabase
      .from("assessment_targets")
      .select("assessment_id, receiver_id, is_completed")
      .eq("user_id", userId);

    if (targetsErr) throw targetsErr;

    if (!targets.length) {
      return res.json({ success: true, data: [] });
    }
    const targetStatus = {};
    targets.forEach((t) => {
      targetStatus[t.assessment_id] = t.is_completed;
    });

    const assessmentIds = [...new Set(targets.map((t) => t.assessment_id))];

    // 2️⃣ Get assessments (is_opened & incomplete only)
    const { data: assessments, error: assessErr } = await supabase
      .from("assessments")
      .select("*")
      .in("id", assessmentIds)
      .eq("is_opened", true)
      .eq("type", "student_to_teacher");

    if (assessErr) throw assessErr;

    if (!assessments.length) {
      return res.json({ success: true, data: [] });
    }

    const arrangementIds = assessments.map((a) => a.arrangement_id);

    // 3️⃣ Fetch arrangements to get teacher_id
    const { data: arrangements, error: arrErr } = await supabase
      .from("arrangements")
      .select("arrangement_id, teacher_id")
      .in("arrangement_id", arrangementIds);

    if (arrErr) throw arrErr;

    // Make lookup: arrangement_id → teacher_id
    const arrangementLookup = {};
    arrangements.forEach((a) => {
      arrangementLookup[a.arrangement_id] = a.teacher_id;
    });

    const teacherIds = arrangements.map((a) => a.teacher_id);

    // 4️⃣ Fetch teacher names
    const { data: teachers, error: teacherErr } = await supabase
      .from("teachers")
      .select("id, name")
      .in("id", teacherIds);

    if (teacherErr) throw teacherErr;

    const teacherLookup = {};
    teachers.forEach((t) => {
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
    const formatted = assessments.map((a) => {
      const teacherId = arrangementLookup[a.arrangement_id];

      return {
        id: a.id,
        type: a.type,
        subject: student.profession,
        level: student.level,
        due_date: a.due_time,
        teacher_name: teacherLookup[teacherId],
        teacher_id: teacherId,
        progress: `${a.session_checkpoint}`,
        is_completed: targetStatus[a.id] === true, // ← FIXED
        no_of_classes: student.no_of_classes,
        total_attended_classes: a.session_checkpoint,
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
    const { assessment_id, user_id, answers, teacher_id } = req.body;

    if (!assessment_id || !user_id || !answers || !teacher_id) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // 1️⃣ Prevent duplicate submission
    const { data: existing } = await supabase
      .from("assessment_targets")
      .select("id")
      .eq("assessment_id", assessment_id)
      .eq("user_id", user_id)
      .eq("receiver_id", teacher_id)
      .eq("is_completed", true);

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You have already submitted this assessment",
      });
    }

    // Count YES values from object keys
    const user_count = Object.values(answers).filter((val) =>
      val?.trim().toLowerCase().startsWith("yes")
    ).length;

    // 3️⃣ Find the correct assessment_target row
    const { data: target, error: targetErr } = await supabase
      .from("assessment_targets")
      .select("id")
      .eq("assessment_id", assessment_id)
      .eq("user_id", user_id)
      .eq("receiver_id", teacher_id)
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
      .eq("receiver_id", teacher_id);

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
