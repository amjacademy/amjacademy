// classreportRoutes.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../../config/supabaseClient");

// GET all students assigned to a teacher
router.get("/getstudents", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    // fetch arrangements for this teacher
    const { data: arrangements, error: arrError } = await supabase
      .from("arrangements")
      .select("student1_id, student2_id")
      .eq("teacher_id", user_id);

    if (arrError) throw arrError;
    if (!arrangements || arrangements.length === 0) return res.json([]);

    const studentIds = [
      ...new Set(
        arrangements.flatMap((r) => [r.student1_id, r.student2_id]).filter(Boolean)
      ),
    ];

    if (studentIds.length === 0) return res.json([]);

    // fetch student rows — use `name` (consistent)
    const { data: students, error: stuError } = await supabase
      .from("students")
      .select("id, name")
      .in("id", studentIds);

    if (stuError) throw stuError;

    // dedupe & sort by name
    const uniq = (arr) =>
      Array.from(
        arr.reduce((m, s) => {
          if (!m.has(s.id)) m.set(s.id, s);
          return m;
        }, new Map()).values()
      ).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return res.json(uniq(students || []));
  } catch (err) {
    console.error("Error fetching students:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET classes for Teacher (supports student filter + normalized statuses + student names)
router.get("/fetchclasses", async (req, res) => {
  try {
    const { user_id, status, student_id, date_from, date_to } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    // base query — explicitly select arrangements.* to ensure needed fields present
    let query = supabase
      .from("class_statuses")
      .select(`
        *,
        arrangements:arrangements!inner(
          id,
          class_id,
          teacher_id,
          subject,
          date,
          time,
          day,
          batch_type,
          student1_id,
          student2_id
        )
      `)
      .eq("user_id", user_id);

    // status filter — backend accepts 'Missing' (case-insensitive) as grouping
    if (status && status !== "all" && status !== "") {
      const st = status.toString().toLowerCase();
      if (st === "missing") {
        query = query.in("status", ["leave", "cancel", "not shown"]);
      } else {
        query = query.eq("status", st);
      }
    }

    // ⭐ WORKING STUDENT FILTER
    if (student_id && student_id !== "all" && student_id !== "") {
      query = query.or(
        `student1_id.eq.${student_id},student2_id.eq.${student_id}`,
        { foreignTable: "arrangements" }
      );
    }

    // date filters
    if (date_from && date_to) {
      query = query
        .gte("arrangements.date", date_from)
        .lte("arrangements.date", date_to);
    } else if (date_from) {
      query = query.gte("arrangements.date", date_from);
    } else if (date_to) {
      query = query.lte("arrangements.date", date_to);
    }

    const { data: classes, error } = await query;
    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }
    if (!classes || classes.length === 0) {
      // ❗ Even if no classes, teacher may have orphan notifications → handle that below
      // DO NOT return here
    }

    // collect unique student ids
    const studentIds = [
      ...new Set(
        (classes || [])
          .flatMap((c) => [c.arrangements?.student1_id, c.arrangements?.student2_id])
          .filter(Boolean)
      ),
    ];

    // fetch student rows
    const studentMap = {};
    if (studentIds.length > 0) {
      const { data: studentData } = await supabase
        .from("students")
        .select("id, name")
        .in("id", studentIds);

      studentData?.forEach((s) => {
        studentMap[s.id] = s.name;
      });
    }

    // fetch notifications for missing classes
    const missingClassIds = (classes || [])
      .filter((c) =>
        ["leave", "cancel", "not shown"].includes(
          (c.status || "").toLowerCase()
        )
      )
      .map((c) => c.class_id);

    const notificationMap = {};
    if (missingClassIds.length > 0) {
      const { data: notiData } = await supabase
        .from("notifications")
        .select("class_id, reason, issuer_id, role")
        .in("class_id", missingClassIds);

      const grouped = {};
      notiData?.forEach((n) => {
        if (!grouped[n.class_id]) grouped[n.class_id] = [];
        grouped[n.class_id].push(n);
      });

      missingClassIds.forEach((classId) => {
        const rows = grouped[classId] || [];
        if (rows.length === 0) return;
        if (rows.length === 1) {
          notificationMap[classId] = rows[0];
          return;
        }
        const userRow = rows.find((r) => r.role === "user");
        const teacherRow = rows.find((r) => r.role === "teacher");
        notificationMap[classId] = userRow || teacherRow || rows[0];
      });
    }

    // fetch issuer names
    const issuerIds = Object.values(notificationMap)
      .map((n) => n.issuer_id)
      .filter(Boolean);

    const issuerMap = {};
    if (issuerIds.length > 0) {
      const { data: issuerData } = await supabase
        .from("users")
        .select("id, name, role")
        .in("id", issuerIds);

      issuerData?.forEach((u) => {
        issuerMap[u.id] = { name: u.name, role: u.role };
      });
    }

    // Build final results
    const finalResult = (classes || []).map((c) => {
      const arr = c.arrangements || {};

      let rawStatus = (c.status || "").toLowerCase();
      if (rawStatus === "not shown") rawStatus = "notshown";

      const notif = notificationMap[c.class_id] || {};
      const issuer = issuerMap[notif.issuer_id] || {};

      const batchType = (arr.batch_type || "").toLowerCase();

      let student_name = null;
      let student1_name = null;
      let student2_name = null;

      if (batchType === "dual") {
        student1_name = arr.student1_id ? studentMap[arr.student1_id] || null : null;
        student2_name = arr.student2_id ? studentMap[arr.student2_id] || null : null;
      } else {
        const singleId = arr.student1_id || arr.student2_id;
        student_name = singleId ? studentMap[singleId] || null : null;
      }

      return {
        ...c,
        batch_type: arr.batch_type || null,
        arrangements: arr,
        status: rawStatus,
        student_name,
        student1_name,
        student2_name,
        reason: notif.reason || null,
        issuer_name: issuer.name || null,
        issuer_role: issuer.role || null,
      };
    });

    // ⭐ ADD ORPHAN-NOTIFICATION LOGIC HERE
   const { data: orphanNotifications } = await supabase
  .from("notifications")
  .select("*")
  .eq("issuer_id", user_id)
  .eq("role", "teacher")
  .or(
    missingClassIds.length > 0
      ? `class_id.is.null,class_id.not.in.(${missingClassIds.join(",")})`
      : `class_id.is.null`
  );

const orphanItems =
  orphanNotifications?.map((notif) => {

    const extra = notif.extra_details || {};

    // Extract fields safely
    const batchType = (extra.batch_type || "").toLowerCase();

    let student_name = null;
    let student1_name = null;
    let student2_name = null;

    if (batchType === "dual") {
      student1_name = extra.student1_id ? studentMap[extra.student1_id] || null : null;
      student2_name = extra.student2_id ? studentMap[extra.student2_id] || null : null;
    } else {
      const singleId = extra.student1_id || extra.student2_id;
      student_name = singleId ? studentMap[singleId] || null : null;
    }

    return {
      id: notif.id,
      class_id: notif.class_id,
      status: notif.action_type?.toLowerCase() || "leave",

      // ⭐ arrangements reconstructed from extra_details
      arrangements: {
        date: extra.date || null,
        time: extra.time || null,
        day: extra.day || null,
        subject: extra.subject || null,
        batch_type: extra.batch_type || null,
        student1_id: extra.student1_id || null,
        student2_id: extra.student2_id || null,
      },

      batch_type: extra.batch_type || null,

      student_name,
      student1_name,
      student2_name,

      reason: notif.reason,
      issuer_name: "You",
      issuer_role: "teacher",
    };

  }) || [];


    // merge real + orphan
    const finalMerged = [...finalResult, ...orphanItems];

    // sort by date (orphans stay at end because date=null → 0)
    finalMerged.sort((a, b) => {
      const da = a.arrangements?.date ? new Date(a.arrangements.date) : 0;
      const db = b.arrangements?.date ? new Date(b.arrangements.date) : 0;
      return da - db;
    });

    return res.json(finalMerged);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
