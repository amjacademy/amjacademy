const express = require("express");
const { supabase } = require("../config/supabaseClient");
const {userAuth, roleAuth } = require("../utils/authController");
const router = express.Router();

// ✅ Fetch classes for a specific user (student1_id or student2_id)
router.get("/fetchclasses", async (req, res) => {
  try {
    const { user_id, status, subject, date_from, date_to } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // 1️⃣ Base Query
    let query = supabase
      .from("class_statuses")
      .select(
        `
        *,
        arrangements:arrangements!inner(*)
      `
      )
      .eq("user_id", user_id);

    // 2️⃣ STATUS FILTER
    if (status && status !== "all") {
      if (status.toLowerCase() === "missing") {
        query = query.in("status", ["leave", "cancel", "not shown"]);
      } else {
        query = query.eq("status", status.toLowerCase());
      }
    }

    // 3️⃣ SUBJECT FILTER
    if (subject && subject !== "all" && subject !== "All Subjects") {
      query = query.eq("arrangements.subject", subject);
    }

    // 4️⃣ DATE RANGE FILTER
    if (date_from && date_to) {
      query = query
        .gte("arrangements.date", date_from)
        .lte("arrangements.date", date_to);
    }

    // 5️⃣ Execute Initial Query
    const { data: classes, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    // If no classes return empty
    if (!classes || classes.length === 0) {
      return res.json([]);
    }

    // 6️⃣ FETCH TEACHER NAMES
    const teacherIds = [...new Set(classes.map((c) => c.arrangements.teacher_id))];

    const { data: teacherData } = await supabase
      .from("teachers")
      .select("id, name")
      .in("id", teacherIds);

    const teacherMap = {};
    teacherData?.forEach((t) => {
      teacherMap[t.id] = t.name;
    });

   // 7️⃣ FETCH REASONS FOR MISSING CLASSES
const missingClassIds = classes
  .filter((c) => ["leave", "cancel", "not shown"].includes(c.status))
  .map((c) => c.class_id);

let notificationMap = {};

if (missingClassIds.length > 0) {
  const { data: notiData } = await supabase
    .from("notifications")
    .select("class_id, reason, issuer_id, role")
    .in("class_id", missingClassIds);

  // Group rows by class_id first
  const grouped = {};
  notiData?.forEach((n) => {
    if (!grouped[n.class_id]) grouped[n.class_id] = [];
    grouped[n.class_id].push(n);
  });

  // For each class_id → pick according to priority
  missingClassIds.forEach((classId) => {
    const rows = grouped[classId];
    if (!rows || rows.length === 0) return;

    if (rows.length === 1) {
      // Only one entry → simply use it
      notificationMap[classId] = rows[0];
      return;
    }

    // MULTIPLE ENTRIES → APPLY PRIORITY
    const userRow = rows.find((r) => r.role === "user");
    const teacherRow = rows.find((r) => r.role === "teacher");

    if (userRow) {
      notificationMap[classId] = userRow;
    } else if (teacherRow) {
      notificationMap[classId] = teacherRow;
    } else {
      // If neither exists, fallback to first row
      notificationMap[classId] = rows[0];
    }
  });
}



// 🔍 8️⃣ FETCH ISSUER NAMES (from users table)
const issuerIds = Object.values(notificationMap)
  .map((n) => n.issuer_id)
  .filter((id) => !!id); // remove null/undefined

let issuerMap = {};

if (issuerIds.length > 0) {
  const { data: issuerData } = await supabase
    .from("users")
    .select("id, name, role")
    .in("id", issuerIds);

  issuerData?.forEach((u) => {
    issuerMap[u.id] = {
      name: u.name,
      role: u.role,
    };
  });
}

// 9️⃣ MERGE ALL EXTRA DATA
const finalResult = classes.map((c) => {
  const notif = notificationMap[c.class_id] || {};
  const issuer = issuerMap[notif.issuer_id] || {};

  return {
    ...c,
    instructor_name: teacherMap[c.arrangements.teacher_id] || null,
    reason: notif.reason || null,
    issuer_name: issuer.name || null,
    issuer_role: issuer.role || null,
  };
});

// 🔟 SORT BY DATE
finalResult.sort(
  (a, b) => new Date(a.arrangements.date) - new Date(b.arrangements.date)
);

return res.json(finalResult);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;