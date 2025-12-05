// classreportRoutes.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../../config/supabaseClient");
const { userAuth} = require("../../utils/authController");

// GET all students assigned to a teacher
router.get("/getstudents", userAuth("teacher"), async (req, res) => {
  try {
    const user_id = req.userId;

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
        arrangements
          .flatMap((r) => [r.student1_id, r.student2_id])
          .filter(Boolean)
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
        arr
          .reduce((m, s) => {
            if (!m.has(s.id)) m.set(s.id, s);
            return m;
          }, new Map())
          .values()
      ).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return res.json(uniq(students || []));
  } catch (err) {
    console.error("Error fetching students:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET classes for Teacher (supports student filter + normalized statuses + student names + GROUP CLASSES)
router.get("/fetchclasses",userAuth("teacher"), async (req, res) => {
  try {
    const { status, student_id, date_from, date_to } = req.query;
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    // ==========================================
    // PART 1: Fetch NORMAL classes from class_statuses
    // ==========================================
    let query = supabase
      .from("class_statuses")
      .select(
        `
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
      `
      )
      .eq("user_id", user_id);

    // status filter
    if (status && status !== "all" && status !== "") {
      const st = status.toString().toLowerCase();
      if (st === "missing") {
        query = query.in("status", ["leave", "cancel", "not shown"]);
      } else {
        query = query.eq("status", st);
      }
    }

    // student filter
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

    const { data: normalClasses, error: normalError } = await query;
    if (normalError) {
      console.error("Supabase error (normal classes):", normalError);
    }

    // ==========================================
    // PART 2: Fetch GROUP classes from group_class_statuses
    // ==========================================
    let groupQuery = supabase
      .from("group_class_statuses")
      .select("*")
      .eq("user_id", user_id);

    // status filter for group classes
    if (status && status !== "all" && status !== "") {
      const st = status.toString().toLowerCase();
      if (st === "missing") {
        groupQuery = groupQuery.in("status", [
          "leave",
          "cancel",
          "cancelled",
          "not shown",
        ]);
      } else {
        groupQuery = groupQuery.eq("status", st);
      }
    }

    const { data: groupClasses, error: groupError } = await groupQuery;

    console.log("📋 Teacher Group Classes Query:", {
      user_id,
      status,
      groupClassesCount: groupClasses?.length || 0,
      groupError,
    });

    if (groupError) {
      console.error("Supabase error (group classes):", groupError);
    }

    // ==========================================
    // PART 3: Fetch group_arrangements for group classes
    // ==========================================
    const groupArrangementIds = [
      ...new Set(
        (groupClasses || []).map((c) => c.group_arrangement_id).filter(Boolean)
      ),
    ];

    let groupArrangementsMap = {};
    if (groupArrangementIds.length > 0) {
      let gaQuery = supabase
        .from("group_arrangements")
        .select("*")
        .in("id", groupArrangementIds);

      // date filters for group arrangements
      if (date_from && date_to) {
        gaQuery = gaQuery.gte("date", date_from).lte("date", date_to);
      } else if (date_from) {
        gaQuery = gaQuery.gte("date", date_from);
      } else if (date_to) {
        gaQuery = gaQuery.lte("date", date_to);
      }

      const { data: groupArrangements } = await gaQuery;
      (groupArrangements || []).forEach((ga) => {
        groupArrangementsMap[ga.id] = ga;
      });
    }

    // ==========================================
    // PART 4: Fetch student names for normal classes
    // ==========================================
    const studentIds = [
      ...new Set(
        (normalClasses || [])
          .flatMap((c) => [
            c.arrangements?.student1_id,
            c.arrangements?.student2_id,
          ])
          .filter(Boolean)
      ),
    ];

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

    // ==========================================
    // PART 5: Fetch notifications for missing NORMAL classes
    // ==========================================
    const missingClassIds = (normalClasses || [])
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

    // ==========================================
    // PART 6: Fetch notifications for missing GROUP classes
    // ==========================================
    const missingGroupClassIds = (groupClasses || [])
      .filter((c) =>
        ["leave", "cancel", "not shown"].includes(
          (c.status || "").toLowerCase()
        )
      )
      .map((c) => c.class_id);

    const groupNotificationMap = {};
    if (missingGroupClassIds.length > 0) {
      const { data: groupNotiData } = await supabase
        .from("notifications")
        .select("class_id, reason, issuer_id, role")
        .in("class_id", missingGroupClassIds);

      const groupedNoti = {};
      groupNotiData?.forEach((n) => {
        if (!groupedNoti[n.class_id]) groupedNoti[n.class_id] = [];
        groupedNoti[n.class_id].push(n);
      });

      missingGroupClassIds.forEach((classId) => {
        const rows = groupedNoti[classId] || [];
        if (rows.length === 0) return;
        if (rows.length === 1) {
          groupNotificationMap[classId] = rows[0];
          return;
        }
        const teacherRow = rows.find((r) => r.role === "teacher");
        groupNotificationMap[classId] = teacherRow || rows[0];
      });
    }

    // ==========================================
    // PART 7: Fetch issuer names
    // ==========================================
    const allIssuerIds = [
      ...Object.values(notificationMap).map((n) => n.issuer_id),
      ...Object.values(groupNotificationMap).map((n) => n.issuer_id),
    ].filter(Boolean);

    const issuerMap = {};
    if (allIssuerIds.length > 0) {
      const { data: issuerData } = await supabase
        .from("users")
        .select("id, name, role")
        .in("id", [...new Set(allIssuerIds)]);

      issuerData?.forEach((u) => {
        issuerMap[u.id] = { name: u.name, role: u.role };
      });
    }

    // ==========================================
    // PART 8: Format NORMAL classes
    // ==========================================
    const formattedNormalClasses = (normalClasses || []).map((c) => {
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
        student1_name = arr.student1_id
          ? studentMap[arr.student1_id] || null
          : null;
        student2_name = arr.student2_id
          ? studentMap[arr.student2_id] || null
          : null;
      } else {
        const singleId = arr.student1_id || arr.student2_id;
        student_name = singleId ? studentMap[singleId] || null : null;
      }

      return {
        ...c,
        type: "normal",
        batch_type: arr.batch_type || null,
        arrangements: {
          subject: arr.subject,
          date: arr.date,
          day: arr.day,
          time: arr.time,
        },
        status: rawStatus,
        student_name,
        student1_name,
        student2_name,
        reason: notif.reason || null,
        issuer_name: issuer.name || null,
        issuer_role: issuer.role || null,
      };
    });

    // ==========================================
    // PART 9: Format GROUP classes
    // ==========================================
    const formattedGroupClasses = (groupClasses || [])
      .filter((gc) => groupArrangementsMap[gc.group_arrangement_id]) // Only include if arrangement exists (passes date filter)
      .map((gc) => {
        const ga = groupArrangementsMap[gc.group_arrangement_id] || {};

        let rawStatus = (gc.status || "").toLowerCase();
        if (rawStatus === "not shown") rawStatus = "notshown";

        const notif = groupNotificationMap[gc.class_id] || {};
        const issuer = issuerMap[notif.issuer_id] || {};

        return {
          id: gc.id,
          class_id: gc.class_id,
          user_id: gc.user_id,
          type: "group",
          batch_type: "Group",
          group_name: ga.group_name || null,
          arrangements: {
            subject: ga.subject,
            date: ga.date,
            day: ga.day,
            time: ga.time,
          },
          status: rawStatus,
          student_name: null,
          student1_name: null,
          student2_name: null,
          reason: notif.reason || null,
          issuer_name: issuer.name || null,
          issuer_role: issuer.role || null,
        };
      });

    // ==========================================
    // PART 10: Handle orphan notifications (teacher's own cancellations)
    // ==========================================
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
        const batchType = (extra.batch_type || "").toLowerCase();

        let student_name = null;
        let student1_name = null;
        let student2_name = null;

        if (batchType === "dual") {
          student1_name = extra.student1_id
            ? studentMap[extra.student1_id] || null
            : null;
          student2_name = extra.student2_id
            ? studentMap[extra.student2_id] || null
            : null;
        } else {
          const singleId = extra.student1_id || extra.student2_id;
          student_name = singleId ? studentMap[singleId] || null : null;
        }

        return {
          id: notif.id,
          class_id: notif.class_id,
          type: "normal",
          status: notif.action_type?.toLowerCase() || "leave",
          arrangements: {
            date: extra.date || null,
            time: extra.time || null,
            day: extra.day || null,
            subject: extra.subject || null,
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

    // ==========================================
    // PART 11: Combine all classes and sort by date
    // ==========================================
    const allClasses = [
      ...formattedNormalClasses,
      ...formattedGroupClasses,
      ...orphanItems,
    ];

    allClasses.sort((a, b) => {
      const da = a.arrangements?.date ? new Date(a.arrangements.date) : 0;
      const db = b.arrangements?.date ? new Date(b.arrangements.date) : 0;
      return da - db;
    });

    return res.json(allClasses);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
