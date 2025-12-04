const express = require("express");
const { supabase } = require("../config/supabaseClient");
const { userAuth} = require("../utils/authController");
const router = express.Router();

// ✅ Fetch classes for a specific user (normal + group classes)
router.get("/fetchclasses",userAuth("student"), async (req, res) => {
  try {
    const { user_id, status, subject, date_from, date_to } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // ============================================
    // PART 1: FETCH NORMAL (INDIVIDUAL) CLASSES
    // ============================================

    // 1️⃣ Base Query for normal classes
    let normalQuery = supabase
      .from("class_statuses")
      .select(
        `
        *,
        arrangements:arrangements!inner(*)
      `
      )
      .eq("user_id", user_id);

    // 2️⃣ STATUS FILTER for normal classes
    if (status && status !== "all") {
      if (status.toLowerCase() === "missing") {
        normalQuery = normalQuery.in("status", [
          "leave",
          "cancel",
          "not shown",
        ]);
      } else {
        normalQuery = normalQuery.eq("status", status.toLowerCase());
      }
    }

    // 3️⃣ SUBJECT FILTER for normal classes
    if (subject && subject !== "all" && subject !== "All Subjects") {
      normalQuery = normalQuery.eq("arrangements.subject", subject);
    }

    // 4️⃣ DATE RANGE FILTER for normal classes
    if (date_from && date_to) {
      normalQuery = normalQuery
        .gte("arrangements.date", date_from)
        .lte("arrangements.date", date_to);
    }

    // 5️⃣ Execute Normal Classes Query
    const { data: normalClasses, error: normalError } = await normalQuery;

    if (normalError) {
      console.error("Normal classes error:", normalError);
    }

    // ============================================
    // PART 2: FETCH GROUP CLASSES
    // ============================================

    // 1️⃣ Base Query for group classes - check both 'student' role and no role (for backwards compatibility)
    let groupQuery = supabase
      .from("group_class_statuses")
      .select("*")
      .eq("user_id", user_id);

    // 2️⃣ STATUS FILTER for group classes
    if (status && status !== "all") {
      if (status.toLowerCase() === "missing") {
        groupQuery = groupQuery.in("status", [
          "leave",
          "cancel",
          "cancelled",
          "not shown",
        ]);
      } else if (status.toLowerCase() === "upcoming") {
        groupQuery = groupQuery.eq("status", "upcoming");
      } else if (status.toLowerCase() === "completed") {
        groupQuery = groupQuery.eq("status", "completed");
      } else {
        groupQuery = groupQuery.eq("status", status.toLowerCase());
      }
    }

    // 3️⃣ DATE RANGE FILTER for group classes
    if (date_from && date_to) {
      groupQuery = groupQuery
        .gte("start_time", date_from)
        .lte("start_time", date_to + "T23:59:59");
    }

    // 4️⃣ Execute Group Classes Query
    const { data: groupStatuses, error: groupError } = await groupQuery;

    console.log("📋 Group Statuses Query Result:", {
      user_id,
      status,
      groupStatusesCount: groupStatuses?.length || 0,
      groupStatuses: groupStatuses,
      groupError: groupError,
    });

    if (groupError) {
      console.error("Group classes error:", groupError);
    }

    // 5️⃣ Fetch group arrangements for the group classes
    let groupClasses = [];
    if (groupStatuses && groupStatuses.length > 0) {
      const groupArrangementIds = [
        ...new Set(groupStatuses.map((g) => g.group_arrangement_id)),
      ];

      let groupArrangementsQuery = supabase
        .from("group_arrangements")
        .select("*")
        .in("id", groupArrangementIds);

      // Subject filter for group classes (using group_name which often contains subject info)
      // Group classes don't have a subject field, so we skip subject filtering for them
      // or you can add a subject column to group_arrangements if needed

      const { data: groupArrangements, error: groupArrError } =
        await groupArrangementsQuery;

      if (groupArrError) {
        console.error("Group arrangements error:", groupArrError);
      }

      // Create map for quick lookup
      const groupArrMap = Object.fromEntries(
        (groupArrangements || []).map((g) => [g.id, g])
      );

      // Merge group statuses with arrangements
      groupClasses = groupStatuses.map((gs) => {
        const arr = groupArrMap[gs.group_arrangement_id] || {};
        return {
          ...gs,
          group_arrangements: arr,
        };
      });

      // Filter by subject if provided (check group_name or add subject field)
      if (subject && subject !== "all" && subject !== "All Subjects") {
        // For now, we can check if group_name contains the subject
        groupClasses = groupClasses.filter((gc) => {
          const groupName = gc.group_arrangements.group_name || "";
          return groupName.toLowerCase().includes(subject.toLowerCase());
        });
      }
    }

    // ============================================
    // PART 3: FETCH TEACHER NAMES FOR NORMAL CLASSES
    // ============================================
    const teacherIds = [
      ...new Set(
        (normalClasses || [])
          .map((c) => c.arrangements?.teacher_id)
          .filter(Boolean)
      ),
    ];

    let teacherMap = {};
    if (teacherIds.length > 0) {
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("id, name")
        .in("id", teacherIds);

      teacherData?.forEach((t) => {
        teacherMap[t.id] = t.name;
      });
    }

    // ============================================
    // PART 4: FETCH TEACHER NAMES FOR GROUP CLASSES (from users table)
    // ============================================
    const groupTeacherIds = [
      ...new Set(
        groupClasses
          .map((gc) => gc.group_arrangements?.teacher_id)
          .filter(Boolean)
      ),
    ];

    let groupTeacherMap = {};
    if (groupTeacherIds.length > 0) {
      const { data: groupTeacherData } = await supabase
        .from("users")
        .select("id, name")
        .in("id", groupTeacherIds);

      groupTeacherData?.forEach((t) => {
        groupTeacherMap[t.id] = t.name;
      });
    }

    // ============================================
    // PART 5: FETCH REASONS FOR MISSING NORMAL CLASSES
    // ============================================
    const missingNormalClassIds = (normalClasses || [])
      .filter((c) => ["leave", "cancel", "not shown"].includes(c.status))
      .map((c) => c.class_id);

    let normalNotificationMap = {};

    if (missingNormalClassIds.length > 0) {
      const { data: notiData } = await supabase
        .from("notifications")
        .select("class_id, reason, issuer_id, role")
        .in("class_id", missingNormalClassIds);

      const grouped = {};
      notiData?.forEach((n) => {
        if (!grouped[n.class_id]) grouped[n.class_id] = [];
        grouped[n.class_id].push(n);
      });

      missingNormalClassIds.forEach((classId) => {
        const rows = grouped[classId];
        if (!rows || rows.length === 0) return;

        if (rows.length === 1) {
          normalNotificationMap[classId] = rows[0];
          return;
        }

        const userRow = rows.find(
          (r) => r.role === "user" || r.role === "student"
        );
        const teacherRow = rows.find((r) => r.role === "teacher");

        if (userRow) {
          normalNotificationMap[classId] = userRow;
        } else if (teacherRow) {
          normalNotificationMap[classId] = teacherRow;
        } else {
          normalNotificationMap[classId] = rows[0];
        }
      });
    }

    // ============================================
    // PART 6: FETCH REASONS FOR MISSING GROUP CLASSES
    // ============================================
    const missingGroupClassIds = groupClasses
      .filter((c) => ["leave", "cancelled", "not shown"].includes(c.status))
      .map((c) => c.class_id);

    let groupNotificationMap = {};

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
        const rows = groupedNoti[classId];
        if (!rows || rows.length === 0) return;

        if (rows.length === 1) {
          groupNotificationMap[classId] = rows[0];
          return;
        }

        const userRow = rows.find(
          (r) => r.role === "user" || r.role === "student"
        );
        const teacherRow = rows.find((r) => r.role === "teacher");

        if (userRow) {
          groupNotificationMap[classId] = userRow;
        } else if (teacherRow) {
          groupNotificationMap[classId] = teacherRow;
        } else {
          groupNotificationMap[classId] = rows[0];
        }
      });
    }

    // ============================================
    // PART 7: FETCH ISSUER NAMES
    // ============================================
    const allIssuerIds = [
      ...Object.values(normalNotificationMap).map((n) => n.issuer_id),
      ...Object.values(groupNotificationMap).map((n) => n.issuer_id),
    ].filter((id) => !!id);

    let issuerMap = {};

    if (allIssuerIds.length > 0) {
      const { data: issuerData } = await supabase
        .from("users")
        .select("id, name, role")
        .in("id", allIssuerIds);

      issuerData?.forEach((u) => {
        issuerMap[u.id] = {
          name: u.name,
          role: u.role,
        };
      });
    }

    // ============================================
    // PART 8: FORMAT NORMAL CLASSES
    // ============================================
    const formattedNormalClasses = (normalClasses || []).map((c) => {
      const notif = normalNotificationMap[c.class_id] || {};
      const issuer = issuerMap[notif.issuer_id] || {};

      return {
        id: c.id,
        class_id: c.class_id,
        batch_type: c.arrangements.batch_type || "Individual",
        status: c.status,
        type: "individual",
        arrangements: {
          subject: c.arrangements.subject,
          date: c.arrangements.date,
          day: c.arrangements.day,
          time: c.arrangements.time,
        },
        instructor_name:
          teacherMap[c.arrangements.teacher_id] ||
          c.arrangements.teacher_name ||
          "N/A",
        reason: notif.reason || null,
        issuer_name: issuer.name || null,
        issuer_role: issuer.role || null,
      };
    });

    // ============================================
    // PART 9: FORMAT GROUP CLASSES
    // ============================================
    const formattedGroupClasses = groupClasses.map((gc) => {
      const notif = groupNotificationMap[gc.class_id] || {};
      const issuer = issuerMap[notif.issuer_id] || {};
      const arr = gc.group_arrangements || {};

      // Extract date from start_time
      const startTime = gc.start_time ? new Date(gc.start_time) : null;
      const dateStr = startTime
        ? startTime.toISOString().split("T")[0]
        : arr.date;
      const dayStr = startTime
        ? startTime.toLocaleDateString("en-US", { weekday: "long" })
        : "";

      return {
        id: gc.id,
        class_id: gc.class_id,
        batch_type: "Group",
        status: gc.status === "cancelled" ? "cancel" : gc.status, // Normalize status
        type: "group",
        arrangements: {
          subject: arr.group_name || "Group Class",
          date: dateStr,
          day: dayStr,
          time: gc.start_time,
        },
        instructor_name:
          groupTeacherMap[arr.teacher_id] || arr.teacher_name || "N/A",
        reason: notif.reason || null,
        issuer_name: issuer.name || null,
        issuer_role: issuer.role || null,
        group_name: arr.group_name,
      };
    });

    // ============================================
    // PART 10: COMBINE AND SORT
    // ============================================
    const finalResult = [...formattedNormalClasses, ...formattedGroupClasses];

    console.log("📊 Class Report Final Result:", {
      normalClassesCount: formattedNormalClasses.length,
      groupClassesCount: formattedGroupClasses.length,
      totalCount: finalResult.length,
    });

    // Sort by date (newest first for completed/missing, oldest first for upcoming)
    finalResult.sort((a, b) => {
      const dateA = new Date(a.arrangements.date);
      const dateB = new Date(b.arrangements.date);
      if (status === "upcoming") {
        return dateA - dateB; // Earliest first
      }
      return dateB - dateA; // Latest first
    });

    return res.json(finalResult);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
